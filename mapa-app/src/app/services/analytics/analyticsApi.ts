import type {
  SynAnalyticsBundleDto,
  SynHeatmapDto,
  SynKpisDto,
  SynLeadDto,
  SynOutreachDto,
  SynSemanticSignalsSummaryDto,
  SynSectorDto,
} from '../../types/analytics';

const REQUEST_TIMEOUT_MS = 12000;

interface SupabaseErrorPayload {
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
}

interface SynApiFetchResult {
  bundle: SynAnalyticsBundleDto;
  errors: string[];
}

interface SynSemanticSignalsSummaryApiPayload {
  rows?: Array<{
    entity_kind?: string;
    events?: number;
    causality_signals?: number;
    counterintuitive_signals?: number;
    relational_conflicts?: number;
    inflection_points?: number;
    tacit_basis_signals?: number;
  }>;
  totals?: {
    events?: number;
    causalitySignals?: number;
    counterintuitiveSignals?: number;
    relationalConflicts?: number;
    inflectionPoints?: number;
    tacitBasisSignals?: number;
  };
  generatedAt?: string;
}

function resolveSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Configuração Supabase ausente. Execute "npm run sync:env:app" na raiz ou defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no mapa-app/.env.',
    );
  }

  return { url, anonKey };
}

function resolveSynMiddlewareConfig() {
  const url = import.meta.env.VITE_SYN_MIDDLEWARE_URL;
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return null;
  }

  return { url: url.trim().replace(/\/+$/, '') };
}

function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

