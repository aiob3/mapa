import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import {
  createEmptySynSemanticLayer,
  deriveSynScoreIA,
  deriveSynStatusByScore,
  normalizeSynTone,
  toSnakeSynSemanticLayer,
} from '../shared/syn/pat-syn-v1.mjs';
import {
  buildCanonicalEventIdBySource,
  buildCanonicalSubjectId,
  buildPayloadHash,
  buildSourceIdempotencyKey,
  normalizeSourceContract,
  normalizeSubjectKey,
} from '../shared/syn/pat-syn-source-v1.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

const DEFAULT_INPUT_FILE = '.context/raw_db_data/deals-24018612-725.csv';
const DEFAULT_SOURCE_SYSTEM = 'pipedrive';
const DEFAULT_SOURCE_ENTITY = 'deal';
const DEFAULT_MIN_COVERAGE = 90;

function env(name, fallback = '') {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function required(name) {
  const value = env(name);
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    file: DEFAULT_INPUT_FILE,
    limit: null,
    dryRun: false,
    minCoverage: Number(env('SYN_RAW_INGEST_MIN_COVERAGE', String(DEFAULT_MIN_COVERAGE))),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--file') {
      options.file = argv[index + 1] || options.file;
      index += 1;
      continue;
    }

    if (value === '--limit') {
      const parsed = Number(argv[index + 1]);
      options.limit = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
      index += 1;
      continue;
    }

    if (value === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (value === '--min-coverage') {
      const parsed = Number(argv[index + 1]);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
        options.minCoverage = parsed;
      }
      index += 1;
      continue;
    }
  }

  return options;
}

