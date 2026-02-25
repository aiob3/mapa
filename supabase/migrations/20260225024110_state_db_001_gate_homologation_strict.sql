begin;

-- Enforce strict normalization gate values on ingestion history.
update public.canonical_ingestion_runs
set normalization_status = 'homologated'
where normalization_status = 'not_evaluated';

alter table public.canonical_ingestion_runs
  alter column normalization_status set default 'homologated';

alter table public.canonical_ingestion_runs
  drop constraint if exists canonical_ingestion_runs_normalization_status_check;

alter table public.canonical_ingestion_runs
  add constraint canonical_ingestion_runs_normalization_status_check
  check (normalization_status in ('homologated', 'requires_operator_review'));

-- Remove legacy function signature (without normalization gate params).
drop function if exists public.upsert_canonical_event_v2(
  text, text, jsonb, jsonb, jsonb, jsonb, text, text, text
);

create or replace function public.upsert_canonical_event_v2(
  p_canonical_id_v2 text,
  p_idempotency_key text,
  p_event_layer jsonb,
  p_iam_layer jsonb,
  p_raw_payload jsonb,
  p_atoms jsonb default '[]'::jsonb,
  p_legacy_id_iov text default null,
  p_legacy_io_opp text default null,
  p_legacy_iv_vdd text default null,
  p_normalization_status text default 'homologated',
  p_normalization_warnings jsonb default '[]'::jsonb,
  p_normalization_error text default null,
  p_raw_payload_text text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id bigint;
  v_existing_idempotency text;
  v_event_version integer;
  v_status text;
  v_change_detected boolean;
  v_payload_hash text;
begin
  if p_canonical_id_v2 is null or btrim(p_canonical_id_v2) = '' then
    raise exception 'p_canonical_id_v2 obrigatorio';
  end if;

  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'p_idempotency_key obrigatorio';
  end if;

  if p_normalization_status is null or lower(trim(p_normalization_status)) <> 'homologated' then
    raise exception 'Gate de homologacao: payload deve estar com normalization_status=homologated para ingestao operacional.';
  end if;

  v_payload_hash := md5(coalesce(p_raw_payload::text, ''));

  select id, idempotency_key, version
  into v_event_id, v_existing_idempotency, v_event_version
  from public.canonical_events
  where canonical_id_v2 = p_canonical_id_v2
  limit 1;

  if v_event_id is null then
    insert into public.canonical_events (
      canonical_id_v2,
      idempotency_key,
      legacy_id_iov,
      legacy_io_opp,
      legacy_iv_vdd,
      event_layer,
      iam_layer,
      raw_payload,
      version
    )
    values (
      p_canonical_id_v2,
      p_idempotency_key,
      p_legacy_id_iov,
      p_legacy_io_opp,
      p_legacy_iv_vdd,
      p_event_layer,
      p_iam_layer,
      p_raw_payload,
      1
    )
    returning id, version into v_event_id, v_event_version;

    v_status := 'inserted';
    v_change_detected := true;
  elsif v_existing_idempotency = p_idempotency_key then
    update public.canonical_events
    set updated_at = now()
    where id = v_event_id
    returning version into v_event_version;

    v_status := 'deduplicated';
    v_change_detected := false;
  else
    update public.canonical_events
    set
      idempotency_key = p_idempotency_key,
      legacy_id_iov = p_legacy_id_iov,
      legacy_io_opp = p_legacy_io_opp,
      legacy_iv_vdd = p_legacy_iv_vdd,
      event_layer = p_event_layer,
      iam_layer = p_iam_layer,
      raw_payload = p_raw_payload,
      version = version + 1,
      updated_at = now()
    where id = v_event_id
    returning version into v_event_version;

    v_status := 'updated';
    v_change_detected := true;
  end if;

  if p_legacy_id_iov is not null and btrim(p_legacy_id_iov) <> '' then
    insert into public.canonical_id_aliases (alias_type, legacy_id, canonical_id_v2)
    values ('id_iov', p_legacy_id_iov, p_canonical_id_v2)
    on conflict (alias_type, legacy_id)
    do update set canonical_id_v2 = excluded.canonical_id_v2, updated_at = now();
  end if;

  if p_legacy_io_opp is not null and btrim(p_legacy_io_opp) <> '' then
    insert into public.canonical_id_aliases (alias_type, legacy_id, canonical_id_v2)
    values ('io_opp', p_legacy_io_opp, p_canonical_id_v2)
    on conflict (alias_type, legacy_id)
    do update set canonical_id_v2 = excluded.canonical_id_v2, updated_at = now();
  end if;

  if p_legacy_iv_vdd is not null and btrim(p_legacy_iv_vdd) <> '' then
    insert into public.canonical_id_aliases (alias_type, legacy_id, canonical_id_v2)
    values ('iv_vdd', p_legacy_iv_vdd, p_canonical_id_v2)
    on conflict (alias_type, legacy_id)
    do update set canonical_id_v2 = excluded.canonical_id_v2, updated_at = now();
  end if;

  if v_change_detected then
    delete from public.canonical_atoms
    where event_id = v_event_id
      and version = v_event_version;

    insert into public.canonical_atoms (
      event_id,
      atom_key,
      raw_value,
      normalized_value,
      atom_order,
      source,
      version,
      source_ts
    )
    select
      v_event_id,
      elem->>'key',
      coalesce(elem->>'raw', ''),
      coalesce(elem->>'normalized', ''),
      coalesce((elem->>'order')::integer, 0),
      coalesce(elem->>'source', 'unknown'),
      v_event_version,
      now()
    from jsonb_array_elements(coalesce(p_atoms, '[]'::jsonb)) elem
    where (elem->>'key') in ('q', 'l', 'k', 'a', 's', 'e', 'b', 'n', 'h', 't', 'd')
      and coalesce((elem->>'order')::integer, 0) > 0;
  end if;

  insert into public.canonical_ingestion_runs (
    event_id,
    canonical_id_v2,
    idempotency_key,
    ingestion_status,
    normalization_status,
    normalization_warnings,
    normalization_error,
    raw_payload_text,
    normalized_payload,
    change_detected,
    payload_hash,
    notes
  )
  values (
    v_event_id,
    p_canonical_id_v2,
    p_idempotency_key,
    v_status,
    lower(trim(p_normalization_status)),
    coalesce(p_normalization_warnings, '[]'::jsonb),
    p_normalization_error,
    coalesce(p_raw_payload_text, p_raw_payload::text),
    p_raw_payload,
    v_change_detected,
    v_payload_hash,
    null
  );

  return v_event_id;
end;
$$;

revoke all on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, jsonb, text, text) from public;
grant execute on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, jsonb, text, text) to authenticated;

commit;
