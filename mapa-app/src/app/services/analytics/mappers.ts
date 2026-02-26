import type {
  SynAnalyticsBundleDto,
  SynAnalyticsViewModel,
  SynKpiCardDto,
  SynKpisDto,
  SynLeadDto,
  SynSemanticLayerDto,
  SynSemanticSignalsDto,
  SynLeadViewModel,
} from '../../types/analytics';
import { createEmptySynAnalyticsBundleDto } from './analyticsApi';
import {
  deriveSynScoreIA,
  deriveSynStatusByScore,
  normalizeSynSemanticLayer,
  normalizeSynSemanticSignals,
  normalizeSynTone,
} from '@syn-patterns';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) {
    return 'NA';
  }
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function toLeadViewModel(dto: SynLeadDto): SynLeadViewModel {
  const status = deriveSynStatusByScore(dto.score);
  const semanticLayer = normalizeSynSemanticLayer(dto.semanticLayer) as SynSemanticLayerDto;
  const semanticSignals = normalizeSynSemanticSignals(dto.semanticSignals, semanticLayer) as SynSemanticSignalsDto;
  const scoreIA = deriveSynScoreIA(dto.score, dto.scoreIA);
  const tone = normalizeSynTone(dto.tone, dto.toneColor);

  return {
    id: dto.id,
    name: dto.name,
    initials: dto.initials || initialsOf(dto.name),
    company: dto.company,
    value: formatCurrency(dto.dealValue),
    location: dto.location || dto.region,
    region: dto.region,
    sector: dto.sector,
    score: dto.score,
    status: dto.status || status.status,
    statusColor: dto.statusColor || status.color,
    openRate: formatPercent(dto.openRate ?? 0),
    clickRate: formatPercent(dto.clickRate ?? 0),
    tone: tone.tone,
    toneColor: tone.toneColor,
    scoreIA: scoreIA.text,
    scoreColor: scoreIA.color,
    semanticLayer,
    semanticSignals,
  };
}

function deriveHeatmapKpiCards(kpis: SynKpisDto): SynKpiCardDto[] {
  return [
    {
      label: 'New Logo',
      value: String(kpis.leadsAtivos),
      amount: formatCurrency(kpis.pipelineTotal),
      color: '#8B5CF6',
      iconKey: 'star',
      sub: 'Leads ativos',
    },
    {
      label: 'Mapped',
      value: String(kpis.contratosVigentes),
      amount: formatCurrency(kpis.pipelineTotal * 0.55),
      color: '#3B82F6',
      iconKey: 'git-branch',
      sub: 'Contratos vigentes',
    },
    {
      label: 'Ongoing',
      value: String(kpis.leadsEmAberto),
      amount: formatCurrency(kpis.pipelineTotal * 0.35),
      color: '#06B6D4',
      iconKey: 'clock',
      sub: 'Leads em aberto',
    },
    {
      label: 'Committed',
      value: `${kpis.winRate.toFixed(0)}%`,
      amount: formatCurrency(kpis.pipelineTotal * (kpis.winRate / 100)),
      color: '#10B981',
      iconKey: 'check-circle',
      sub: 'Taxa de conversão',
    },
    {
      label: 'At Risk',
      value: formatCurrency(kpis.atRiskValue),
      amount: formatCurrency(kpis.atRiskValue),
      color: '#F43F5E',
      iconKey: 'alert-triangle',
      sub: 'Exposição de risco',
    },
  ];
}

function normalizeBundle(dto: SynAnalyticsBundleDto): SynAnalyticsBundleDto {
  const empty = createEmptySynAnalyticsBundleDto();
  return {
    ...empty,
    ...dto,
    kpis: {
      ...empty.kpis,
      ...(dto.kpis || {}),
    },
    leads: Array.isArray(dto.leads) ? dto.leads : [],
    heatmap: {
      ...empty.heatmap,
      ...(dto.heatmap || {}),
      heatmapMetrics: dto.heatmap?.heatmapMetrics || [],
      heatmapData: dto.heatmap?.heatmapData || [],
      pipelineData: dto.heatmap?.pipelineData || [],
      narrativeItems: dto.heatmap?.narrativeItems || [],
      strategicActions: dto.heatmap?.strategicActions || [],
      kpiCards: dto.heatmap?.kpiCards || [],
    },
    outreach: {
      ...empty.outreach,
      ...(dto.outreach || {}),
      chartData: dto.outreach?.chartData || [],
      radarData: dto.outreach?.radarData || [],
      leads: dto.outreach?.leads || [],
      toneInsights: dto.outreach?.toneInsights || [],
    },
    sector: {
      ...empty.sector,
      ...(dto.sector || {}),
      scatterData: dto.sector?.scatterData || [],
      conversionInsights: dto.sector?.conversionInsights || [],
      aiRecommendations: dto.sector?.aiRecommendations || [],
      radarComparative: dto.sector?.radarComparative || [],
      boardSynthesis: dto.sector?.boardSynthesis || [],
      kpiCards: dto.sector?.kpiCards || [],
      sectorReportByName: dto.sector?.sectorReportByName || {},
      radarLegend: dto.sector?.radarLegend || [],
      semanticSignalsSummary: dto.sector?.semanticSignalsSummary || empty.sector.semanticSignalsSummary,
    },
  };
}

export function mapSynBundleToViewModel(dto: SynAnalyticsBundleDto): SynAnalyticsViewModel {
  const normalized = normalizeBundle(dto);
  const leadsRegistry = normalized.leads.map(toLeadViewModel);

  return {
    kpis: normalized.kpis,
    leadsRegistry,
    heatmap: {
      ...normalized.heatmap,
      kpiCards: normalized.heatmap.kpiCards.length > 0 ? normalized.heatmap.kpiCards : deriveHeatmapKpiCards(normalized.kpis),
    },
    outreach: normalized.outreach,
    sector: normalized.sector,
  };
}

export function mergeKpisIntoViewModel(
  current: SynAnalyticsViewModel,
  kpis: SynKpisDto,
): SynAnalyticsViewModel {
  return {
    ...current,
    kpis,
    heatmap: {
      ...current.heatmap,
      kpiCards: deriveHeatmapKpiCards(kpis),
    },
  };
}

export function createEmptySynAnalyticsViewModel(): SynAnalyticsViewModel {
  return mapSynBundleToViewModel(createEmptySynAnalyticsBundleDto());
}
