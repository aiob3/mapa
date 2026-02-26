import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import {
  normalizeSynSemanticLayer,
  toSnakeSynSemanticLayer,
} from '../../shared/syn/pat-syn-v1.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env.clickhouse'), quiet: true });

const DEFAULT_CHECKPOINT_PATH = '.context/runtime/checkpoints/supabase-clickhouse-semantic.json';
const DEFAULT_BATCH_SIZE = 200;
const DEFAULT_MAX_LOOPS = 100;
const DEFAULT_EMBEDDING_DIMS = 64;

function env(name, fallback = '') {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function parseBoolean(value, fallback = false) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parsePositiveInteger(value, fallback) {
  const n = Number(value);
  if (Number.isInteger(n) && n > 0) {
    return n;
  }
  return fallback;
}

function base64Credentials(user, password) {
  return Buffer.from(`${user}:${password}`).toString('base64');
}

function required(name) {
  const value = env(name);
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function resolveClickHouseConfig() {
  const host = env('CLICKHOUSE_HOST', '127.0.0.1');
  const port = env('CLICKHOUSE_HTTP_PORT', '8123');
  const user = env('CLICKHOUSE_MIDDLEWARE_USER', env('CLICKHOUSE_USER', 'mapa_app'));
  const password = env('CLICKHOUSE_MIDDLEWARE_PASSWORD', env('CLICKHOUSE_PASSWORD', 'mapa_local_dev_password'));
  const database = env('CLICKHOUSE_DB', 'mapa_semantic');

  return {
    baseUrl: `http://${host}:${port}`,
    user,
    password,
    database,
  };
}

function resolveClickHouseAdminConfig() {
  const host = env('CLICKHOUSE_HOST', '127.0.0.1');
  const port = env('CLICKHOUSE_HTTP_PORT', '8123');
  const user = env('CLICKHOUSE_USER', 'mapa_app');
  const password = env('CLICKHOUSE_PASSWORD', 'mapa_local_dev_password');
  const database = env('CLICKHOUSE_DB', 'mapa_semantic');

  return {
    baseUrl: `http://${host}:${port}`,
    user,
    password,
    database,
  };
}

async function clickHouseRequest(config, query, { body = '', expectJson = false } = {}) {
  const response = await fetch(`${config.baseUrl}/?query=${encodeURIComponent(query)}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64Credentials(config.user, config.password)}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`ClickHouse query failed (${response.status}): ${text.trim()}`);
  }

  if (!expectJson) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Falha ao interpretar resposta JSON do ClickHouse: ${text.slice(0, 300)}`);
  }
}

async function insertJsonEachRow(config, tableName, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }

  const payload = `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
  await clickHouseRequest(
    config,
    `INSERT INTO ${config.database}.${tableName} FORMAT JSONEachRow`,
    { body: payload },
  );
}

function resolveSemanticLayerFromEvent(event) {
  const semanticLayer = event.semantic_layer;
  const eventLayerSemantic = event.event_layer && typeof event.event_layer === 'object'
    ? event.event_layer.semantic_layer
    : null;
  const rawPayloadSemantic = event.raw_payload && typeof event.raw_payload === 'object'
    ? event.raw_payload.semantic_layer
    : null;

  return normalizeSynSemanticLayer(semanticLayer || eventLayerSemantic || rawPayloadSemantic || {});
}

function resolveEntityKind(event) {
  const fromEventLayer = event.event_layer && typeof event.event_layer === 'object'
    ? event.event_layer.entity_kind
    : null;
  const fromRawPayload = event.raw_payload && typeof event.raw_payload === 'object'
    ? event.raw_payload.entity_kind
    : null;
  const value = typeof fromEventLayer === 'string' ? fromEventLayer : typeof fromRawPayload === 'string' ? fromRawPayload : '';
  return value.trim() || 'deal';
}

function resolveSourceRef(event) {
  const fromRawPayload = event.raw_payload && typeof event.raw_payload === 'object'
    ? event.raw_payload.source_ref
    : null;
  const fromEventLayer = event.event_layer && typeof event.event_layer === 'object'
    ? event.event_layer.source_ref
    : null;

  if (typeof fromRawPayload === 'string' && fromRawPayload.trim()) {
    return fromRawPayload.trim();
  }
  if (typeof fromEventLayer === 'string' && fromEventLayer.trim()) {
    return fromEventLayer.trim();
  }
  return `supabase:canonical_events:${event.canonical_id_v2}`;
}

function resolveOwnerUserId(event) {
  const fromIam = event.iam_layer && typeof event.iam_layer === 'object'
    ? event.iam_layer.owner_user_id
    : null;
  const fromRawPayload = event.raw_payload && typeof event.raw_payload === 'object'
    ? event.raw_payload.owner_user_id
    : null;

  if (typeof fromIam === 'string' && fromIam.trim()) {
    return fromIam.trim();
  }
  if (typeof fromRawPayload === 'string' && fromRawPayload.trim()) {
    return fromRawPayload.trim();
  }
  return 'unknown';
}

function eventValue(event, key, fallback = '') {
  const fromEventLayer = event.event_layer && typeof event.event_layer === 'object'
    ? event.event_layer[key]
    : undefined;
  const fromRawPayload = event.raw_payload && typeof event.raw_payload === 'object'
    ? event.raw_payload[key]
    : undefined;

  if (typeof fromEventLayer === 'string' && fromEventLayer.trim()) {
    return fromEventLayer.trim();
  }
  if (typeof fromRawPayload === 'string' && fromRawPayload.trim()) {
    return fromRawPayload.trim();
  }
  return fallback;
}

function toClickHouseDateTime64(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '1970-01-01 00:00:00.000';
  }
  return parsed.toISOString().replace('T', ' ').replace('Z', '');
}

function buildSemanticChunks(event, semantic) {
  const chunks = [];
  const contextChunk = [
    `Lead: ${eventValue(event, 'lead_name', event.canonical_id_v2)}`,
    `Empresa: ${eventValue(event, 'company', 'N/A')}`,
    `Setor: ${eventValue(event, 'sector', 'Geral')}`,
    `Região: ${eventValue(event, 'region', 'Sem região')}`,
    `Local: ${eventValue(event, 'location', 'N/A')}`,
    `Resumo Executivo: ${semantic.executiveSummary || 'Sem resumo executivo informado.'}`,
  ].join('\n');

  chunks.push(contextChunk);

  if (semantic.causalHypotheses.length > 0) {
    chunks.push(`Hipóteses causais:\n- ${semantic.causalHypotheses.join('\n- ')}`);
  }
  if (semantic.counterintuitiveSignals.length > 0) {
    chunks.push(`Sinais contraintuitivos:\n- ${semantic.counterintuitiveSignals.join('\n- ')}`);
  }
  if (semantic.relationalConflicts.length > 0) {
    chunks.push(`Conflitos relacionais:\n- ${semantic.relationalConflicts.join('\n- ')}`);
  }
  if (semantic.inflectionPoints.length > 0) {
    chunks.push(`Pontos de inflexão:\n- ${semantic.inflectionPoints.join('\n- ')}`);
  }
  if (semantic.tacitBasis.length > 0) {
    chunks.push(`Embasamento tácito:\n- ${semantic.tacitBasis.join('\n- ')}`);
  }

  const tactical = semantic.tacticalFormula;
  if (tactical.action || tactical.owner || tactical.timing || tactical.expectedOutcome) {
    chunks.push([
      'Fórmula tática:',
      `Ação: ${tactical.action || 'N/A'}`,
      `Owner: ${tactical.owner || 'N/A'}`,
      `Timing: ${tactical.timing || 'N/A'}`,
      `Resultado esperado: ${tactical.expectedOutcome || 'N/A'}`,
    ].join('\n'));
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

function createHashEmbedding(text, dims = DEFAULT_EMBEDDING_DIMS) {
  const vector = Array.from({ length: dims }, () => 0);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    const slot = index % dims;
    vector[slot] += ((code % 67) - 33) / 50;
  }

  const norm = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

let hasWarnedEmbeddingFallback = false;

async function createEmbedding(text) {
  const useOpenAI = parseBoolean(env('SYN_INGEST_USE_OPENAI_EMBEDDINGS', 'false'), false);
  const apiKey = env('OPENAI_API_KEY');

  if (!useOpenAI || !apiKey) {
    return {
      embedding: createHashEmbedding(text),
      model: 'local-hash-v1',
    };
  }

  const model = env('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small');
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload?.data) || !Array.isArray(payload.data[0]?.embedding)) {
      throw new Error(JSON.stringify(payload));
    }

    return {
      embedding: payload.data[0].embedding,
      model,
    };
  } catch (error) {
    if (!hasWarnedEmbeddingFallback) {
      hasWarnedEmbeddingFallback = true;
      console.warn(`[syn-ingest] Falha ao gerar embedding OpenAI; fallback local será usado. Motivo: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      embedding: createHashEmbedding(text),
      model: 'local-hash-v1',
    };
  }
}

