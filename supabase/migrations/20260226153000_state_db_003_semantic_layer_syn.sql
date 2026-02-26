begin;

alter table public.canonical_events
  add column if not exists semantic_layer jsonb not null default '{}'::jsonb;

alter table public.canonical_events
  drop constraint if exists canonical_events_semantic_layer_is_object;

alter table public.canonical_events
  add constraint canonical_events_semantic_layer_is_object
  check (jsonb_typeof(semantic_layer) = 'object');

create or replace function public.syn_normalize_semantic_layer(p_semantic jsonb)
returns jsonb
language sql
immutable
as $$
  with s as (
    select coalesce(p_semantic, '{}'::jsonb) as v
  )
  select jsonb_build_object(
    'causal_hypotheses', case when jsonb_typeof(v -> 'causal_hypotheses') = 'array' then v -> 'causal_hypotheses' else '[]'::jsonb end,
    'counterintuitive_signals', case when jsonb_typeof(v -> 'counterintuitive_signals') = 'array' then v -> 'counterintuitive_signals' else '[]'::jsonb end,
    'relational_conflicts', case when jsonb_typeof(v -> 'relational_conflicts') = 'array' then v -> 'relational_conflicts' else '[]'::jsonb end,
    'inflection_points', case when jsonb_typeof(v -> 'inflection_points') = 'array' then v -> 'inflection_points' else '[]'::jsonb end,
    'tacit_basis', case when jsonb_typeof(v -> 'tacit_basis') = 'array' then v -> 'tacit_basis' else '[]'::jsonb end,
    'tactical_formula', jsonb_build_object(
      'action', coalesce(v -> 'tactical_formula' ->> 'action', ''),
      'owner', coalesce(v -> 'tactical_formula' ->> 'owner', ''),
      'timing', coalesce(v -> 'tactical_formula' ->> 'timing', ''),
      'expected_outcome', coalesce(v -> 'tactical_formula' ->> 'expected_outcome', '')
    ),
    'executive_summary', coalesce(nullif(btrim(v ->> 'executive_summary'), ''), '')
  )
  from s;
$$;

update public.canonical_events ce
set semantic_layer = public.syn_normalize_semantic_layer(
  coalesce(
    case when jsonb_typeof(ce.semantic_layer) = 'object' then ce.semantic_layer end,
    case when jsonb_typeof(ce.event_layer -> 'semantic_layer') = 'object' then ce.event_layer -> 'semantic_layer' end,
    case when jsonb_typeof(ce.raw_payload -> 'semantic_layer') = 'object' then ce.raw_payload -> 'semantic_layer' end,
    '{}'::jsonb
  )
)
where ce.status in ('active', 'archived');

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
  v_semantic_layer jsonb;
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

  v_semantic_layer := public.syn_normalize_semantic_layer(
    coalesce(
      case when jsonb_typeof(p_event_layer -> 'semantic_layer') = 'object' then p_event_layer -> 'semantic_layer' end,
      case when jsonb_typeof(p_raw_payload -> 'semantic_layer') = 'object' then p_raw_payload -> 'semantic_layer' end,
      '{}'::jsonb
    )
  );

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
      semantic_layer,
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
      v_semantic_layer,
      1
    )
    returning id, version into v_event_id, v_event_version;

    v_status := 'inserted';
    v_change_detected := true;
  elsif v_existing_idempotency = p_idempotency_key then
    update public.canonical_events
    set
      semantic_layer = case
        when semantic_layer is distinct from v_semantic_layer then v_semantic_layer
        else semantic_layer
      end,
      updated_at = now()
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
      semantic_layer = v_semantic_layer,
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

