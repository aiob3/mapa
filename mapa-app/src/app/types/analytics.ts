export type HeatmapIntensity = 'critico' | 'atencao' | 'estavel' | 'forte';

export interface SynTacticalFormulaDto {
  action: string;
  owner: string;
  timing: string;
  expectedOutcome: string;
}

export interface SynSemanticLayerDto {
  causalHypotheses: string[];
  counterintuitiveSignals: string[];
  relationalConflicts: string[];
  inflectionPoints: string[];
  tacitBasis: string[];
  tacticalFormula: SynTacticalFormulaDto;
  executiveSummary: string;
}

export interface SynSemanticSignalsDto {
  causalityCount: number;
  counterintuitiveCount: number;
  relationalConflictCount: number;
  inflectionPointsCount: number;
  tacitBasisCount: number;
  executiveSummary: string;
}

export interface SynKpisDto {
  leadsAtivos: number;
  contratosVigentes: number;
  leadsEmAberto: number;
  eventosMonitorados: number;
  pipelineTotal: number;
  winRate: number;
  atRiskValue: number;
  conversionRate: number;
  conversionDelta: number;
  scriptsGenerated: number;
  arrGrowth: number;
}

export interface SynLeadDto {
  id: string;
  name: string;
  initials?: string;
  company: string;
  sector: string;
  region: string;
  location?: string;
  dealValue: number;
  score: number;
  status?: string;
  statusColor?: string;
  openRate?: number;
  clickRate?: number;
  tone?: string;
  toneColor?: string;
  scoreIA?: number;
  semanticLayer?: SynSemanticLayerDto;
  semanticSignals?: SynSemanticSignalsDto;
}

export interface SynHeatmapCellDto {
  value: number;
  intensity: HeatmapIntensity;
}

export interface SynHeatmapRegionDto {
  name: string;
  metrics: SynHeatmapCellDto[];
}

export interface SynPipelinePointDto {
  month: string;
  projetado: number | null;
  atual: number | null;
  meta: number | null;
}

export interface SynNarrativeItemDto {
  priority: string;
  tag: string | null;
  tagColor: string | null;
  title: string;
  desc: string;
  time: string;
}

export interface SynStrategicActionDto {
  color?: string;
  priority?: string;
  action: string;
  owner: string;
  date: string;
}

export interface SynKpiCardDto {
  label: string;
  value: string;
  amount?: string;
  color: string;
  iconKey: 'star' | 'git-branch' | 'clock' | 'check-circle' | 'alert-triangle' | 'trending-up' | 'activity' | 'users' | 'file-text' | 'target';
  sub?: string;
}

export interface SynOutreachLeadDto {
  name: string;
  sector: string;
  tone: string;
  toneColor: string;
  openRate: string;
  clickRate: string;
  scoreIA: string;
  scoreColor: string;
}

export interface SynOutreachToneInsightDto {
  label: string;
  tone: string;
  score: string;
  color: string;
}

export interface SynOutreachDto {
  chartData: Array<{ week: string; value: number }>;
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
  leads: SynOutreachLeadDto[];
  globalConversionRate: string;
  globalConversionDelta: string;
  scriptsGenerated: string;
  toneInsights: SynOutreachToneInsightDto[];
}

export interface SynSectorScatterDto {
  name: string;
  roi: number;
  engagement: number;
  size: number;
  color: string;
}

export interface SynSectorConversionInsightDto {
  sector: string;
  metric: string;
  value: number;
  target: number;
  change: string;
  changeColor: string;
  barColor: string;
  tags: string[];
}

export interface SynSectorRecommendationDto {
  level: string;
  levelColor: string;
  sector: string;
  title: string;
  desc: string;
}

export interface SynSectorRadarDto {
  subject: string;
  Varejo: number;
  Financeiro: number;
  Tecnologia: number;
  fullMark: number;
}

export interface SynBoardSynthesisDto {
  type: string;
  typeColor: string;
  content: string;
}

export interface SynSectorReportDto {
  revenue: string;
  growth: string;
  roi: string;
  dealsAtivos: string;
  sentimento: string;
}

export interface SynSectorLegendItemDto {
  label: string;
  color: string;
}

export interface SynSemanticSignalsSummaryRowDto {
  entityKind: string;
  events: number;
  causalitySignals: number;
  counterintuitiveSignals: number;
  relationalConflicts: number;
  inflectionPoints: number;
  tacitBasisSignals: number;
}

export interface SynSemanticSignalsSummaryDto {
  rows: SynSemanticSignalsSummaryRowDto[];
  totals: {
    events: number;
    causalitySignals: number;
    counterintuitiveSignals: number;
    relationalConflicts: number;
    inflectionPoints: number;
    tacitBasisSignals: number;
  };
  generatedAt: string;
}

export interface SynSectorDto {
  scatterData: SynSectorScatterDto[];
  conversionInsights: SynSectorConversionInsightDto[];
  aiRecommendations: SynSectorRecommendationDto[];
  radarComparative: SynSectorRadarDto[];
  boardSynthesis: SynBoardSynthesisDto[];
  kpiCards: Array<{ label: string; value: string; change: string | null; isHighlight?: boolean }>;
  sectorReportByName: Record<string, SynSectorReportDto>;
  radarLegend: SynSectorLegendItemDto[];
  semanticSignalsSummary?: SynSemanticSignalsSummaryDto;
}

export interface SynHeatmapDto {
  heatmapMetrics: string[];
  heatmapData: SynHeatmapRegionDto[];
  pipelineData: SynPipelinePointDto[];
  narrativeItems: SynNarrativeItemDto[];
  strategicActions: SynStrategicActionDto[];
  kpiCards: SynKpiCardDto[];
}

export interface SynAnalyticsBundleDto {
  kpis: SynKpisDto;
  leads: SynLeadDto[];
  heatmap: SynHeatmapDto;
  outreach: SynOutreachDto;
  sector: SynSectorDto;
}

export interface SynAnalyticsStatus {
  loading: boolean;
  error: string | null;
  lastUpdatedAt: string | null;
  pollingMs: number;
}

export interface SynLeadViewModel {
  id: string;
  name: string;
  initials: string;
  company: string;
  value: string;
  location: string;
  region: string;
  sector: string;
  score: number;
  status: string;
  statusColor: string;
  openRate: string;
  clickRate: string;
  tone: string;
  toneColor: string;
  scoreIA: string;
  scoreColor: string;
  semanticLayer: SynSemanticLayerDto;
  semanticSignals: SynSemanticSignalsDto;
}

export interface SynAnalyticsViewModel {
  kpis: SynKpisDto;
  leadsRegistry: SynLeadViewModel[];
  heatmap: SynHeatmapDto;
  outreach: SynOutreachDto;
  sector: SynSectorDto;
}
