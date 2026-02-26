begin;

create table if not exists public.canonical_source_registry_v1 (
  id bigserial primary key,
  source_system text not null,
  source_entity text not null,
  source_id text not null,
  canonical_subject_id text not null,
  canonical_id_v2 text not null references public.canonical_events(canonical_id_v2) on delete cascade,
  idempotency_key text not null,
  payload_hash text not null,
  source_updated_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  dedupe_hits integer not null default 0 check (dedupe_hits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, source_entity, source_id, payload_hash)
);

create index if not exists canonical_source_registry_subject_idx
  on public.canonical_source_registry_v1 (canonical_subject_id, source_updated_at desc);

create index if not exists canonical_source_registry_canonical_id_idx
  on public.canonical_source_registry_v1 (canonical_id_v2);

drop trigger if exists trg_canonical_source_registry_set_updated_at on public.canonical_source_registry_v1;
create trigger trg_canonical_source_registry_set_updated_at
before update on public.canonical_source_registry_v1
for each row execute procedure public.set_updated_at();

create or replace function public.upsert_canonical_source_registry_v1(
  p_source_system text,
  p_source_entity text,
  p_source_id text,
  p_canonical_subject_id text,
  p_canonical_id_v2 text,
  p_idempotency_key text,
  p_payload_hash text,
  p_source_updated_at timestamptz default null
)
returns public.canonical_source_registry_v1
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.canonical_source_registry_v1;
begin
  if p_source_system is null or btrim(p_source_system) = '' then
    raise exception 'p_source_system obrigatorio';
  end if;

  if p_source_entity is null or btrim(p_source_entity) = '' then
    raise exception 'p_source_entity obrigatorio';
  end if;

  if p_source_id is null or btrim(p_source_id) = '' then
    raise exception 'p_source_id obrigatorio';
  end if;

  if p_canonical_subject_id is null or btrim(p_canonical_subject_id) = '' then
    raise exception 'p_canonical_subject_id obrigatorio';
  end if;

  if p_canonical_id_v2 is null or btrim(p_canonical_id_v2) = '' then
    raise exception 'p_canonical_id_v2 obrigatorio';
  end if;

  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'p_idempotency_key obrigatorio';
  end if;

  if p_payload_hash is null or btrim(p_payload_hash) = '' then
    raise exception 'p_payload_hash obrigatorio';
  end if;

  insert into public.canonical_source_registry_v1 (
    source_system,
    source_entity,
    source_id,
    canonical_subject_id,
    canonical_id_v2,
    idempotency_key,
    payload_hash,
    source_updated_at,
    first_seen_at,
    last_seen_at,
    dedupe_hits
  )
  values (
    lower(trim(p_source_system)),
    lower(trim(p_source_entity)),
    trim(p_source_id),
    trim(p_canonical_subject_id),
    trim(p_canonical_id_v2),
    trim(p_idempotency_key),
    lower(trim(p_payload_hash)),
    p_source_updated_at,
    now(),
    now(),
    0
  )
  on conflict (source_system, source_entity, source_id, payload_hash)
  do update
    set
      canonical_subject_id = excluded.canonical_subject_id,
      canonical_id_v2 = excluded.canonical_id_v2,
      idempotency_key = excluded.idempotency_key,
      source_updated_at = coalesce(excluded.source_updated_at, public.canonical_source_registry_v1.source_updated_at),
      last_seen_at = now(),
      dedupe_hits = public.canonical_source_registry_v1.dedupe_hits + 1,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.upsert_canonical_source_registry_v1(text, text, text, text, text, text, text, timestamptz) from public;
grant execute on function public.upsert_canonical_source_registry_v1(text, text, text, text, text, text, text, timestamptz) to authenticated;

alter table public.canonical_source_registry_v1 enable row level security;

drop policy if exists canonical_source_registry_select_authenticated on public.canonical_source_registry_v1;
create policy canonical_source_registry_select_authenticated
  on public.canonical_source_registry_v1
  for select
  to authenticated
  using (true);

grant select on public.canonical_source_registry_v1 to authenticated;

commit;