create or replace view public.api_syn_leads_view_v1 as
with scoped_events as (
  select
    ce.id,
    ce.canonical_id_v2,
    ce.updated_at,
    ce.event_layer,
    ce.iam_layer,
    ce.raw_payload,
    ce.semantic_layer
  from public.canonical_events ce
  where ce.status = 'active'
    and public.can_access_syn_analytics()
    and (
      public.is_administrator(auth.uid())
      or coalesce(nullif(ce.iam_layer ->> 'owner_user_id', ''), auth.uid()::text) = auth.uid()::text
    )
),
semantic_enriched as (
  select
    se.*,
    public.syn_normalize_semantic_layer(
      coalesce(
        case when jsonb_typeof(se.semantic_layer) = 'object' then se.semantic_layer end,
        case when jsonb_typeof(se.event_layer -> 'semantic_layer') = 'object' then se.event_layer -> 'semantic_layer' end,
        case when jsonb_typeof(se.raw_payload -> 'semantic_layer') = 'object' then se.raw_payload -> 'semantic_layer' end,
        '{}'::jsonb
      )
    ) as normalized_semantic
  from scoped_events se
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
  se.normalized_semantic as semantic_layer,
  jsonb_array_length(se.normalized_semantic -> 'causal_hypotheses')::integer as causal_hypotheses_count,
  jsonb_array_length(se.normalized_semantic -> 'counterintuitive_signals')::integer as counterintuitive_signals_count,
  jsonb_array_length(se.normalized_semantic -> 'relational_conflicts')::integer as relational_conflicts_count,
  jsonb_array_length(se.normalized_semantic -> 'inflection_points')::integer as inflection_points_count,
  jsonb_array_length(se.normalized_semantic -> 'tacit_basis')::integer as tacit_basis_count,
  coalesce(se.normalized_semantic ->> 'executive_summary', '') as executive_summary,
  se.normalized_semantic -> 'tactical_formula' as tactical_formula,
  se.updated_at
from semantic_enriched se
order by se.updated_at desc;

create or replace function public.api_syn_leads_v1()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', l.id,
        'name', l.name,
        'company', l.company,
        'sector', l.sector,
        'region', l.region,
        'location', l.location,
        'dealValue', l.deal_value,
        'score', l.score,
        'status', l.status,
        'statusColor', l.status_color,
        'openRate', l.open_rate,
        'clickRate', l.click_rate,
        'tone', l.tone,
        'toneColor', l.tone_color,
        'scoreIA', l.score_ia,
        'semanticLayer', jsonb_build_object(
          'causalHypotheses', coalesce(l.semantic_layer -> 'causal_hypotheses', '[]'::jsonb),
          'counterintuitiveSignals', coalesce(l.semantic_layer -> 'counterintuitive_signals', '[]'::jsonb),
          'relationalConflicts', coalesce(l.semantic_layer -> 'relational_conflicts', '[]'::jsonb),
          'inflectionPoints', coalesce(l.semantic_layer -> 'inflection_points', '[]'::jsonb),
          'tacitBasis', coalesce(l.semantic_layer -> 'tacit_basis', '[]'::jsonb),
          'tacticalFormula', jsonb_build_object(
            'action', coalesce(l.tactical_formula ->> 'action', ''),
            'owner', coalesce(l.tactical_formula ->> 'owner', ''),
            'timing', coalesce(l.tactical_formula ->> 'timing', ''),
            'expectedOutcome', coalesce(l.tactical_formula ->> 'expected_outcome', '')
          ),
          'executiveSummary', coalesce(l.executive_summary, '')
        ),
        'semanticSignals', jsonb_build_object(
          'causalityCount', l.causal_hypotheses_count,
          'counterintuitiveCount', l.counterintuitive_signals_count,
          'relationalConflictCount', l.relational_conflicts_count,
          'inflectionPointsCount', l.inflection_points_count,
          'tacitBasisCount', l.tacit_basis_count,
          'executiveSummary', coalesce(l.executive_summary, '')
        )
      )
      order by l.score desc, l.inflection_points_count desc, l.updated_at desc
    ),
    '[]'::jsonb
  )
  from public.api_syn_leads_view_v1 l;
$$;