async function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readCheckpoint(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'string' ? parsed.lastUpdatedAt : null,
      lastCanonicalId: typeof parsed.lastCanonicalId === 'string' ? parsed.lastCanonicalId : '',
      lastRunAt: typeof parsed.lastRunAt === 'string' ? parsed.lastRunAt : null,
    };
  } catch {
    return {
      lastUpdatedAt: null,
      lastCanonicalId: '',
      lastRunAt: null,
    };
  }
}

async function writeCheckpoint(filePath, checkpoint) {
  await ensureParentDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(checkpoint, null, 2), 'utf8');
}

function compareEventCursor(aUpdatedAt, aCanonicalId, bUpdatedAt, bCanonicalId) {
  const timeA = Date.parse(aUpdatedAt);
  const timeB = Date.parse(bUpdatedAt);

  if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
    if (timeA !== timeB) {
      return timeA - timeB;
    }
  } else if (aUpdatedAt !== bUpdatedAt) {
    return aUpdatedAt.localeCompare(bUpdatedAt);
  }

  return aCanonicalId.localeCompare(bCanonicalId);
}

function isAfterCheckpoint(event, checkpoint) {
  if (!checkpoint.lastUpdatedAt) {
    return true;
  }

  return compareEventCursor(
    event.updated_at,
    event.canonical_id_v2,
    checkpoint.lastUpdatedAt,
    checkpoint.lastCanonicalId || '',
  ) > 0;
}

