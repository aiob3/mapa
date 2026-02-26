import fs from 'node:fs';
import path from 'node:path';

type JsonRecord = Record<string, unknown>;

interface SynCatalog {
  version: string;
  rpcContracts: string[];
  scoreBands: Array<{ id: string; minScore: number; maxScore: number; status: string; color: string }>;
  signals: Array<{ id: string; dtoKey: string; storageKey: string; summaryKey: string; summaryColumn: string }>;
  patternOriginMatrix: Array<{ id: string; pattern: string; origin: string; stage: string }>;
}

interface SynFixtures {
  rpc: Record<string, unknown>;
  middlewareSummary: {
    rows: unknown[];
    totals: JsonRecord;
  };
}

const catalogPath = path.resolve(__dirname, '../../shared/syn/pat-syn-catalog.v1.json');
const fixturesPath = path.resolve(__dirname, 'fixtures/syn-rpc-contract-fixtures.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as SynCatalog;
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8')) as SynFixtures;

function assertNumber(value: unknown): asserts value is number {
  expect(typeof value).toBe('number');
  expect(Number.isFinite(value as number)).toBe(true);
}

function assertString(value: unknown): asserts value is string {
  expect(typeof value).toBe('string');
  expect((value as string).trim().length).toBeGreaterThan(0);
}

function expectLeadSchema(value: unknown) {
  expect(Array.isArray(value)).toBe(true);
  const [lead] = value as JsonRecord[];
  expect(lead).toBeDefined();
  assertString(lead.id);
  assertString(lead.name);
  assertString(lead.company);
  assertNumber(lead.score);
  assertString(lead.status);
  assertString(lead.statusColor);
}

function expectKpiSchema(value: unknown) {
  const kpi = value as JsonRecord;
  assertNumber(kpi.leadsAtivos);
  assertNumber(kpi.contratosVigentes);
  assertNumber(kpi.leadsEmAberto);
  assertNumber(kpi.pipelineTotal);
  assertNumber(kpi.winRate);
}

function expectHeatmapSchema(value: unknown) {
  const heatmap = value as JsonRecord;
  expect(Array.isArray(heatmap.heatmapMetrics)).toBe(true);
  expect(Array.isArray(heatmap.heatmapData)).toBe(true);
  expect(Array.isArray(heatmap.pipelineData)).toBe(true);
}

function expectOutreachSchema(value: unknown) {
  const outreach = value as JsonRecord;
  expect(Array.isArray(outreach.chartData)).toBe(true);
  expect(Array.isArray(outreach.radarData)).toBe(true);
  expect(Array.isArray(outreach.leads)).toBe(true);
  assertString(outreach.globalConversionRate);
}

function expectSectorSchema(value: unknown) {
  const sector = value as JsonRecord;
  expect(Array.isArray(sector.scatterData)).toBe(true);
  expect(Array.isArray(sector.conversionInsights)).toBe(true);
  expect(Array.isArray(sector.aiRecommendations)).toBe(true);
}

describe('syn pattern contracts', () => {
  it('keeps RPC contract catalog aligned with fixtures', () => {
    expect(catalog.version).toBe('PAT-SYN-v1');
    expect(Array.isArray(catalog.rpcContracts)).toBe(true);
    expect(catalog.rpcContracts).toHaveLength(5);

    for (const rpcName of catalog.rpcContracts) {
      expect(fixtures.rpc[rpcName]).toBeDefined();
    }
  });

  it('validates fixture schema by RPC contract', () => {
    expectKpiSchema(fixtures.rpc.api_syn_kpis_v1);
    expectLeadSchema(fixtures.rpc.api_syn_leads_v1);
    expectHeatmapSchema(fixtures.rpc.api_syn_heatmap_v1);
    expectOutreachSchema(fixtures.rpc.api_syn_outreach_v1);
    expectSectorSchema(fixtures.rpc.api_syn_sector_v1);
  });

  it('validates score and signal taxonomy schema', () => {
    expect(catalog.scoreBands).toHaveLength(3);
    expect(catalog.scoreBands.map((band) => band.id)).toEqual([
      'PAT-SYN-SCORE-001',
      'PAT-SYN-SCORE-002',
      'PAT-SYN-SCORE-003',
    ]);

    for (const signal of catalog.signals) {
      assertString(signal.id);
      assertString(signal.dtoKey);
      assertString(signal.storageKey);
      assertString(signal.summaryKey);
      assertString(signal.summaryColumn);
    }
  });

  it('enforces shared normalizer adoption in app and middleware layers', () => {
    const analyticsApiSource = fs.readFileSync(path.resolve(__dirname, '../../mapa-app/src/app/services/analytics/analyticsApi.ts'), 'utf8');
    const mappersSource = fs.readFileSync(path.resolve(__dirname, '../../mapa-app/src/app/services/analytics/mappers.ts'), 'utf8');
    const runtimeSource = fs.readFileSync(path.resolve(__dirname, '../../scripts/lib/syn-semantic-runtime.mjs'), 'utf8');
    const validatorSource = fs.readFileSync(path.resolve(__dirname, '../../scripts/validate-syn-post-migration.mjs'), 'utf8');

    expect(analyticsApiSource).toContain('@syn-patterns');
    expect(analyticsApiSource).toContain('SYN_ANALYTICS_RPC');
    expect(mappersSource).toContain('@syn-patterns');
    expect(mappersSource).toContain('deriveSynStatusByScore');
    expect(runtimeSource).toContain('../../shared/syn/pat-syn-v1.mjs');
    expect(runtimeSource).toContain('normalizeSynSemanticLayer');
    expect(validatorSource).toContain('../shared/syn/pat-syn-v1.mjs');
    expect(validatorSource).toContain('SYN_ANALYTICS_RPCS');
  });

  it('keeps stable snapshot for PAT-SYN catalog and RPC fixtures', () => {
    expect({
      catalog,
      fixtures,
    }).toMatchSnapshot();
  });
});
