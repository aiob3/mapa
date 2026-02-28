-- STATE-DB-007
-- Hostinger VPS target schema for replication v1 (deals-only)
-- PostgreSQL 16+

begin;

create schema if not exists replica_stage;
create schema if not exists replica_live;

create table if not exists public.replication_runs_v1 (
  run_id text primary key,
  source_system text not null,
  source_entity text not null,
  watermark_start timestamptz not null,
  watermark_end timestamptz not null,
  status text not null check (status in ('started', 'imported', 'reconciled', 'failed')),
  row_count bigint not null default 0,
  imported_count bigint not null default 0,
  reconciled_count bigint not null default 0,
  only_source_count bigint not null default 0,
  only_target_count bigint not null default 0,
  drift_count bigint not null default 0,
  snapshot_sha256 text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists replication_runs_v1_status_idx
  on public.replication_runs_v1 (status, started_at desc);

create table if not exists replica_stage.canonical_events_deals_v1 (
  canonical_id_v2 text primary key,
  source_id text not null,
  canonical_subject_id text not null,
  idempotency_key text not null unique,
  entity_kind text not null check (entity_kind = 'deal'),
  status text not null,
  event_layer jsonb not null,
  iam_layer jsonb not null,
  raw_payload jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  source_watermark_start timestamptz not null,
  source_watermark_end timestamptz not null,
  run_id text not null references public.replication_runs_v1(run_id) on delete cascade,
  replicated_at timestamptz not null default now()
);

create index if not exists stage_deals_run_idx
  on replica_stage.canonical_events_deals_v1 (run_id, updated_at desc);

create table if not exists replica_live.canonical_events_deals_v1 (
  canonical_id_v2 text primary key,
  source_id text not null,
  canonical_subject_id text not null,
  idempotency_key text not null unique,
  entity_kind text not null check (entity_kind = 'deal'),
  status text not null,
  event_layer jsonb not null,
  iam_layer jsonb not null,
  raw_payload jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  source_watermark_start timestamptz not null,
  source_watermark_end timestamptz not null,
  run_id text not null,
  replicated_at timestamptz not null default now()
);

create index if not exists live_deals_updated_idx
  on replica_live.canonical_events_deals_v1 (updated_at desc);

create or replace function public.promote_replication_run_v1(p_run_id text)
returns bigint
language plpgsql
security definer
set search_path = public, replica_stage, replica_live
as $$
declare
  v_rows bigint := 0;
begin
  if p_run_id is null or btrim(p_run_id) = '' then
    raise exception 'p_run_id obrigatorio';
  end if;

  insert into replica_live.canonical_events_deals_v1 (
    canonical_id_v2,
    source_id,
    canonical_subject_id,
    idempotency_key,
    entity_kind,
    status,
    event_layer,
    iam_layer,
    raw_payload,
    created_at,
    updated_at,
    source_watermark_start,
    source_watermark_end,
    run_id,
    replicated_at
  )
  select
    s.canonical_id_v2,
    s.source_id,
    s.canonical_subject_id,
    s.idempotency_key,
    s.entity_kind,
    s.status,
    s.event_layer,
    s.iam_layer,
    s.raw_payload,
    s.created_at,
    s.updated_at,
    s.source_watermark_start,
    s.source_watermark_end,
    s.run_id,
    now()
  from replica_stage.canonical_events_deals_v1 s
  where s.run_id = p_run_id
  on conflict (canonical_id_v2)
  do update set
    canonical_id_v2 = excluded.canonical_id_v2,
    source_id = excluded.source_id,
    canonical_subject_id = excluded.canonical_subject_id,
    idempotency_key = excluded.idempotency_key,
    entity_kind = excluded.entity_kind,
    status = excluded.status,
    event_layer = excluded.event_layer,
    iam_layer = excluded.iam_layer,
    raw_payload = excluded.raw_payload,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at,
    source_watermark_start = excluded.source_watermark_start,
    source_watermark_end = excluded.source_watermark_end,
    run_id = excluded.run_id,
    replicated_at = now()
  where excluded.updated_at >= replica_live.canonical_events_deals_v1.updated_at;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

-- Optional role bootstrap for VPS-managed Postgres.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'replicator_writer') then
    create role replicator_writer login;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'replica_reader') then
    create role replica_reader login;
  end if;
end
$$;

grant usage on schema replica_stage to replicator_writer;
grant usage on schema replica_live to replicator_writer;
grant usage on schema replica_live to replica_reader;

grant select, insert, update, delete on replica_stage.canonical_events_deals_v1 to replicator_writer;
grant select, insert, update on replica_live.canonical_events_deals_v1 to replicator_writer;
grant select, insert, update on public.replication_runs_v1 to replicator_writer;
grant execute on function public.promote_replication_run_v1(text) to replicator_writer;

grant select on replica_live.canonical_events_deals_v1 to replica_reader;

commit;
