-- STATE-DB-001 (PROPOSTA)
-- Objetivo: baseline de autenticação e autorização por módulo (RBAC)
-- Premissas iniciais:
-- - Administrator = Full
-- - Guest = Read (segmentado por módulo visível na interface principal)
-- - Extensível para novas funcionalidades, modais e campos incrementais
-- Status: PROPOSTA PARA APROVACAO (nao aplicar sem aval do operador)

begin;

-- 1) Tabela de perfil vinculada ao auth.users
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Catalogo de modulos da aplicacao
create table if not exists public.modules (
  id bigserial primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  ui_label text not null,
  route_path text not null unique check (left(route_path, 1) = '/'),
  description text,
  sort_order integer not null default 100,
  is_visible_in_main boolean not null default true,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Perfis de acesso (papeis)
create table if not exists public.roles (
  id bigserial primary key,
  slug text not null unique check (slug ~ '^[a-z0-9_]+$'),
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Permissoes por modulo e acao
create table if not exists public.permissions (
  id bigserial primary key,
  module_id bigint not null references public.modules(id) on delete cascade,
  action text not null check (action ~ '^[a-z][a-z0-9_]*$'),
  resource_kind text not null default 'module' check (resource_kind in ('module', 'feature', 'modal', 'field')),
  resource_key text not null default '*',
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (module_id, action, resource_kind, resource_key)
);

-- 5) Relacao papel -> permissao
create table if not exists public.role_permissions (
  role_id bigint not null references public.roles(id) on delete cascade,
  permission_id bigint not null references public.permissions(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- 6) Relacao usuario -> papel (global ou por modulo)
create table if not exists public.user_roles (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete cascade,
  scope_module_id bigint references public.modules(id) on delete cascade,
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  check (expires_at is null or expires_at > assigned_at)
);

create unique index if not exists user_roles_unique_global_idx
  on public.user_roles (user_id, role_id)
  where scope_module_id is null;

create unique index if not exists user_roles_unique_scoped_idx
  on public.user_roles (user_id, role_id, scope_module_id)
  where scope_module_id is not null;

create index if not exists user_roles_lookup_idx
  on public.user_roles (user_id, role_id, is_active, expires_at);

create index if not exists permissions_lookup_idx
  on public.permissions (module_id, action, resource_kind, resource_key);

-- 6.1) Camada Canonical V2 (dual-write + alias reversivel)
-- Pre-requisito de ingestao: payload originario passa por homologacao JSON
-- (quando invalido, deve ser encapsulado em envelope de depuracao antes de persistir).
create table if not exists public.canonical_events (
  id bigserial primary key,
  canonical_id_v2 text not null unique,
  idempotency_key text not null,
  legacy_id_iov text,
  legacy_io_opp text,
  legacy_iv_vdd text,
  event_layer jsonb not null,
  iam_layer jsonb not null,
  raw_payload jsonb not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists canonical_events_idempotency_uk
  on public.canonical_events (idempotency_key);

create index if not exists canonical_events_legacy_iov_idx
  on public.canonical_events (legacy_id_iov);

create index if not exists canonical_events_legacy_io_opp_idx
  on public.canonical_events (legacy_io_opp);

create index if not exists canonical_events_legacy_iv_vdd_idx
  on public.canonical_events (legacy_iv_vdd);

create table if not exists public.canonical_atoms (
  id bigserial primary key,
  event_id bigint not null references public.canonical_events(id) on delete cascade,
  atom_key text not null check (atom_key in ('q', 'l', 'k', 'a', 's', 'e', 'b', 'n', 'h', 't', 'd')),
  raw_value text not null,
  normalized_value text not null,
  atom_order integer not null check (atom_order > 0),
  source text not null,
  version integer not null default 1,
  source_ts timestamptz not null default now(),
  unique (event_id, atom_key, version, atom_order)
);

create index if not exists canonical_atoms_event_version_idx
  on public.canonical_atoms (event_id, version, atom_order);

create table if not exists public.canonical_id_aliases (
  id bigserial primary key,
  alias_type text not null check (alias_type in ('id_iov', 'io_opp', 'iv_vdd')),
  legacy_id text not null,
  canonical_id_v2 text not null references public.canonical_events(canonical_id_v2) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (alias_type, legacy_id)
);

create index if not exists canonical_id_aliases_canonical_idx
  on public.canonical_id_aliases (canonical_id_v2);

create table if not exists public.canonical_ingestion_runs (
  id bigserial primary key,
  event_id bigint references public.canonical_events(id) on delete set null,
  canonical_id_v2 text not null,
  idempotency_key text not null,
  ingestion_status text not null check (ingestion_status in ('inserted', 'updated', 'deduplicated', 'rejected')),
  normalization_status text not null default 'not_evaluated'
    check (normalization_status in ('homologated', 'requires_operator_review', 'not_evaluated')),
  normalization_warnings jsonb not null default '[]'::jsonb,
  normalization_error text,
  raw_payload_text text,
  normalized_payload jsonb,
  change_detected boolean not null default false,
  payload_hash text not null,
  notes text,
  processed_at timestamptz not null default now()
);

create index if not exists canonical_ingestion_runs_event_idx
  on public.canonical_ingestion_runs (event_id, processed_at desc);

create index if not exists canonical_ingestion_runs_status_idx
  on public.canonical_ingestion_runs (ingestion_status, processed_at desc);

-- 7) Trigger generico de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_modules_set_updated_at on public.modules;
create trigger trg_modules_set_updated_at
before update on public.modules
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_roles_set_updated_at on public.roles;
create trigger trg_roles_set_updated_at
before update on public.roles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_canonical_events_set_updated_at on public.canonical_events;
create trigger trg_canonical_events_set_updated_at
before update on public.canonical_events
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_canonical_id_aliases_set_updated_at on public.canonical_id_aliases;
create trigger trg_canonical_id_aliases_set_updated_at
before update on public.canonical_id_aliases
for each row execute procedure public.set_updated_at();

-- 8) Bootstrap de profile apos signup no Supabase Auth
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );

  -- Todo usuario novo entra como guest (leitura) por padrao.
  insert into public.user_roles (user_id, role_id, scope_module_id, is_active, assigned_by)
  select new.id, r.id, null, true, null
  from public.roles r
  where r.slug = 'guest'
    and not exists (
      select 1
      from public.user_roles ur
      where ur.user_id = new.id
        and ur.role_id = r.id
        and ur.scope_module_id is null
    );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- 9) Funcoes de autorizacao por modulo (gate para frontend + API)
