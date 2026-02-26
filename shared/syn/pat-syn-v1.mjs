const STATUS_HOT_COLOR = '#C64928';
const STATUS_WARM_COLOR = '#F59E0B';
const STATUS_COLD_COLOR = '#6B7280';
const SCORE_GOOD_COLOR = '#2E4C3B';
const SCORE_ATTENTION_COLOR = '#C64928';
const TONE_DEFAULT_COLOR = '#4A6FA5';

export const PAT_SYN_VERSION = 'PAT-SYN-v1';

export const SYN_ANALYTICS_RPC = Object.freeze({
  leads: 'api_syn_leads_v1',
  heatmap: 'api_syn_heatmap_v1',
  outreach: 'api_syn_outreach_v1',
  sector: 'api_syn_sector_v1',
  kpis: 'api_syn_kpis_v1',
});

export const SYN_ANALYTICS_RPCS = Object.freeze([
  SYN_ANALYTICS_RPC.leads,
  SYN_ANALYTICS_RPC.heatmap,
  SYN_ANALYTICS_RPC.outreach,
  SYN_ANALYTICS_RPC.sector,
  SYN_ANALYTICS_RPC.kpis,
]);

export const SYN_SCORE_STATUS_BANDS = Object.freeze([
  Object.freeze({ id: 'PAT-SYN-SCORE-001', minScore: 80, maxScore: 100, status: 'Quente', color: STATUS_HOT_COLOR }),
  Object.freeze({ id: 'PAT-SYN-SCORE-002', minScore: 60, maxScore: 79.9999, status: 'Morno', color: STATUS_WARM_COLOR }),
  Object.freeze({ id: 'PAT-SYN-SCORE-003', minScore: 0, maxScore: 59.9999, status: 'Frio', color: STATUS_COLD_COLOR }),
]);

export const SYN_SEMANTIC_SIGNAL_TAXONOMY = Object.freeze([
  Object.freeze({
    id: 'PAT-SYN-SIGNAL-001',
    dtoKey: 'causalHypotheses',
    storageKey: 'causal_hypotheses',
    summaryKey: 'causalitySignals',
    summaryColumn: 'causality_signals',
    label: 'Hipóteses causais',
  }),
  Object.freeze({
    id: 'PAT-SYN-SIGNAL-002',
    dtoKey: 'counterintuitiveSignals',
    storageKey: 'counterintuitive_signals',
    summaryKey: 'counterintuitiveSignals',
    summaryColumn: 'counterintuitive_signals',
    label: 'Sinais contraintuitivos',
  }),
  Object.freeze({
    id: 'PAT-SYN-SIGNAL-003',
    dtoKey: 'relationalConflicts',
    storageKey: 'relational_conflicts',
    summaryKey: 'relationalConflicts',
    summaryColumn: 'relational_conflicts',
    label: 'Conflitos relacionais',
  }),
  Object.freeze({
    id: 'PAT-SYN-SIGNAL-004',
    dtoKey: 'inflectionPoints',
    storageKey: 'inflection_points',
    summaryKey: 'inflectionPoints',
    summaryColumn: 'inflection_points',
    label: 'Pontos de inflexão',
  }),
  Object.freeze({
    id: 'PAT-SYN-SIGNAL-005',
    dtoKey: 'tacitBasis',
    storageKey: 'tacit_basis',
    summaryKey: 'tacitBasisSignals',
    summaryColumn: 'tacit_basis_signals',
    label: 'Embasamento tácito',
  }),
]);

