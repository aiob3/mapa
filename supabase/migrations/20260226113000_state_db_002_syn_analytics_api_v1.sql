begin;

create or replace function public.parse_numeric_safe(p_value text, p_default numeric default 0)
returns numeric
language sql
immutable
as $$
  select case
    when p_value is null or btrim(p_value) = '' then p_default
    when replace(p_value, ',', '.') ~ '^-?[0-9]+(\.[0-9]+)?$' then replace(p_value, ',', '.')::numeric
    else p_default
  end;
$$;

create or replace function public.syn_metric_intensity(p_value numeric)
returns text
language sql
immutable
as $$
  select case
    when p_value >= 80 then 'forte'
    when p_value >= 65 then 'estavel'
    when p_value >= 45 then 'atencao'
    else 'critico'
  end;
$$;

create or replace function public.can_access_syn_analytics()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.can_access_module('mapa-syn') or public.can_access_module('synapse');
$$;

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

create or replace view public.api_syn_heatmap_region_view_v1 as
with leads as (
  select * from public.api_syn_leads_view_v1
),
regions as (
  select
    region,
    coalesce(round(avg(deal_value) / 10000), 0)::numeric as revenue,
    coalesce(round(avg(score)), 0)::numeric as growth,
    coalesce(round(avg(open_rate)), 0)::numeric as market_share,
    coalesce(round(avg(click_rate) * 1.2), 0)::numeric as innovation,
    coalesce(round(avg(score) * 0.95), 0)::numeric as customer_sat,
    coalesce(round(avg(score) * 1.05), 0)::numeric as pipeline
  from leads
  group by region
)
select
  region,
  greatest(0, least(100, revenue))::integer as revenue,
  greatest(0, least(100, growth))::integer as growth,
  greatest(0, least(100, market_share))::integer as market_share,
  greatest(0, least(100, innovation))::integer as innovation,
  greatest(0, least(100, customer_sat))::integer as customer_sat,
  greatest(0, least(100, pipeline))::integer as pipeline
from regions
order by region;

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
        'scoreIA', l.score_ia
      )
      order by l.score desc, l.updated_at desc
    ),
    '[]'::jsonb
  )
  from public.api_syn_leads_view_v1 l;
$$;

create or replace function public.api_syn_kpis_v1()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'leadsAtivos', k.leads_ativos,
    'contratosVigentes', k.contratos_vigentes,
    'leadsEmAberto', k.leads_em_aberto,
    'eventosMonitorados', k.eventos_monitorados,
    'pipelineTotal', k.pipeline_total,
    'winRate', k.win_rate,
    'atRiskValue', k.at_risk_value,
    'conversionRate', k.conversion_rate,
    'conversionDelta', k.conversion_delta,
    'scriptsGenerated', k.scripts_generated,
    'arrGrowth', k.arr_growth
  )
  from public.api_syn_kpis_view_v1 k;
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
          'tag', case when l.score >= 85 then 'NOVO' else null end,
          'tagColor', case when l.score >= 85 then '#8B5CF6' else null end,
          'title', 'Movimento em ' || l.sector,
          'desc', l.name || ' — ' || l.company || ' — ' || l.deal_value,
          'time', 'agora'
        )
      )
      from (select * from leads order by score desc limit 5) l
    ), '[]'::jsonb),
    'strategicActions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'priority', case when l.score >= 80 then 'ALTA' else 'MÉDIA' end,
          'color', case when l.score >= 80 then '#C64928' else '#F59E0B' end,
          'action', 'Acionar frente comercial para ' || l.company,
          'owner', 'Revenue Ops',
          'date', to_char(now() + ((l.rn || ' days')::interval), 'DD/MM')
        )
      )
      from (
        select
          l.*,
          row_number() over(order by l.score desc) as rn
        from (select * from leads order by score desc limit 5) l
      ) l
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
          'scoreColor', case when coalesce(l.score_ia, l.score / 10.0) >= 8 then '#2E4C3B' else '#C64928' end
        )
      )
      from (select * from leads order by score desc limit 8) l
    ), '[]'::jsonb),
    'globalConversionRate', (select round(k.conversion_rate, 1)::text || '%' from kpis k),
    'globalConversionDelta', (select round(k.conversion_delta, 1)::text || '%' from kpis k),
    'scriptsGenerated', (select k.scripts_generated::text from kpis k),
    'toneInsights', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'label', t.sector,
          'tone', initcap(t.tone),
          'score', '(' || round(t.avg_score_ia, 1)::text || ')',
          'color', t.max_tone_color
        )
        order by t.avg_score_ia desc
      )
      from (
        select
          x.sector,
          x.tone,
          avg(x.score_ia) as avg_score_ia,
          max(x.tone_color) as max_tone_color
        from (
          select l.sector, l.tone, l.tone_color, coalesce(l.score_ia, l.score / 10.0) as score_ia
          from leads l
        ) x
        group by x.sector, x.tone
        order by avg(x.score_ia) desc
        limit 3
      ) t
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
      round(avg(click_rate), 1) as growth
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
  ranked_sectors as (
    select
      s.*,
      row_number() over(order by s.revenue desc) as revenue_rank
    from sectors s
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
            when s.revenue_rank = 1 then '#C64928'
            when s.revenue_rank = 2 then '#3B82F6'
            when s.revenue_rank = 3 then '#6366F1'
            else '#8B7355'
          end
        )
      )
      from ranked_sectors s
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
          'desc', 'Setor com ROI médio de ' || s.roi::text || '% e engajamento de ' || s.engagement::text || '%.',
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
    )
  );
$$;

revoke all on function public.parse_numeric_safe(text, numeric) from public;
revoke all on function public.syn_metric_intensity(numeric) from public;
revoke all on function public.can_access_syn_analytics() from public;
revoke all on function public.api_syn_leads_v1() from public;
revoke all on function public.api_syn_kpis_v1() from public;
revoke all on function public.api_syn_heatmap_v1() from public;
revoke all on function public.api_syn_outreach_v1() from public;
revoke all on function public.api_syn_sector_v1() from public;

grant execute on function public.parse_numeric_safe(text, numeric) to authenticated;
grant execute on function public.syn_metric_intensity(numeric) to authenticated;
grant execute on function public.can_access_syn_analytics() to authenticated;
grant execute on function public.api_syn_leads_v1() to authenticated;
grant execute on function public.api_syn_kpis_v1() to authenticated;
grant execute on function public.api_syn_heatmap_v1() to authenticated;
grant execute on function public.api_syn_outreach_v1() to authenticated;
grant execute on function public.api_syn_sector_v1() to authenticated;

grant select on public.api_syn_leads_view_v1 to authenticated;
grant select on public.api_syn_kpis_view_v1 to authenticated;
grant select on public.api_syn_heatmap_region_view_v1 to authenticated;

commit;