create or replace function public.has_module_permission(
  p_module_slug text,
  p_action text,
  p_resource_kind text default 'module',
  p_resource_key text default '*'
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with valid_action as (
    select lower(trim(p_action)) as action
  ),
  perm_match as (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    join public.modules m on m.id = p.module_id
    join valid_action va on true
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and (ur.expires_at is null or ur.expires_at > now())
      and m.is_active = true
      and m.slug = p_module_slug
      and (ur.scope_module_id is null or ur.scope_module_id = m.id)
      and p.resource_kind = lower(trim(p_resource_kind))
      and (
        p.resource_key = p_resource_key
        or p.resource_key = '*'
      )
      and (
        p.action = va.action
        or p.action = 'full'
      )
  )
  select exists(select 1 from perm_match);
$$;

create or replace function public.can_access_module(
  p_module_slug text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.has_module_permission(p_module_slug, 'read', 'module', '*');
$$;

create or replace function public.is_administrator(p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = p_user_id
      and ur.is_active = true
      and (ur.expires_at is null or ur.expires_at > now())
      and r.slug = 'administrator'
      and ur.scope_module_id is null
  );
$$;

create or replace function public.grant_administrator_by_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_user_id uuid;
  v_admin_role_id bigint;
begin
  if p_email is null or btrim(p_email) = '' then
    raise exception 'Parametro p_email obrigatorio';
  end if;

  select u.id
  into v_target_user_id
  from auth.users u
  where lower(u.email) = lower(p_email)
  limit 1;

  if v_target_user_id is null then
    raise exception 'Usuario nao encontrado em auth.users para email: %', p_email;
  end if;

  if auth.role() <> 'service_role' and not public.is_administrator(auth.uid()) then
    raise exception 'Somente service_role ou administrator pode conceder acesso administrator';
  end if;

  select id
  into v_admin_role_id
  from public.roles
  where slug = 'administrator'
  limit 1;

  if v_admin_role_id is null then
    raise exception 'Role administrator nao encontrada';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    where ur.user_id = v_target_user_id
      and ur.role_id = v_admin_role_id
      and ur.scope_module_id is null
  ) then
    update public.user_roles
    set is_active = true,
        expires_at = null,
        assigned_by = coalesce(auth.uid(), assigned_by),
        assigned_at = now()
    where user_id = v_target_user_id
      and role_id = v_admin_role_id
      and scope_module_id is null;
  else
    insert into public.user_roles (user_id, role_id, scope_module_id, is_active, assigned_by)
    values (v_target_user_id, v_admin_role_id, null, true, auth.uid());
  end if;
end;
$$;

create or replace function public.upsert_canonical_event_v2(
  p_canonical_id_v2 text,
  p_idempotency_key text,
  p_event_layer jsonb,
  p_iam_layer jsonb,
  p_raw_payload jsonb,
  p_atoms jsonb default '[]'::jsonb,
  p_legacy_id_iov text default null,
  p_legacy_io_opp text default null,
  p_legacy_iv_vdd text default null
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
    'not_evaluated',
    '[]'::jsonb,
    null,
    p_raw_payload::text,
    p_raw_payload,
    v_change_detected,
    v_payload_hash,
    null
  );

  return v_event_id;
end;
$$;

revoke all on function public.has_module_permission(text, text, text, text) from public;
revoke all on function public.can_access_module(text) from public;
revoke all on function public.is_administrator(uuid) from public;
revoke all on function public.grant_administrator_by_email(text) from public;
revoke all on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text) from public;
grant execute on function public.has_module_permission(text, text, text, text) to authenticated;
grant execute on function public.can_access_module(text) to authenticated;
grant execute on function public.is_administrator(uuid) to authenticated;
grant execute on function public.grant_administrator_by_email(text) to authenticated;
grant execute on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text) to authenticated;