export const PAT_SYN_PATTERN_ORIGIN_MATRIX = Object.freeze([
  Object.freeze({ id: 'PAT-SYN-DTO-001', pattern: 'SynLeadDto', origin: 'Supabase RPC api_syn_leads_v1', stage: 'DTO' }),
  Object.freeze({ id: 'PAT-SYN-DTO-002', pattern: 'SynSemanticLayerDto', origin: 'Supabase semantic_layer + middleware normalize', stage: 'DTO' }),
  Object.freeze({ id: 'PAT-SYN-DTO-003', pattern: 'SynSemanticSignalsSummaryDto', origin: 'ClickHouse semantic_signals_summary_v1 via middleware', stage: 'DTO' }),
  Object.freeze({ id: 'PAT-SYN-STATUS-001', pattern: 'statusColor', origin: 'Score semantics PAT-SYN-SCORE-*', stage: 'Mapper/Transform' }),
  Object.freeze({ id: 'PAT-SYN-SCORE-001', pattern: 'score>=80 => Quente', origin: 'Supabase view fallback + shared normalizer', stage: 'Cross-layer rule' }),
  Object.freeze({ id: 'PAT-SYN-SCORE-002', pattern: '60<=score<80 => Morno', origin: 'Supabase view fallback + shared normalizer', stage: 'Cross-layer rule' }),
  Object.freeze({ id: 'PAT-SYN-SCORE-003', pattern: 'score<60 => Frio', origin: 'Supabase view fallback + shared normalizer', stage: 'Cross-layer rule' }),
  Object.freeze({ id: 'PAT-SYN-SIGNAL-001', pattern: 'causalHypotheses', origin: 'semantic_layer -> ClickHouse + app', stage: 'Taxonomia de sinais' }),
  Object.freeze({ id: 'PAT-SYN-SIGNAL-002', pattern: 'counterintuitiveSignals', origin: 'semantic_layer -> ClickHouse + app', stage: 'Taxonomia de sinais' }),
  Object.freeze({ id: 'PAT-SYN-SIGNAL-003', pattern: 'relationalConflicts', origin: 'semantic_layer -> ClickHouse + app', stage: 'Taxonomia de sinais' }),
  Object.freeze({ id: 'PAT-SYN-SIGNAL-004', pattern: 'inflectionPoints', origin: 'semantic_layer -> ClickHouse + app', stage: 'Taxonomia de sinais' }),
  Object.freeze({ id: 'PAT-SYN-SIGNAL-005', pattern: 'tacitBasis', origin: 'semantic_layer -> ClickHouse + app', stage: 'Taxonomia de sinais' }),
  Object.freeze({ id: 'PAT-SYN-RPC-001', pattern: 'RPC contract list', origin: 'validate-syn-post-migration + analyticsApi', stage: 'Contract gate' }),
  Object.freeze({ id: 'PAT-SYN-TRANSFORM-001', pattern: 'summary row snake_case -> camelCase', origin: 'syn-middleware response map', stage: 'Middleware transform' }),
]);

export const PAT_SYN_CATALOG = Object.freeze({
  version: PAT_SYN_VERSION,
  scoreBands: SYN_SCORE_STATUS_BANDS,
  signals: SYN_SEMANTIC_SIGNAL_TAXONOMY,
  rpcContracts: SYN_ANALYTICS_RPCS,
  patternOriginMatrix: PAT_SYN_PATTERN_ORIGIN_MATRIX,
});

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toTrimmedString(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toNonNegativeInteger(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(0, Math.round(numeric));
}

function clampNumber(value, min, max, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, numeric));
}

function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
    .filter((item) => item.length > 0);
}

function readValue(source, camelKey, snakeKey) {
  if (!isObject(source)) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(source, camelKey)) {
    return source[camelKey];
  }
  if (Object.prototype.hasOwnProperty.call(source, snakeKey)) {
    return source[snakeKey];
  }
  return undefined;
}

export function createEmptySynSemanticLayer() {
  return {
    causalHypotheses: [],
    counterintuitiveSignals: [],
    relationalConflicts: [],
    inflectionPoints: [],
    tacitBasis: [],
    tacticalFormula: {
      action: '',
      owner: '',
      timing: '',
      expectedOutcome: '',
    },
    executiveSummary: '',
  };
}

export function normalizeSynSemanticLayer(layer) {
  const source = isObject(layer) ? layer : {};
  const tactical = readValue(source, 'tacticalFormula', 'tactical_formula');
  const tacticalObject = isObject(tactical) ? tactical : {};

  return {
    causalHypotheses: toStringArray(readValue(source, 'causalHypotheses', 'causal_hypotheses')),
    counterintuitiveSignals: toStringArray(readValue(source, 'counterintuitiveSignals', 'counterintuitive_signals')),
    relationalConflicts: toStringArray(readValue(source, 'relationalConflicts', 'relational_conflicts')),
    inflectionPoints: toStringArray(readValue(source, 'inflectionPoints', 'inflection_points')),
    tacitBasis: toStringArray(readValue(source, 'tacitBasis', 'tacit_basis')),
    tacticalFormula: {
      action: toTrimmedString(readValue(tacticalObject, 'action', 'action')),
      owner: toTrimmedString(readValue(tacticalObject, 'owner', 'owner')),
      timing: toTrimmedString(readValue(tacticalObject, 'timing', 'timing')),
      expectedOutcome: toTrimmedString(readValue(tacticalObject, 'expectedOutcome', 'expected_outcome')),
    },
    executiveSummary: toTrimmedString(readValue(source, 'executiveSummary', 'executive_summary')),
  };
}

export function toSnakeSynSemanticLayer(layer) {
  const normalized = normalizeSynSemanticLayer(layer);

  return {
    causal_hypotheses: normalized.causalHypotheses,
    counterintuitive_signals: normalized.counterintuitiveSignals,
    relational_conflicts: normalized.relationalConflicts,
    inflection_points: normalized.inflectionPoints,
    tacit_basis: normalized.tacitBasis,
    tactical_formula: {
      action: normalized.tacticalFormula.action,
      owner: normalized.tacticalFormula.owner,
      timing: normalized.tacticalFormula.timing,
      expected_outcome: normalized.tacticalFormula.expectedOutcome,
    },
    executive_summary: normalized.executiveSummary,
  };
}

