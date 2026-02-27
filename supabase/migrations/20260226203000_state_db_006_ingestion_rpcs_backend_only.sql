begin;

-- Ingestão canônica deve ser backend-only (service_role), nunca cliente authenticated.
revoke execute on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, jsonb, text, text) from authenticated;
grant execute on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, jsonb, text, text) to service_role;

revoke execute on function public.upsert_canonical_source_registry_v1(text, text, text, text, text, text, text, timestamptz) from authenticated;
grant execute on function public.upsert_canonical_source_registry_v1(text, text, text, text, text, text, text, timestamptz) to service_role;

-- Registry de origem não precisa ser lido por cliente.
revoke select on public.canonical_source_registry_v1 from authenticated;
grant select on public.canonical_source_registry_v1 to service_role;

drop policy if exists canonical_source_registry_select_authenticated on public.canonical_source_registry_v1;
drop policy if exists canonical_source_registry_select_service_role on public.canonical_source_registry_v1;
create policy canonical_source_registry_select_service_role
  on public.canonical_source_registry_v1
  for select
  to service_role
  using (true);

commit;