-- 10) RLS baseline
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.modules enable row level security;
alter table public.canonical_events enable row level security;
alter table public.canonical_atoms enable row level security;
alter table public.canonical_id_aliases enable row level security;
alter table public.canonical_ingestion_runs enable row level security;

-- profiles: usuario so enxerga/edita seu proprio perfil
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- leitura de catalogos RBAC para usuarios autenticados
drop policy if exists modules_select_authenticated on public.modules;
create policy modules_select_authenticated
  on public.modules
  for select
  to authenticated
  using (true);

drop policy if exists roles_select_authenticated on public.roles;
create policy roles_select_authenticated
  on public.roles
  for select
  to authenticated
  using (true);

drop policy if exists permissions_select_authenticated on public.permissions;
create policy permissions_select_authenticated
  on public.permissions
  for select
  to authenticated
  using (true);

drop policy if exists role_permissions_select_authenticated on public.role_permissions;
create policy role_permissions_select_authenticated
  on public.role_permissions
  for select
  to authenticated
  using (true);

-- user_roles: cada usuario ve apenas seus vinculos ativos/inativos
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists canonical_events_select_authenticated on public.canonical_events;
create policy canonical_events_select_authenticated
  on public.canonical_events
  for select
  to authenticated
  using (true);

drop policy if exists canonical_atoms_select_authenticated on public.canonical_atoms;
create policy canonical_atoms_select_authenticated
  on public.canonical_atoms
  for select
  to authenticated
  using (true);

