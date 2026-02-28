begin;

-- STATE-DB-007
-- Isolamento semântico da camada publicada Syn para escopo v1 (deals-only).
-- Fecha o bloqueio GATE-008 sem alterar contratos públicos api_syn_*_v1.

create or replace view public.api_syn_leads_view_v1 as
with scoped_events as (
  select
    ce.id,
    ce.canonical_id_v2,
    ce.updated_at,
    ce.event_layer,
    ce.iam_layer,
    ce.raw_payload
  from public.canonical_events ce
  where ce.status = 'active'
    and lower(
      coalesce(
        nullif(ce.event_layer ->> 'entity_kind', ''),
        nullif(ce.raw_payload ->> 'entity_kind', ''),
        ''
      )
    ) = 'deal'
    and public.can_access_syn_analytics()
    and (
      public.is_administrator(auth.uid())
      or coalesce(nullif(ce.iam_layer ->> 'owner_user_id', ''), auth.uid()::text) = auth.uid()::text
    )
)
select
  se.id::text as id,
  coalesce(nullif(se.event_layer ->> 'lead_name', ''), nullif(se.raw_payload ->> 'lead_name', ''), 'Lead ' || substring(se.canonical_id_v2 from 1 for 6)) as name,
  coalesce(nullif(se.event_layer ->> 'company', ''), nullif(se.raw_payload ->> 'company', ''), 'Conta sem nome') as company,
  coalesce(nullif(se.event_layer ->> 'sector', ''), nullif(se.raw_payload ->> 'sector', ''), 'Geral') as sector,
  coalesce(nullif(se.event_layer ->> 'region', ''), nullif(se.raw_payload ->> 'region', ''), 'Sem região') as region,
  coalesce(nullif(se.event_layer ->> 'location', ''), nullif(se.raw_payload ->> 'location', ''), 'N/A') as location,
  greatest(0, public.parse_numeric_safe(coalesce(se.event_layer ->> 'deal_value', se.raw_payload ->> 'deal_value'), 0)) as deal_value,
  greatest(0, least(100, round(public.parse_numeric_safe(coalesce(se.event_layer ->> 'score', se.raw_payload ->> 'score'), 50))))::integer as score,
  coalesce(nullif(se.event_layer ->> 'status', ''), nullif(se.raw_payload ->> 'status', ''),
    case
      when public.parse_numeric_safe(coalesce(se.event_layer ->> 'score', se.raw_payload ->> 'score'), 50) >= 80 then 'Quente'
      when public.parse_numeric_safe(coalesce(se.event_layer ->> 'score', se.raw_payload ->> 'score'), 50) >= 60 then 'Morno'
      else 'Frio'
    end
  ) as status,
  coalesce(nullif(se.event_layer ->> 'status_color', ''), nullif(se.raw_payload ->> 'status_color', ''),
    case
      when public.parse_numeric_safe(coalesce(se.event_layer ->> 'score', se.raw_payload ->> 'score'), 50) >= 80 then '#C64928'
      when public.parse_numeric_safe(coalesce(se.event_layer ->> 'score', se.raw_payload ->> 'score'), 50) >= 60 then '#F59E0B'
      else '#6B7280'
    end
  ) as status_color,
  greatest(0, least(100, public.parse_numeric_safe(coalesce(se.event_layer ->> 'open_rate', se.raw_payload ->> 'open_rate'), 0))) as open_rate,
  greatest(0, least(100, public.parse_numeric_safe(coalesce(se.event_layer ->> 'click_rate', se.raw_payload ->> 'click_rate'), 0))) as click_rate,
  coalesce(nullif(se.event_layer ->> 'tone', ''), nullif(se.raw_payload ->> 'tone', ''), 'ANALÍTICO') as tone,
  coalesce(nullif(se.event_layer ->> 'tone_color', ''), nullif(se.raw_payload ->> 'tone_color', ''), '#4A6FA5') as tone_color,
  greatest(0, least(10, public.parse_numeric_safe(coalesce(se.event_layer ->> 'score_ia', se.raw_payload ->> 'score_ia'), 0))) as score_ia,
  se.updated_at
from scoped_events se
order by se.updated_at desc;

create or replace view public.api_syn_kpis_view_v1 as
with leads as (
  select * from public.api_syn_leads_view_v1
),
ingestion as (
  select count(*)::integer as monitored
  from public.canonical_ingestion_runs cir
  join public.canonical_events ce on ce.id = cir.event_id
  where ce.status = 'active'
    and lower(
      coalesce(
        nullif(ce.event_layer ->> 'entity_kind', ''),
        nullif(ce.raw_payload ->> 'entity_kind', ''),
        ''
      )
    ) = 'deal'
    and public.can_access_syn_analytics()
    and (
      public.is_administrator(auth.uid())
      or coalesce(nullif(ce.iam_layer ->> 'owner_user_id', ''), auth.uid()::text) = auth.uid()::text
    )
)
select
  coalesce((select count(*) from leads), 0)::integer as leads_ativos,
  coalesce((select count(*) from leads where score >= 70), 0)::integer as contratos_vigentes,
  coalesce((select count(*) from leads where score < 70), 0)::integer as leads_em_aberto,
  coalesce((select monitored from ingestion), 0)::integer as eventos_monitorados,
  coalesce((select sum(deal_value) from leads), 0)::numeric as pipeline_total,
  coalesce((select round(avg(score), 2) from leads), 0)::numeric as win_rate,
  coalesce((select sum(deal_value) from leads where score < 60), 0)::numeric as at_risk_value,
  coalesce((select round(avg(open_rate), 2) from leads), 0)::numeric as conversion_rate,
  coalesce((select round(avg(open_rate) - avg(click_rate), 2) from leads), 0)::numeric as conversion_delta,
  coalesce((select monitored from ingestion), 0)::integer * 3 as scripts_generated,
  coalesce((select round(avg(score) * 0.3, 2) from leads), 0)::numeric as arr_growth;

grant select on public.api_syn_leads_view_v1 to authenticated;
grant select on public.api_syn_kpis_view_v1 to authenticated;

commit;