function resolveSupabaseConfig() {
  const projectUrl = required('SUPABASE_PROJECT_URL').replace(/\/+$/, '');
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');

  return {
    projectUrl,
    serviceRoleKey,
  };
}

async function fetchSupabaseEventsBatchWithColumns({ cursor, batchSize, selectColumns }) {
  const supabase = resolveSupabaseConfig();
  const query = new URLSearchParams();
  query.set('select', selectColumns);
  query.set('status', 'eq.active');
  query.set('order', 'updated_at.asc,canonical_id_v2.asc');
  query.set('limit', String(batchSize));

  if (cursor?.lastUpdatedAt) {
    const cursorCanonicalId = cursor.lastCanonicalId || '';
    if (cursorCanonicalId) {
      query.set(
        'or',
        `(updated_at.gt.${cursor.lastUpdatedAt},and(updated_at.eq.${cursor.lastUpdatedAt},canonical_id_v2.gt.${cursorCanonicalId}))`,
      );
    } else {
      query.set('updated_at', `gt.${cursor.lastUpdatedAt}`);
    }
  }

  const response = await fetch(`${supabase.projectUrl}/rest/v1/canonical_events?${query.toString()}`, {
    method: 'GET',
    headers: {
      apikey: supabase.serviceRoleKey,
      Authorization: `Bearer ${supabase.serviceRoleKey}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
    },
  });

  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`Supabase fetch failed (${response.status}): ${text}`);
    error.statusCode = response.status;
    error.rawBody = text;
    throw error;
  }

  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch {
    throw new Error(`Resposta Supabase inválida: ${text.slice(0, 500)}`);
  }
}

async function fetchSupabaseEventsBatch({ cursor, batchSize }) {
  const baseColumns = 'canonical_id_v2,event_layer,raw_payload,iam_layer,updated_at,status';
  const withSemanticLayer = `${baseColumns},semantic_layer`;

  try {
    return await fetchSupabaseEventsBatchWithColumns({
      cursor,
      batchSize,
      selectColumns: withSemanticLayer,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const semanticLayerMissing = message.includes('semantic_layer') && message.includes('does not exist');
    if (!semanticLayerMissing) {
      throw error;
    }

    return fetchSupabaseEventsBatchWithColumns({
      cursor,
      batchSize,
      selectColumns: baseColumns,
    });
  }
}

async function ingestEventIntoClickHouse(clickhouse, event, { dryRun = false } = {}) {
  const semantic = resolveSemanticLayerFromEvent(event);
  const semanticSnake = toSnakeSynSemanticLayer(semantic);
  const sourceTs = toClickHouseDateTime64(event.updated_at);
  const canonicalId = event.canonical_id_v2;
  const entityKind = resolveEntityKind(event);
  const sourceRef = resolveSourceRef(event);
  const ownerUserId = resolveOwnerUserId(event);

  const signalRow = {
    canonical_id_v2: canonicalId,
    entity_kind: entityKind,
    causal_hypotheses: semanticSnake.causal_hypotheses,
    counterintuitive_signals: semanticSnake.counterintuitive_signals,
    relational_conflicts: semanticSnake.relational_conflicts,
    inflection_points: semanticSnake.inflection_points,
    tacit_basis: semanticSnake.tacit_basis,
    executive_summary: semanticSnake.executive_summary,
    tactical_action: semanticSnake.tactical_formula.action,
    tactical_owner: semanticSnake.tactical_formula.owner,
    tactical_timing: semanticSnake.tactical_formula.timing,
    tactical_expected_outcome: semanticSnake.tactical_formula.expected_outcome,
    owner_user_id: ownerUserId,
    source_ref: sourceRef,
    source_ts: sourceTs,
  };

  const chunkTexts = buildSemanticChunks(event, semantic);
  const chunks = [];
  for (const chunkText of chunkTexts) {
    const embedding = await createEmbedding(chunkText);
    chunks.push({
      canonical_id_v2: canonicalId,
      entity_kind: entityKind,
      chunk_text: chunkText,
      embedding: embedding.embedding,
      embedding_model: embedding.model,
      source_ref: sourceRef,
      owner_user_id: ownerUserId,
      metadata_json: JSON.stringify({
        source_ts: sourceTs,
        semantic_counts: {
          causality: semantic.causalHypotheses.length,
          counterintuitive: semantic.counterintuitiveSignals.length,
          relational: semantic.relationalConflicts.length,
          inflection: semantic.inflectionPoints.length,
          tacit: semantic.tacitBasis.length,
        },
      }),
      created_at: sourceTs,
      updated_at: sourceTs,
    });
  }

  if (!dryRun) {
    await insertJsonEachRow(clickhouse, 'semantic_signals_v1', [signalRow]);
    await insertJsonEachRow(clickhouse, 'semantic_chunks_v1', chunks);
  }

  return {
    chunks: chunks.length,
    signals: 1,
  };
}

export async function runSupabaseClickHouseSemanticSync(options = {}) {
  const batchSize = parsePositiveInteger(options.batchSize, parsePositiveInteger(env('SYN_INGEST_BATCH_SIZE'), DEFAULT_BATCH_SIZE));
  const maxLoops = parsePositiveInteger(options.maxLoops, parsePositiveInteger(env('SYN_INGEST_MAX_LOOPS'), DEFAULT_MAX_LOOPS));
  const dryRun = Boolean(options.dryRun);
  const checkpointFile = path.resolve(process.cwd(), options.checkpointFile || env('SYN_INGEST_CHECKPOINT_PATH', DEFAULT_CHECKPOINT_PATH));

  const clickhouse = resolveClickHouseConfig();
  const checkpoint = await readCheckpoint(checkpointFile);

  const stats = {
    startedAt: new Date().toISOString(),
    finishedAt: null,
    dryRun,
    batchSize,
    maxLoops,
    loops: 0,
    fetched: 0,
    processed: 0,
    signalsInserted: 0,
    chunksInserted: 0,
    checkpointBefore: { ...checkpoint },
    checkpointAfter: null,
    checkpointFile,
  };

  for (let loopIndex = 0; loopIndex < maxLoops; loopIndex += 1) {
    const fetched = await fetchSupabaseEventsBatch({
      cursor: checkpoint,
      batchSize,
    });

    stats.fetched += fetched.length;

    const candidates = fetched.filter((event) => isAfterCheckpoint(event, checkpoint));
    if (candidates.length === 0) {
      break;
    }

    for (const event of candidates) {
      const result = await ingestEventIntoClickHouse(clickhouse, event, { dryRun });
      checkpoint.lastUpdatedAt = event.updated_at;
      checkpoint.lastCanonicalId = event.canonical_id_v2;
      checkpoint.lastRunAt = new Date().toISOString();

      if (!dryRun) {
        await writeCheckpoint(checkpointFile, checkpoint);
      }

      stats.processed += 1;
      stats.signalsInserted += result.signals;
      stats.chunksInserted += result.chunks;
    }

    stats.loops = loopIndex + 1;

    if (fetched.length < batchSize) {
      break;
    }
  }

  stats.finishedAt = new Date().toISOString();
  stats.checkpointAfter = { ...checkpoint };

  return stats;
}

export async function fetchSemanticSignalsSummary() {
  const clickhouse = resolveClickHouseConfig();
  const payload = await clickHouseRequest(
    clickhouse,
    [
      'SELECT',
      '  entity_kind,',
      '  events,',
      '  causality_signals,',
      '  counterintuitive_signals,',
      '  relational_conflicts,',
      '  inflection_points,',
      '  tacit_basis_signals',
      `FROM ${clickhouse.database}.semantic_signals_summary_v1`,
      'ORDER BY inflection_points DESC',
      'FORMAT JSON',
    ].join('\n'),
    { expectJson: true },
  );

  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const totals = rows.reduce(
    (acc, row) => ({
      events: acc.events + Number(row.events || 0),
      causalitySignals: acc.causalitySignals + Number(row.causality_signals || 0),
      counterintuitiveSignals: acc.counterintuitiveSignals + Number(row.counterintuitive_signals || 0),
      relationalConflicts: acc.relationalConflicts + Number(row.relational_conflicts || 0),
      inflectionPoints: acc.inflectionPoints + Number(row.inflection_points || 0),
      tacitBasisSignals: acc.tacitBasisSignals + Number(row.tacit_basis_signals || 0),
    }),
    {
      events: 0,
      causalitySignals: 0,
      counterintuitiveSignals: 0,
      relationalConflicts: 0,
      inflectionPoints: 0,
      tacitBasisSignals: 0,
    },
  );

  return {
    rows,
    totals,
    generatedAt: new Date().toISOString(),
  };
}

function escapeIdentifier(value) {
  return `\`${String(value).replace(/`/g, '``')}\``;
}

function escapeLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function provisionClickHouseSynUser(options = {}) {
  const adminConfig = resolveClickHouseAdminConfig();
  const database = options.database || env('CLICKHOUSE_DB', 'mapa_semantic');
  const targetUser = options.user || env('CLICKHOUSE_MIDDLEWARE_USER', 'mapa_syn_middleware');
  const targetPassword = options.password || env('CLICKHOUSE_MIDDLEWARE_PASSWORD', 'mapa_syn_middleware_dev_password');

  const safeUser = escapeIdentifier(targetUser);
  const safePassword = escapeLiteral(targetPassword);
  const safeDatabase = escapeIdentifier(database);

  await clickHouseRequest(adminConfig, `CREATE USER IF NOT EXISTS ${safeUser} IDENTIFIED WITH plaintext_password BY '${safePassword}'`);
  await clickHouseRequest(adminConfig, `GRANT SELECT, INSERT ON ${safeDatabase}.* TO ${safeUser}`);

  return {
    user: targetUser,
    database,
    grants: ['SELECT', 'INSERT'],
    generatedAt: new Date().toISOString(),
  };
}

export async function pingClickHouse() {
  const clickhouse = resolveClickHouseConfig();
  const ping = await clickHouseRequest(clickhouse, 'SELECT 1 AS ok FORMAT JSON', { expectJson: true });
  const ok = Array.isArray(ping?.data) && Number(ping.data[0]?.ok) === 1;
  return {
    ok,
    baseUrl: clickhouse.baseUrl,
    database: clickhouse.database,
  };
}