drop policy if exists canonical_id_aliases_select_authenticated on public.canonical_id_aliases;
create policy canonical_id_aliases_select_authenticated
  on public.canonical_id_aliases
  for select
  to authenticated
  using (true);

drop policy if exists canonical_ingestion_runs_select_authenticated on public.canonical_ingestion_runs;
create policy canonical_ingestion_runs_select_authenticated
  on public.canonical_ingestion_runs
  for select
  to authenticated
  using (true);

-- grants minimos para PostgREST/RPC
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select on public.modules to authenticated;
grant select on public.roles to authenticated;
grant select on public.permissions to authenticated;
grant select on public.role_permissions to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.canonical_events to authenticated;
grant select on public.canonical_atoms to authenticated;
grant select on public.canonical_id_aliases to authenticated;
grant select on public.canonical_ingestion_runs to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- 11) Seed inicial de modulos
insert into public.modules (slug, name, ui_label, route_path, description, sort_order, is_visible_in_main, metadata) values
  ('mapa-syn', 'MAPA Syn', 'MAPA Syn', '/dashboard', 'Dashboard principal e narrativas executivas', 10, true, '{"category":"core"}'::jsonb),
  ('war-room', 'War Room', 'War Room', '/war-room', 'Gestao visual de deals e priorizacao', 20, true, '{"category":"core"}'::jsonb),
  ('the-bridge', 'The Bridge', 'The Bridge', '/bridge', 'Camada de alinhamento entre estrategia e execucao', 30, true, '{"category":"core"}'::jsonb),
  ('team-hub', 'Team Hub', 'Team Hub', '/team', 'Operacao de equipe e colaboracao', 40, true, '{"category":"core"}'::jsonb),
  ('synapse', 'Synapse', 'Synapse', '/analytics', 'Inteligencia de suporte a decisao', 50, true, '{"category":"core"}'::jsonb),
  ('the-vault', 'The Vault', 'The Vault', '/vault', 'Repositorio de ativos e conhecimento', 60, true, '{"category":"core"}'::jsonb)
on conflict (slug) do nothing;

-- 12) Seed inicial de papeis
insert into public.roles (slug, name, description, is_system) values
  ('administrator', 'Administrador', 'Acesso total entre modulos e recursos', true),
  ('guest', 'Convidado', 'Acesso de leitura por modulo visivel', true)
on conflict (slug) do nothing;

-- 13) Seed de permissoes por modulo (read/write/full)
insert into public.permissions (module_id, action, resource_kind, resource_key, description)
select m.id, a.action, 'module', '*', m.name || ' - ' || a.action
from public.modules m
cross join (values ('read'), ('write'), ('full')) as a(action)
on conflict (module_id, action, resource_kind, resource_key) do nothing;

-- 14) Administrator recebe todas as permissoes
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on true
where r.slug = 'administrator'
on conflict (role_id, permission_id) do nothing;

-- 15) Guest recebe somente leitura de modulo visivel
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.action = 'read' and p.resource_kind = 'module' and p.resource_key = '*'
join public.modules m on m.id = p.module_id and m.is_visible_in_main = true and m.is_active = true
where r.slug = 'guest'
on conflict (role_id, permission_id) do nothing;

-- 16) Backfill: todo usuario existente sem role global recebe guest
insert into public.user_roles (user_id, role_id, scope_module_id, is_active, assigned_by)
select u.id, r.id, null, true, null
from auth.users u
join public.roles r on r.slug = 'guest'
where not exists (
  select 1
  from public.user_roles ur
  where ur.user_id = u.id
    and ur.role_id = r.id
    and ur.scope_module_id is null
);

-- 17) Exemplo de promocao de administrador (executar somente apos aprovacao):
-- select public.grant_administrator_by_email('admin@empresa.com');

commit;