create or replace function public.api_syn_heatmap_v1()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with regions as (
    select * from public.api_syn_heatmap_region_view_v1
  ),
  leads as (
    select * from public.api_syn_leads_view_v1
  ),
  kpis as (
    select * from public.api_syn_kpis_view_v1
  ),
  pipeline as (
    select
      to_char(month_start, 'Mon') as month,
      round(coalesce(sum(case when date_trunc('month', l.updated_at) = month_start then l.deal_value end), 0) / 1000000, 1) as atual,
      round(coalesce(sum(case when date_trunc('month', l.updated_at) = month_start then l.deal_value end), 0) / 850000, 1) as projetado,
      round(coalesce(sum(case when date_trunc('month', l.updated_at) = month_start then l.deal_value end), 0) / 950000, 1) as meta
    from generate_series(
      date_trunc('month', now()) - interval '5 months',
      date_trunc('month', now()),
      interval '1 month'
    ) month_start
    left join leads l on date_trunc('month', l.updated_at) = month_start
    group by month_start
    order by month_start
  )
  select jsonb_build_object(
    'heatmapMetrics', jsonb_build_array('Revenue', 'Growth', 'Market Share', 'Innovation', 'Customer Sat.', 'Pipeline'),
    'heatmapData', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', r.region,
          'metrics', jsonb_build_array(
            jsonb_build_object('value', r.revenue, 'intensity', public.syn_metric_intensity(r.revenue)),
            jsonb_build_object('value', r.growth, 'intensity', public.syn_metric_intensity(r.growth)),
            jsonb_build_object('value', r.market_share, 'intensity', public.syn_metric_intensity(r.market_share)),
            jsonb_build_object('value', r.innovation, 'intensity', public.syn_metric_intensity(r.innovation)),
            jsonb_build_object('value', r.customer_sat, 'intensity', public.syn_metric_intensity(r.customer_sat)),
            jsonb_build_object('value', r.pipeline, 'intensity', public.syn_metric_intensity(r.pipeline))
          )
        )
      )
      from regions r
    ), '[]'::jsonb),
    'pipelineData', coalesce((
      select jsonb_agg(
        jsonb_build_object('month', p.month, 'projetado', p.projetado, 'atual', p.atual, 'meta', p.meta)
      )
      from pipeline p
    ), '[]'::jsonb),
    'narrativeItems', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'priority', case when l.score >= 80 then 'ALTA' when l.score >= 60 then 'MÉDIA' else 'BAIXA' end,
          'tag', case
            when l.inflection_points_count > 0 then 'INFLEXÃO'
            when l.score >= 85 then 'NOVO'
            else null
          end,
          'tagColor', case
            when l.inflection_points_count > 0 then '#C64928'
            when l.score >= 85 then '#8B5CF6'
            else null
          end,
          'title', case
            when l.inflection_points_count > 0 then 'Ponto de inflexão em ' || l.sector
            else 'Movimento em ' || l.sector
          end,
          'desc', case
            when coalesce(l.executive_summary, '') <> '' then l.name || ' — ' || l.executive_summary
            else l.name || ' — ' || l.company || ' — ' || l.deal_value
          end,
          'time', 'agora'
        )
      )
      from (select * from leads order by inflection_points_count desc, score desc limit 5) l
    ), '[]'::jsonb),
    'strategicActions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'priority', case when l.score >= 80 then 'ALTA' else 'MÉDIA' end,
          'color', case when l.score >= 80 then '#C64928' else '#F59E0B' end,
          'action', 'Acionar frente comercial para ' || l.company,
          'owner', 'Revenue Ops',
          'date', to_char(now() + ((row_number() over()) || ' days')::interval, 'DD/MM')
        )
      )
      from (select * from leads order by score desc limit 5) l
    ), '[]'::jsonb),
    'kpiCards', (
      select jsonb_build_array(
        jsonb_build_object('label', 'New Logo', 'value', k.leads_ativos::text, 'amount', k.pipeline_total::text, 'color', '#8B5CF6', 'iconKey', 'star', 'sub', 'Leads ativos'),
        jsonb_build_object('label', 'Mapped', 'value', k.contratos_vigentes::text, 'amount', (k.pipeline_total * 0.55)::text, 'color', '#3B82F6', 'iconKey', 'git-branch', 'sub', 'Contratos vigentes'),
        jsonb_build_object('label', 'Ongoing', 'value', k.leads_em_aberto::text, 'amount', (k.pipeline_total * 0.35)::text, 'color', '#06B6D4', 'iconKey', 'clock', 'sub', 'Leads em aberto'),
        jsonb_build_object('label', 'Committed', 'value', (round(k.win_rate)::text || '%'), 'amount', (k.pipeline_total * (k.win_rate / 100))::text, 'color', '#10B981', 'iconKey', 'check-circle', 'sub', 'Taxa de conversão'),
        jsonb_build_object('label', 'At Risk', 'value', k.at_risk_value::text, 'amount', k.at_risk_value::text, 'color', '#F43F5E', 'iconKey', 'alert-triangle', 'sub', 'Exposição de risco')
      )
      from kpis k
    ),
    'semanticSnapshot', jsonb_build_object(
      'causalitySignals', coalesce((select sum(l.causal_hypotheses_count) from leads l), 0),
      'counterintuitiveSignals', coalesce((select sum(l.counterintuitive_signals_count) from leads l), 0),
      'relationalConflicts', coalesce((select sum(l.relational_conflicts_count) from leads l), 0),
      'inflectionPoints', coalesce((select sum(l.inflection_points_count) from leads l), 0),
      'tacitBasisSignals', coalesce((select sum(l.tacit_basis_count) from leads l), 0)
    )
  );