async function requestSupabase<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  const { url, anonKey } = resolveSupabaseConfig();
  const timeout = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${url}${path}`, {
      ...init,
      signal: timeout.signal,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError: SupabaseErrorPayload | null = null;

      if (errorText) {
        try {
          parsedError = JSON.parse(errorText) as SupabaseErrorPayload;
        } catch {
          parsedError = null;
        }
      }

      const rawMessage =
        parsedError?.error_description ||
        parsedError?.msg ||
        parsedError?.message ||
        parsedError?.error ||
        errorText;

      throw new Error(rawMessage || `Erro Supabase (${response.status})`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao buscar analytics.');
    }
    throw error;
  } finally {
    timeout.clear();
  }
}

async function requestMiddleware<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  const config = resolveSynMiddlewareConfig();
  if (!config) {
    throw new Error('Middleware Syn não configurado.');
  }

  const timeout = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.url}${path}`, {
      ...init,
      signal: timeout.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro middleware Syn (${response.status})`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao buscar resumo semântico no middleware.');
    }
    throw error;
  } finally {
    timeout.clear();
  }
}

async function callRpc<T>(rpcName: string, accessToken: string): Promise<T> {
  return requestSupabase<T>(`/rest/v1/rpc/${rpcName}`, accessToken, {
    method: 'POST',
    body: '{}',
  });
}

function emptyKpis(): SynKpisDto {
  return {
    leadsAtivos: 0,
    contratosVigentes: 0,
    leadsEmAberto: 0,
    eventosMonitorados: 0,
    pipelineTotal: 0,
    winRate: 0,
    atRiskValue: 0,
    conversionRate: 0,
    conversionDelta: 0,
    scriptsGenerated: 0,
    arrGrowth: 0,
  };
}

function emptyHeatmap(): SynHeatmapDto {
  return {
    heatmapMetrics: [],
    heatmapData: [],
    pipelineData: [],
    narrativeItems: [],
    strategicActions: [],
    kpiCards: [],
  };
}

function emptyOutreach(): SynOutreachDto {
  return {
    chartData: [],
    radarData: [],
    leads: [],
    globalConversionRate: '0.0%',
    globalConversionDelta: '0.0%',
    scriptsGenerated: '0',
    toneInsights: [],
  };
}

function emptySemanticSignalsSummary(): SynSemanticSignalsSummaryDto {
  return {
    rows: [],
    totals: {
      events: 0,
      causalitySignals: 0,
      counterintuitiveSignals: 0,
      relationalConflicts: 0,
      inflectionPoints: 0,
      tacitBasisSignals: 0,
    },
    generatedAt: '',
  };
}

function emptySector(): SynSectorDto {
  return {
    scatterData: [],
    conversionInsights: [],
    aiRecommendations: [],
    radarComparative: [],
    boardSynthesis: [],
    kpiCards: [],
    sectorReportByName: {},
    radarLegend: [],
    semanticSignalsSummary: emptySemanticSignalsSummary(),
  };
}

export function createEmptySynAnalyticsBundleDto(): SynAnalyticsBundleDto {
  return {
    kpis: emptyKpis(),
    leads: [],
    heatmap: emptyHeatmap(),
    outreach: emptyOutreach(),
    sector: emptySector(),
  };
}

export async function fetchSynKpisV1(accessToken: string): Promise<SynKpisDto> {
  const data = await callRpc<SynKpisDto>('api_syn_kpis_v1', accessToken);
  return { ...emptyKpis(), ...(data || {}) };
}

export async function fetchSynLeadsV1(accessToken: string): Promise<SynLeadDto[]> {
  const data = await callRpc<SynLeadDto[]>('api_syn_leads_v1', accessToken);
  return Array.isArray(data) ? data : [];
}

export async function fetchSynHeatmapV1(accessToken: string): Promise<SynHeatmapDto> {
  const data = await callRpc<SynHeatmapDto>('api_syn_heatmap_v1', accessToken);
  return { ...emptyHeatmap(), ...(data || {}) };
}

export async function fetchSynOutreachV1(accessToken: string): Promise<SynOutreachDto> {
  const data = await callRpc<SynOutreachDto>('api_syn_outreach_v1', accessToken);
  return { ...emptyOutreach(), ...(data || {}) };
}

export async function fetchSynSectorV1(accessToken: string): Promise<SynSectorDto> {
  const data = await callRpc<SynSectorDto>('api_syn_sector_v1', accessToken);
  return { ...emptySector(), ...(data || {}) };
}

export async function fetchSynSemanticSignalsSummaryV1(accessToken: string): Promise<SynSemanticSignalsSummaryDto> {
  const config = resolveSynMiddlewareConfig();
  if (!config) {
    return emptySemanticSignalsSummary();
  }

  const data = await requestMiddleware<SynSemanticSignalsSummaryApiPayload>(
    '/api/syn/semantic-signals-summary',
    accessToken,
    { method: 'GET' },
  );

  return {
    rows: Array.isArray(data?.rows)
      ? data.rows.map((row) => ({
          entityKind: row.entity_kind || 'unknown',
          events: Number(row.events || 0),
          causalitySignals: Number(row.causality_signals || 0),
          counterintuitiveSignals: Number(row.counterintuitive_signals || 0),
          relationalConflicts: Number(row.relational_conflicts || 0),
          inflectionPoints: Number(row.inflection_points || 0),
          tacitBasisSignals: Number(row.tacit_basis_signals || 0),
        }))
      : [],
    totals: {
      events: Number(data?.totals?.events || 0),
      causalitySignals: Number(data?.totals?.causalitySignals || 0),
      counterintuitiveSignals: Number(data?.totals?.counterintuitiveSignals || 0),
      relationalConflicts: Number(data?.totals?.relationalConflicts || 0),
      inflectionPoints: Number(data?.totals?.inflectionPoints || 0),
      tacitBasisSignals: Number(data?.totals?.tacitBasisSignals || 0),
    },
    generatedAt: typeof data?.generatedAt === 'string' ? data.generatedAt : '',
  };
}

export async function fetchSynAnalyticsBundleV1(accessToken: string): Promise<SynApiFetchResult> {
  const [kpisResult, leadsResult, heatmapResult, outreachResult, sectorResult, semanticSummaryResult] = await Promise.allSettled([
    fetchSynKpisV1(accessToken),
    fetchSynLeadsV1(accessToken),
    fetchSynHeatmapV1(accessToken),
    fetchSynOutreachV1(accessToken),
    fetchSynSectorV1(accessToken),
    fetchSynSemanticSignalsSummaryV1(accessToken),
  ]);

  const errors: string[] = [];

  const bundle: SynAnalyticsBundleDto = {
    kpis: kpisResult.status === 'fulfilled' ? kpisResult.value : emptyKpis(),
    leads: leadsResult.status === 'fulfilled' ? leadsResult.value : [],
    heatmap: heatmapResult.status === 'fulfilled' ? heatmapResult.value : emptyHeatmap(),
    outreach: outreachResult.status === 'fulfilled' ? outreachResult.value : emptyOutreach(),
    sector: {
      ...(sectorResult.status === 'fulfilled' ? sectorResult.value : emptySector()),
      semanticSignalsSummary:
        semanticSummaryResult.status === 'fulfilled'
          ? semanticSummaryResult.value
          : emptySemanticSignalsSummary(),
    },
  };

  if (kpisResult.status === 'rejected') {
    errors.push(`kpis: ${kpisResult.reason instanceof Error ? kpisResult.reason.message : String(kpisResult.reason)}`);
  }
  if (leadsResult.status === 'rejected') {
    errors.push(`leads: ${leadsResult.reason instanceof Error ? leadsResult.reason.message : String(leadsResult.reason)}`);
  }
  if (heatmapResult.status === 'rejected') {
    errors.push(`heatmap: ${heatmapResult.reason instanceof Error ? heatmapResult.reason.message : String(heatmapResult.reason)}`);
  }
  if (outreachResult.status === 'rejected') {
    errors.push(`outreach: ${outreachResult.reason instanceof Error ? outreachResult.reason.message : String(outreachResult.reason)}`);
  }
  if (sectorResult.status === 'rejected') {
    errors.push(`sector: ${sectorResult.reason instanceof Error ? sectorResult.reason.message : String(sectorResult.reason)}`);
  }
  if (semanticSummaryResult.status === 'rejected') {
    errors.push(
      `semantic-summary: ${semanticSummaryResult.reason instanceof Error ? semanticSummaryResult.reason.message : String(semanticSummaryResult.reason)}`,
    );
  }

  return { bundle, errors };
}