export function normalizeSynSemanticSignals(signals, semanticLayer) {
  const source = isObject(signals) ? signals : {};
  const normalizedSemanticLayer = normalizeSynSemanticLayer(semanticLayer);

  return {
    causalityCount: toNonNegativeInteger(readValue(source, 'causalityCount', 'causality_count'), normalizedSemanticLayer.causalHypotheses.length),
    counterintuitiveCount: toNonNegativeInteger(readValue(source, 'counterintuitiveCount', 'counterintuitive_count'), normalizedSemanticLayer.counterintuitiveSignals.length),
    relationalConflictCount: toNonNegativeInteger(readValue(source, 'relationalConflictCount', 'relational_conflict_count'), normalizedSemanticLayer.relationalConflicts.length),
    inflectionPointsCount: toNonNegativeInteger(readValue(source, 'inflectionPointsCount', 'inflection_points_count'), normalizedSemanticLayer.inflectionPoints.length),
    tacitBasisCount: toNonNegativeInteger(readValue(source, 'tacitBasisCount', 'tacit_basis_count'), normalizedSemanticLayer.tacitBasis.length),
    executiveSummary: toTrimmedString(readValue(source, 'executiveSummary', 'executive_summary'), normalizedSemanticLayer.executiveSummary),
  };
}

export function deriveSynStatusByScore(score) {
  const normalizedScore = clampNumber(score, 0, 100, 0);

  if (normalizedScore >= 80) {
    return {
      bandId: 'PAT-SYN-SCORE-001',
      score: normalizedScore,
      status: 'Quente',
      color: STATUS_HOT_COLOR,
    };
  }

  if (normalizedScore >= 60) {
    return {
      bandId: 'PAT-SYN-SCORE-002',
      score: normalizedScore,
      status: 'Morno',
      color: STATUS_WARM_COLOR,
    };
  }

  return {
    bandId: 'PAT-SYN-SCORE-003',
    score: normalizedScore,
    status: 'Frio',
    color: STATUS_COLD_COLOR,
  };
}

export function deriveSynScoreIA(score, scoreIA) {
  const baseScore = clampNumber(score, 0, 100, 0);
  const normalizedScoreIA = clampNumber(scoreIA ?? baseScore / 10, 0, 10, 0);

  return {
    value: normalizedScoreIA,
    text: normalizedScoreIA.toFixed(1),
    color: normalizedScoreIA >= 8 ? SCORE_GOOD_COLOR : SCORE_ATTENTION_COLOR,
  };
}

export function createEmptySynSemanticSignalsSummary() {
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

export function mapSynSemanticSummaryRow(row) {
  const source = isObject(row) ? row : {};

  return {
    entityKind: toTrimmedString(readValue(source, 'entityKind', 'entity_kind'), 'unknown') || 'unknown',
    events: toNonNegativeInteger(readValue(source, 'events', 'events')),
    causalitySignals: toNonNegativeInteger(readValue(source, 'causalitySignals', 'causality_signals')),
    counterintuitiveSignals: toNonNegativeInteger(readValue(source, 'counterintuitiveSignals', 'counterintuitive_signals')),
    relationalConflicts: toNonNegativeInteger(readValue(source, 'relationalConflicts', 'relational_conflicts')),
    inflectionPoints: toNonNegativeInteger(readValue(source, 'inflectionPoints', 'inflection_points')),
    tacitBasisSignals: toNonNegativeInteger(readValue(source, 'tacitBasisSignals', 'tacit_basis_signals')),
  };
}

export function normalizeSynSemanticSummaryTotals(totals) {
  const source = isObject(totals) ? totals : {};

  return {
    events: toNonNegativeInteger(readValue(source, 'events', 'events')),
    causalitySignals: toNonNegativeInteger(readValue(source, 'causalitySignals', 'causality_signals')),
    counterintuitiveSignals: toNonNegativeInteger(readValue(source, 'counterintuitiveSignals', 'counterintuitive_signals')),
    relationalConflicts: toNonNegativeInteger(readValue(source, 'relationalConflicts', 'relational_conflicts')),
    inflectionPoints: toNonNegativeInteger(readValue(source, 'inflectionPoints', 'inflection_points')),
    tacitBasisSignals: toNonNegativeInteger(readValue(source, 'tacitBasisSignals', 'tacit_basis_signals')),
  };
}

export function normalizeSynTone(tone, toneColor) {
  const value = toTrimmedString(tone, 'ANALÍTICO').toUpperCase();
  return {
    tone: value,
    toneColor: toTrimmedString(toneColor, TONE_DEFAULT_COLOR),
  };
}

export function getSynPatternCatalog() {
  return PAT_SYN_CATALOG;
}