$$;

create or replace function public.api_syn_outreach_v1()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with leads as (
    select * from public.api_syn_leads_view_v1
  ),
  kpis as (
    select * from public.api_syn_kpis_view_v1
  )
  select jsonb_build_object(
    'chartData', coalesce((
      select jsonb_agg(
        jsonb_build_object('week', 'Semana ' || rn, 'value', round(v.avg_open))
      )
      from (
        select row_number() over(order by sector) as rn, avg(open_rate) as avg_open
        from leads
        group by sector
        order by avg(open_rate) desc
        limit 4
      ) v
    ), '[]'::jsonb),
    'radarData', coalesce((
      select jsonb_agg(
        jsonb_build_object('subject', v.label, 'A', v.score, 'fullMark', 100)
      )
      from (
        select * from (values
          ('Analítico', 90),
          ('Visionário', 75),
          ('Empático', 60),
          ('Direto', 50),
          ('Provocativo', 85)
        ) as x(label, score)
      ) v
    ), '[]'::jsonb),
    'leads', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', l.name,
          'sector', l.sector,
          'tone', upper(l.tone),
          'toneColor', l.tone_color,
          'openRate', (round(l.open_rate, 1)::text || '%'),
          'clickRate', (round(l.click_rate, 1)::text || '%'),
          'scoreIA', round(coalesce(l.score_ia, l.score / 10.0), 1)::text,
          'scoreColor', case when coalesce(l.score_ia, l.score / 10.0) >= 8 then '#2E4C3B' else '#C64928' end,
          'inflectionPointsCount', l.inflection_points_count,
          'executiveSummary', l.executive_summary
        )
      )
      from (select * from leads order by inflection_points_count desc, score desc limit 8) l
    ), '[]'::jsonb),
    'globalConversionRate', (select round(k.conversion_rate, 1)::text || '%' from kpis k),
    'globalConversionDelta', (select round(k.conversion_delta, 1)::text || '%' from kpis k),
    'scriptsGenerated', (select k.scripts_generated::text from kpis k),
    'toneInsights', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'label', x.sector,
          'tone', initcap(x.tone),
          'score', '(' || round(avg(x.score_ia), 1)::text || ')',
          'color', max(x.tone_color)
        )
      )
      from (
        select l.sector, l.tone, l.tone_color, coalesce(l.score_ia, l.score / 10.0) as score_ia
        from leads l
      ) x
      group by x.sector, x.tone
      order by avg(x.score_ia) desc
      limit 3
    ), '[]'::jsonb),
    'semanticHighlights', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', l.name,
          'company', l.company,
          'sector', l.sector,
          'inflectionPointsCount', l.inflection_points_count,
          'executiveSummary', l.executive_summary,
          'tacticalFormula', l.tactical_formula
        )
      )
      from (
        select *
        from leads
        where inflection_points_count > 0
        order by inflection_points_count desc, score desc
        limit 5
      ) l
    ), '[]'::jsonb)
  );