function parseCsv(text) {
  const input = String(text || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const ch = input[index];
    const next = input[index + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (ch === '\r') {
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function rowsToRecords(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((value) => String(value || '').trim());
  const records = [];

  for (const row of rows.slice(1)) {
    const hasContent = row.some((cell) => String(cell || '').trim().length > 0);
    if (!hasContent) {
      continue;
    }

    const record = {};
    for (let index = 0; index < headers.length; index += 1) {
      record[headers[index]] = String(row[index] ?? '').trim();
    }
    records.push(record);
  }

  return records;
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const raw = String(value).trim();
  if (!raw) {
    return fallback;
  }

  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInteger(value, fallback = 0) {
  return Math.round(toNumber(value, fallback));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function md5(value) {
  return createHash('md5').update(String(value ?? '')).digest('hex');
}

function normalizeOwnerUserId(ownerLabel) {
  const ownerMapRaw = env('SYN_OWNER_MAP_JSON', '');
  if (ownerMapRaw) {
    try {
      const parsed = JSON.parse(ownerMapRaw);
      if (parsed && typeof parsed === 'object') {
        const mapped = parsed[String(ownerLabel || '').trim()];
        if (typeof mapped === 'string' && mapped.trim().length > 0) {
          return mapped.trim();
        }
      }
    } catch {
      // no-op: mapeamento inválido não deve interromper ingestão.
    }
  }

  return 'unknown';
}

function parseDateToIso(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const candidate = new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00.000Z`);
    if (!Number.isNaN(candidate.getTime())) {
      return candidate.toISOString();
    }
  }

  return '';
}

function quarterOfIso(iso) {
  if (!iso) {
    return 'q1';
  }
  const d = new Date(iso);
  const quarter = Math.floor(d.getUTCMonth() / 3) + 1;
  const yearShort = String(d.getUTCFullYear()).slice(-2);
  return `${yearShort}q${quarter}`;
}

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-_/]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildAtoms(record, sourceId, updatedAtIso, ownerLabel) {
  const stage = record['Negócio - Etapa'] || '';
  const title = record['Negócio - Título'] || '';
  const quarter = quarterOfIso(updatedAtIso);

  const atoms = [
    { key: 'q', raw: quarter, order: 1 },
    { key: 'l', raw: title || `deal-${sourceId}`, order: 2 },
    { key: 'k', raw: updatedAtIso || '1970-01-01T00:00:00.000Z', order: 3 },
    { key: 'a', raw: ownerLabel || 'unknown', order: 4 },
    { key: 's', raw: stage || 'sem-etapa', order: 5 },
  ];

  return atoms.map((atom) => ({
    key: atom.key,
    raw: atom.raw,
    normalized: normalizeToken(atom.raw),
    order: atom.order,
    source: 'raw-db:pipedrive:deals',
  }));
}

function deriveTone(originField) {
  const value = String(originField || '').trim().toLowerCase();
  if (value.includes('evento')) {
    return normalizeSynTone('PROVOCATIVO', '#C64928');
  }
  if (value.includes('outbound')) {
    return normalizeSynTone('DIRETO', '#8B5CF6');
  }
  if (value.includes('inbound')) {
    return normalizeSynTone('EMPÁTICO', '#2E4C3B');
  }
  return normalizeSynTone('ANALÍTICO', '#4A6FA5');
}

function deriveScore(record) {
  const probability = toNumber(record['Negócio - Probabilidade'], 50);
  const stage = String(record['Negócio - Etapa'] || '').toLowerCase();
  const status = String(record['Negócio - Status'] || '').toLowerCase();
  const temperature = String(record['Negócio - Temperatura'] || '').toLowerCase();

  let score = probability;

  if (stage.includes('negociação') || stage.includes('negociacao') || stage.includes('fechamento')) {
    score += 10;
  } else if (stage.includes('descoberta')) {
    score += 2;
  }

  if (status.includes('perdido')) {
    score = Math.min(score, 25);
  } else if (status.includes('ganho')) {
    score = Math.max(score, 92);
  }

  if (temperature.includes('hot') || temperature.includes('quente')) {
    score += 15;
  } else if (temperature.includes('warm') || temperature.includes('morno')) {
    score += 6;
  } else if (temperature.includes('cold') || temperature.includes('frio')) {
    score -= 10;
  }

  return clamp(Math.round(score), 0, 100);
}

function deriveEngagement(record) {
  const done = toInteger(record['Negócio - Atividades concluídas'], 0);
  const todo = toInteger(record['Negócio - Atividades para fazer'], 0);
  const total = Math.max(toInteger(record['Negócio - Total de atividades'], done + todo), done + todo);
  const emails = toInteger(record['Negócio - Número de mensagens de e-mail'], 0);

  const openRate = total > 0 ? (done / total) * 100 : clamp(emails * 3, 0, 100);
  const clickRate = clamp(openRate * 0.58 + Math.min(20, done * 0.8), 0, 100);

  return {
    openRate: Number(openRate.toFixed(2)),
    clickRate: Number(clickRate.toFixed(2)),
  };
}

function pickValue(...values) {
  for (const value of values) {
    const text = String(value || '').trim();
    if (text) {
      return text;
    }
  }
  return '';
}

function mapDealRecord(record, ingestionBatchId) {
  const sourceSystem = DEFAULT_SOURCE_SYSTEM;
  const sourceEntity = DEFAULT_SOURCE_ENTITY;
  const sourceId = pickValue(record['Negócio - ID']);

  if (!sourceId) {
    return {
      ok: false,
      reason: 'Linha sem Negócio - ID.',
    };
  }

  const sourceUpdatedAt = pickValue(
    parseDateToIso(record['Negócio - Atualizado em']),
    parseDateToIso(record['Negócio - Última alteração de etapa']),
    parseDateToIso(record['Negócio - Negócio criado em']),
  );

  const subjectKey = `${sourceSystem}:${sourceEntity}:${sourceId}`;
  const subjectKeyNormalized = normalizeSubjectKey(subjectKey);
  const canonicalSubjectId = buildCanonicalSubjectId(sourceSystem, subjectKeyNormalized);
  const canonicalId = buildCanonicalEventIdBySource(sourceSystem, sourceEntity, sourceId);

  const rawPayload = {
    source_system: sourceSystem,
    source_entity: sourceEntity,
    source_id: sourceId,
    extracted_from: 'raw_db_data/deals-24018612-725.csv',
    row: record,
  };
  const payloadHash = buildPayloadHash(rawPayload);
  const idempotencyKey = buildSourceIdempotencyKey(sourceSystem, sourceEntity, sourceId, payloadHash);

  const sourceContract = normalizeSourceContract({
    sourceSystem,
    sourceEntity,
    sourceId,
    subjectKey,
    sourceUpdatedAt,
    payloadHash,
    ingestionBatchId,
    canonicalSubjectId,
  });

  const score = deriveScore(record);
  const status = deriveSynStatusByScore(score);
  const scoreIA = deriveSynScoreIA(score, null);
  const tone = deriveTone(record['Negócio - Origem da Oportunidade'] || record['Negócio - Origem']);
  const engagement = deriveEngagement(record);
  const ownerLabel = pickValue(record['Negócio - Proprietário'], record['Organização - Proprietário'], record['Pessoa - Proprietário']);
  const ownerUserId = normalizeOwnerUserId(ownerLabel);

  const company = pickValue(record['Negócio - Organização'], record['Organização - Nome'], 'Conta sem nome');
  const leadName = pickValue(record['Pessoa - Nome'], record['Negócio - Pessoa de contato'], record['Negócio - Título'], `Lead ${sourceId}`);
  const sector = pickValue(record['Negócio - Segmento'], record['Organização - Setor'], 'Geral');
  const region = pickValue(record['Organização - Região de Endereço'], record['Organização - Estado de Endereço'], 'Sem região');
  const city = pickValue(record['Organização - Cidade/município/vila/localidade de Endereço']);
  const state = pickValue(record['Organização - Estado de Endereço']);
  const location = pickValue([city, state].filter(Boolean).join(' - '), city, state, 'N/A');

  const semanticLayer = toSnakeSynSemanticLayer(createEmptySynSemanticLayer());
  const atoms = buildAtoms(record, sourceId, sourceUpdatedAt, ownerLabel);

  const eventLayer = {
    lead_name: leadName,
    company,
    sector,
    region,
    location,
    deal_value: toNumber(record['Negócio - Valor'], 0),
    score,
    status: status.status,
    status_color: status.color,
    open_rate: engagement.openRate,
    click_rate: engagement.clickRate,
    tone: tone.tone,
    tone_color: tone.toneColor,
    score_ia: scoreIA.value,
    entity_kind: 'deal',
    canonical_subject_id: canonicalSubjectId,
    source_ref: `${sourceSystem}:${sourceEntity}:${sourceId}`,
    source_contract: sourceContract,
    semantic_layer: semanticLayer,
  };

  const iamLayer = {
    owner_user_id: ownerUserId,
    owner_label: ownerLabel || 'unknown',
    source_system: sourceSystem,
  };

  const warnings = [];
  if (ownerUserId === 'unknown') {
    warnings.push(`owner_user_id ausente para Negócio - ID=${sourceId}; fallback aplicado para "unknown".`);
  }
  if (!sourceUpdatedAt) {
    warnings.push(`sourceUpdatedAt ausente para Negócio - ID=${sourceId}; fallback vazio aplicado.`);
  }

  return {
    ok: true,
    sourceSystem,
    sourceEntity,
    sourceId,
    canonicalId,
    canonicalSubjectId,
    idempotencyKey,
    payloadHash,
    sourceUpdatedAt: sourceUpdatedAt || null,
    atoms,
    eventLayer,
    iamLayer,
    rawPayload: {
      ...rawPayload,
      source_contract: sourceContract,
    },
    sourceContract,
    warnings,
  };
}

async function httpJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    ok: response.ok,
    status: response.status,
    json,
    text,
  };
}

async function callSupabaseRpc({ projectUrl, serviceRoleKey, rpcName, args }) {
  const response = await httpJson(`${projectUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    throw new Error(`RPC ${rpcName} falhou (${response.status}): ${response.text}`);
  }

  return response.json;
}

async function fetchIngestionStatus({ projectUrl, serviceRoleKey, canonicalId, idempotencyKey }) {
  const query = new URLSearchParams();
  query.set('select', 'ingestion_status,processed_at');
  query.set('canonical_id_v2', `eq.${canonicalId}`);
  query.set('idempotency_key', `eq.${idempotencyKey}`);
  query.set('order', 'processed_at.desc');
  query.set('limit', '1');

  const response = await httpJson(`${projectUrl}/rest/v1/canonical_ingestion_runs?${query.toString()}`, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok || !Array.isArray(response.json) || response.json.length === 0) {
    return 'rejected';
  }

  const status = response.json[0]?.ingestion_status;
  return typeof status === 'string' && status.trim() ? status.trim() : 'rejected';
}

async function ingestRow({ mapped, projectUrl, serviceRoleKey, dryRun }) {
  if (dryRun) {
    return {
      status: 'dry_run',
    };
  }

  await callSupabaseRpc({
    projectUrl,
    serviceRoleKey,
    rpcName: 'upsert_canonical_event_v2',
    args: {
      p_canonical_id_v2: mapped.canonicalId,
      p_idempotency_key: mapped.idempotencyKey,
      p_event_layer: mapped.eventLayer,
      p_iam_layer: mapped.iamLayer,
      p_raw_payload: mapped.rawPayload,
      p_atoms: mapped.atoms,
      p_legacy_id_iov: mapped.sourceId,
      p_legacy_io_opp: mapped.sourceId,
      p_legacy_iv_vdd: null,
      p_normalization_status: 'homologated',
      p_normalization_warnings: mapped.warnings,
      p_normalization_error: null,
      p_raw_payload_text: JSON.stringify(mapped.rawPayload),
    },
  });

  await callSupabaseRpc({
    projectUrl,
    serviceRoleKey,
    rpcName: 'upsert_canonical_source_registry_v1',
    args: {
      p_source_system: mapped.sourceSystem,
      p_source_entity: mapped.sourceEntity,
      p_source_id: mapped.sourceId,
      p_canonical_subject_id: mapped.canonicalSubjectId,
      p_canonical_id_v2: mapped.canonicalId,
      p_idempotency_key: mapped.idempotencyKey,
      p_payload_hash: mapped.payloadHash,
      p_source_updated_at: mapped.sourceUpdatedAt,
    },
  });

  const status = await fetchIngestionStatus({
    projectUrl,
    serviceRoleKey,
    canonicalId: mapped.canonicalId,
    idempotencyKey: mapped.idempotencyKey,
  });

  return {
    status,
  };
}

function coveragePercent(rowsValid, rowsRead) {
  if (!rowsRead) {
    return 0;
  }
  return Number(((rowsValid / rowsRead) * 100).toFixed(2));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputFile = path.resolve(process.cwd(), options.file);
  const startedAt = new Date().toISOString();
  const ingestionBatchId = `raw-deals-${Date.now()}`;

  const text = await fs.readFile(inputFile, 'utf8');
  const records = rowsToRecords(parseCsv(text));
  const limitedRecords = options.limit ? records.slice(0, options.limit) : records;

  const report = {
    startedAt,
    finishedAt: null,
    dryRun: options.dryRun,
    sourceSystem: DEFAULT_SOURCE_SYSTEM,
    sourceEntity: DEFAULT_SOURCE_ENTITY,
    inputFile,
    ingestionBatchId,
    rows_read: limitedRecords.length,
    rows_valid: 0,
    rows_rejected: 0,
    rows_inserted: 0,
    rows_updated: 0,
    rows_deduplicated: 0,
    coverage_percent: 0,
    warnings: [],
    errors: [],
  };

  const projectUrl = options.dryRun ? '' : required('SUPABASE_PROJECT_URL').replace(/\/+$/, '');
  const serviceRoleKey = options.dryRun ? '' : required('SUPABASE_SERVICE_ROLE_KEY');

  for (const record of limitedRecords) {
    const mapped = mapDealRecord(record, ingestionBatchId);
    if (!mapped.ok) {
      report.rows_rejected += 1;
      report.errors.push(mapped.reason);
      continue;
    }

    report.rows_valid += 1;
    report.warnings.push(...mapped.warnings);

    try {
      const result = await ingestRow({
        mapped,
        projectUrl,
        serviceRoleKey,
        dryRun: options.dryRun,
      });

      if (result.status === 'inserted') {
        report.rows_inserted += 1;
      } else if (result.status === 'updated') {
        report.rows_updated += 1;
      } else if (result.status === 'deduplicated') {
        report.rows_deduplicated += 1;
      }
    } catch (error) {
      report.rows_rejected += 1;
      report.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  report.coverage_percent = coveragePercent(report.rows_valid, report.rows_read);
  report.finishedAt = new Date().toISOString();

  const uniqueWarnings = [...new Set(report.warnings)];
  report.warnings = uniqueWarnings.slice(0, 80);

  console.log(JSON.stringify(report, null, 2));

  if (report.coverage_percent < options.minCoverage) {
    throw new Error(`Cobertura de ingestão abaixo do mínimo (${report.coverage_percent}% < ${options.minCoverage}%).`);
  }

  if (report.rows_valid === 0) {
    throw new Error('Nenhuma linha válida encontrada para ingestão.');
  }

  if (report.rows_rejected > 0 || report.errors.length > 0) {
    throw new Error(`Ingestão concluída com rejeições (${report.rows_rejected})/erros (${report.errors.length}).`);
  }
}

main().catch((error) => {
  console.error(`[syn-ingest:raw] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