$$;

create or replace function public.api_syn_sector_v1()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with leads as (
    select * from public.api_syn_leads_view_v1
  ),
  sectors as (
    select
      sector,
      round(avg(score), 1) as roi,
      round(avg(open_rate), 1) as engagement,
      count(*) as n,
      round(sum(deal_value), 2) as revenue,
      round(avg(click_rate), 1) as growth,
      coalesce(sum(inflection_points_count), 0)::integer as inflection_points,
      coalesce(sum(counterintuitive_signals_count), 0)::integer as counterintuitive_signals,
      coalesce(sum(relational_conflicts_count), 0)::integer as relational_conflicts
    from leads
    group by sector
    order by sum(deal_value) desc
  ),
  top as (
    select * from sectors order by revenue desc limit 3
  ),
  kpis as (
    select * from public.api_syn_kpis_view_v1
  ),
  top_recommendations as (
    select
      s.*,
      row_number() over(order by s.roi desc) as rank
    from sectors s
    order by s.roi desc
    limit 5
  )
  select jsonb_build_object(
    'scatterData', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', s.sector,
          'roi', s.roi,
          'engagement', s.engagement,
          'size', least(140, greatest(60, s.n * 10)),
          'color', case
            when row_number() over(order by s.revenue desc) = 1 then '#C64928'
            when row_number() over(order by s.revenue desc) = 2 then '#3B82F6'
            when row_number() over(order by s.revenue desc) = 3 then '#6366F1'
            else '#8B7355'
          end
        )
      )
      from sectors s
    ), '[]'::jsonb),
    'conversionInsights', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'sector', s.sector,
          'metric', 'Taxa de Conversão',
          'value', least(100, round(s.engagement)),
          'target', 100,
          'change', '+' || round(s.growth)::text || 'pp',
          'changeColor', '#2E4C3B',
          'barColor', '#C64928',
          'tags', jsonb_build_array(s.sector)
        )
      )
      from sectors s
    ), '[]'::jsonb),
    'aiRecommendations', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'level', case when s.roi >= 80 then 'Alto' when s.roi >= 65 then 'Médio' else 'Crítico' end,
          'levelColor', case when s.roi >= 80 then '#2E4C3B' when s.roi >= 65 then '#F59E0B' else '#C64928' end,
          'sector', s.sector,
          'title', 'Acelerar frente em ' || s.sector,
          'desc', 'Setor com ROI médio de ' || s.roi::text || '% e engajamento de ' || s.engagement::text || '%. Inflexões: ' || s.inflection_points::text || '.',
          'rank', s.rank
        )
      )
      from top_recommendations s
    ), '[]'::jsonb),
    'radarComparative', jsonb_build_array(
      jsonb_build_object('subject', 'ROI', 'Varejo', coalesce((select roi from top limit 1), 0), 'Financeiro', coalesce((select roi from top offset 1 limit 1), 0), 'Tecnologia', coalesce((select roi from top offset 2 limit 1), 0), 'fullMark', 100),
      jsonb_build_object('subject', 'NPS', 'Varejo', coalesce((select engagement from top limit 1), 0), 'Financeiro', coalesce((select engagement from top offset 1 limit 1), 0), 'Tecnologia', coalesce((select engagement from top offset 2 limit 1), 0), 'fullMark', 100),
      jsonb_build_object('subject', 'Engajamento', 'Varejo', coalesce((select engagement from top limit 1), 0), 'Financeiro', coalesce((select engagement from top offset 1 limit 1), 0), 'Tecnologia', coalesce((select engagement from top offset 2 limit 1), 0), 'fullMark', 100),
      jsonb_build_object('subject', 'Retenção', 'Varejo', 78, 'Financeiro', 74, 'Tecnologia', 70, 'fullMark', 100),
      jsonb_build_object('subject', 'Penetração', 'Varejo', 62, 'Financeiro', 58, 'Tecnologia', 54, 'fullMark', 100),
      jsonb_build_object('subject', 'Crescimento', 'Varejo', 80, 'Financeiro', 73, 'Tecnologia', 68, 'fullMark', 100)
    ),
    'boardSynthesis', jsonb_build_array(
      jsonb_build_object('type', 'Oportunidade Estratégica', 'typeColor', '#2E4C3B', 'content', 'A carteira atual mostra concentração em setores com ROI acima de 70%.'),
      jsonb_build_object('type', 'Ação Recomendada', 'typeColor', '#3B82F6', 'content', 'Priorizar setores com maior receita e maior score para ciclo trimestral.'),
      jsonb_build_object('type', 'Riscos Mapeados', 'typeColor', '#C64928', 'content', 'Setores com score abaixo de 60 exigem intervenção tática imediata.')
    ),
    'kpiCards', (
      select jsonb_build_array(
        jsonb_build_object('label', 'Revenue Total por Setor', 'value', k.pipeline_total::text, 'change', '+' || round(k.arr_growth)::text || '%'),
        jsonb_build_object('label', 'Deals Ativos Cross-Sector', 'value', k.leads_ativos::text, 'change', '+' || greatest(1, round(k.leads_ativos * 0.1))::text),
        jsonb_build_object('label', 'Market Penetration Média', 'value', round(k.win_rate)::text || '%', 'change', '+' || round(k.conversion_rate)::text || 'pp'),
        jsonb_build_object('label', 'Setor com Maior Growth', 'value', coalesce((select sector from sectors order by growth desc limit 1), 'N/A') || ' (' || coalesce((select growth::text from sectors order by growth desc limit 1), '0') || '%)', 'change', null, 'isHighlight', true)
      )
      from kpis k
    ),
    'sectorReportByName', coalesce((
      select jsonb_object_agg(
        s.sector,
        jsonb_build_object(
          'revenue', s.revenue::text,
          'growth', s.growth::text || '%',
          'roi', s.roi::text || '%',
          'dealsAtivos', s.n::text,
          'sentimento', case when s.roi >= 75 then 'Muito Positivo' when s.roi >= 60 then 'Positivo' else 'Atenção' end
        )
      )
      from sectors s
    ), '{}'::jsonb),
    'radarLegend', jsonb_build_array(
      jsonb_build_object('label', 'Varejo', 'color', '#C64928'),
      jsonb_build_object('label', 'Financeiro', 'color', '#3B82F6'),
      jsonb_build_object('label', 'Tecnologia', 'color', '#6366F1')
    ),
    'semanticLens', jsonb_build_object(
      'totalInflectionPoints', coalesce((select sum(l.inflection_points_count) from leads l), 0),
      'totalCounterintuitiveSignals', coalesce((select sum(l.counterintuitive_signals_count) from leads l), 0),
      'totalRelationalConflicts', coalesce((select sum(l.relational_conflicts_count) from leads l), 0),
      'sectorsWithInflection', coalesce((select count(*) from (select l.sector from leads l group by l.sector having sum(l.inflection_points_count) > 0) x), 0)
    )
  );
$$;

revoke all on function public.syn_normalize_semantic_layer(jsonb) from public;
revoke all on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, jsonb, text, text) from public;
revoke all on function public.api_syn_leads_v1() from public;
revoke all on function public.api_syn_heatmap_v1() from public;
revoke all on function public.api_syn_outreach_v1() from public;
revoke all on function public.api_syn_sector_v1() from public;

grant execute on function public.syn_normalize_semantic_layer(jsonb) to authenticated;
grant execute on function public.upsert_canonical_event_v2(text, text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, jsonb, text, text) to authenticated;
grant execute on function public.api_syn_leads_v1() to authenticated;
grant execute on function public.api_syn_heatmap_v1() to authenticated;
grant execute on function public.api_syn_outreach_v1() to authenticated;
grant execute on function public.api_syn_sector_v1() to authenticated;

grant select on public.api_syn_leads_view_v1 to authenticated;

commit;
