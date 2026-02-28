import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

function tsSp() {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter
    .formatToParts(new Date())
    .reduce((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

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
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    outputDir: '',
    runId: '',
    watermarkStart: '',
    watermarkEnd: '',
    batchSize: 500,
    maxRows: 50000,
    allowTruncated: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--output-dir') {
      options.outputDir = argv[index + 1] || options.outputDir;
      index += 1;
      continue;
    }

    if (value === '--run-id') {
      options.runId = argv[index + 1] || options.runId;
      index += 1;
      continue;
    }

    if (value === '--watermark-start') {
      options.watermarkStart = argv[index + 1] || options.watermarkStart;
      index += 1;
      continue;
    }

    if (value === '--watermark-end') {
      options.watermarkEnd = argv[index + 1] || options.watermarkEnd;
      index += 1;
      continue;
    }

    if (value === '--batch-size') {
      const parsed = Number(argv[index + 1]);
      if (Number.isInteger(parsed) && parsed > 0) {
        options.batchSize = parsed;
      }
      index += 1;
      continue;
    }

    if (value === '--max-rows') {
      const parsed = Number(argv[index + 1]);
      if (Number.isInteger(parsed) && parsed > 0) {
        options.maxRows = parsed;
      }
      index += 1;
      continue;
    }

    if (value === '--allow-truncated') {
      options.allowTruncated = true;
      continue;
    }
  }

  return options;
}

function normalizeEntityKind(row) {
  const fromEvent = row?.event_layer && typeof row.event_layer === 'object'
    ? row.event_layer.entity_kind
    : '';
  const fromRaw = row?.raw_payload && typeof row.raw_payload === 'object'
    ? row.raw_payload.entity_kind
    : '';
  return String(fromEvent || fromRaw || '').trim().toLowerCase();
}

function safeIso(value, fallback = '') {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function csvEscape(value) {
  const raw = String(value ?? '');
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n') || raw.includes('\r')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function makeSha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function chunk(values, size) {
  const chunks = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}

async function httpJson(url, headers) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: response.ok, status: response.status, json, text };
}

async function fetchCanonicalEvents({ projectUrl, serviceRoleKey, batchSize, maxRows, watermarkStart, watermarkEnd }) {
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: 'application/json',
  };

  let cursor = 0;
  const rows = [];
  let reachedLimit = false;

  while (rows.length <= maxRows) {
    const query = new URLSearchParams({
      select: 'id,canonical_id_v2,idempotency_key,event_layer,iam_layer,raw_payload,status,created_at,updated_at',
      order: 'id.asc',
      limit: String(batchSize),
      id: `gt.${cursor}`,
      updated_at: `gte.${watermarkStart}`,
      and: `(updated_at.lte.${watermarkEnd})`,
    });

    const response = await httpJson(`${projectUrl}/rest/v1/canonical_events?${query.toString()}`, headers);
    if (!response.ok) {
      throw new Error(`canonical_events query failed (${response.status}): ${response.text}`);
    }

    const batch = Array.isArray(response.json) ? response.json : [];
    if (batch.length === 0) {
      break;
    }

    rows.push(...batch);
    const last = batch[batch.length - 1];
    cursor = Number(last?.id || cursor);

    if (rows.length > maxRows) {
      reachedLimit = true;
      break;
    }

    if (batch.length < batchSize) {
      break;
    }
  }

  return {
    rows: rows.slice(0, maxRows),
    truncated: reachedLimit,
  };
}

async function fetchRegistryMap({ projectUrl, serviceRoleKey, canonicalIds }) {
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: 'application/json',
  };

  const map = new Map();
  const uniqueIds = [...new Set(canonicalIds.filter(Boolean))];

  for (const idChunk of chunk(uniqueIds, 120)) {
    if (idChunk.length === 0) {
      continue;
    }

    const query = new URLSearchParams({
      select: 'canonical_id_v2,source_id,canonical_subject_id,source_entity,source_updated_at,updated_at',
      source_entity: 'eq.deal',
      canonical_id_v2: `in.(${idChunk.join(',')})`,
      order: 'updated_at.desc',
      limit: '5000',
    });

    const response = await httpJson(`${projectUrl}/rest/v1/canonical_source_registry_v1?${query.toString()}`, headers);
    if (!response.ok) {
      throw new Error(`canonical_source_registry_v1 query failed (${response.status}): ${response.text}`);
    }

    const rows = Array.isArray(response.json) ? response.json : [];
    for (const row of rows) {
      const canonicalId = String(row?.canonical_id_v2 || '').trim();
      if (!canonicalId) {
        continue;
      }

      const current = map.get(canonicalId);
      const currentTs = current?.source_updated_at || current?.updated_at || '';
      const nextTs = String(row?.source_updated_at || row?.updated_at || '');

      if (!current || nextTs >= currentTs) {
        map.set(canonicalId, {
          source_id: String(row?.source_id || '').trim(),
          canonical_subject_id: String(row?.canonical_subject_id || '').trim(),
          source_updated_at: String(row?.source_updated_at || ''),
          updated_at: String(row?.updated_at || ''),
        });
      }
    }
  }

  return map;
}

function buildSnapshotRows(events, registryMap, metadata) {
  const snapshotRows = [];
  const rejectedRows = [];

  for (const row of events) {
    if (normalizeEntityKind(row) !== 'deal') {
      continue;
    }

    const canonicalId = String(row?.canonical_id_v2 || '').trim();
    const idempotencyKey = String(row?.idempotency_key || '').trim();
    const eventLayer = row?.event_layer && typeof row.event_layer === 'object' ? row.event_layer : {};
    const rawPayload = row?.raw_payload && typeof row.raw_payload === 'object' ? row.raw_payload : {};
    const iamLayer = row?.iam_layer && typeof row.iam_layer === 'object' ? row.iam_layer : {};

    const registry = registryMap.get(canonicalId);

    const sourceId = String(
      registry?.source_id
      || eventLayer.source_id
      || rawPayload.source_id
      || rawPayload.id
      || '',
    ).trim();

    const canonicalSubjectId = String(
      registry?.canonical_subject_id
      || eventLayer.canonical_subject_id
      || `deal:${canonicalId}`,
    ).trim();

    if (!canonicalId || !idempotencyKey || !sourceId || !canonicalSubjectId) {
      rejectedRows.push({
        canonical_id_v2: canonicalId || null,
        idempotency_key: idempotencyKey || null,
        source_id: sourceId || null,
        canonical_subject_id: canonicalSubjectId || null,
        reason: 'missing_mandatory_keys',
      });
      continue;
    }

    snapshotRows.push({
      run_id: metadata.runId,
      watermark_start: metadata.watermarkStart,
      watermark_end: metadata.watermarkEnd,
      canonical_id_v2: canonicalId,
      source_id: sourceId,
      canonical_subject_id: canonicalSubjectId,
      idempotency_key: idempotencyKey,
      entity_kind: 'deal',
      status: String(row?.status || 'active').trim() || 'active',
      created_at: safeIso(row?.created_at, metadata.watermarkStart),
      updated_at: safeIso(row?.updated_at, metadata.watermarkEnd),
      event_layer_json: JSON.stringify(eventLayer),
      iam_layer_json: JSON.stringify(iamLayer),
      raw_payload_json: JSON.stringify(rawPayload),
    });
  }

  return { snapshotRows, rejectedRows };
}

function toCsv(snapshotRows) {
  const headers = [
    'run_id',
    'watermark_start',
    'watermark_end',
    'canonical_id_v2',
    'source_id',
    'canonical_subject_id',
    'idempotency_key',
    'entity_kind',
    'status',
    'created_at',
    'updated_at',
    'event_layer_json',
    'iam_layer_json',
    'raw_payload_json',
  ];

  const lines = [headers.join(',')];
  for (const row of snapshotRows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const projectUrl = required('SUPABASE_PROJECT_URL').replace(/\/+$/, '');
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
  const ts = tsSp();
  const runId = args.runId || `repv1-${ts}`;
  const watermarkStart = safeIso(args.watermarkStart, '1970-01-01T00:00:00.000Z');
  const watermarkEnd = safeIso(args.watermarkEnd, new Date().toISOString());

  const baseEvidenceDir = args.outputDir
    ? path.resolve(process.cwd(), args.outputDir)
    : path.resolve(process.cwd(), `.context/runtime/evidence/replication-${ts}`);
  fs.mkdirSync(baseEvidenceDir, { recursive: true });

  const fetched = await fetchCanonicalEvents({
    projectUrl,
    serviceRoleKey,
    batchSize: args.batchSize,
    maxRows: args.maxRows,
    watermarkStart,
    watermarkEnd,
  });

  if (fetched.truncated && !args.allowTruncated) {
    throw new Error(
      `Export reached maxRows=${args.maxRows}. Increase --max-rows or pass --allow-truncated to accept partial snapshot.`,
    );
  }

  const canonicalIds = fetched.rows
    .filter((row) => normalizeEntityKind(row) === 'deal')
    .map((row) => String(row?.canonical_id_v2 || '').trim())
    .filter(Boolean);

  const registryMap = await fetchRegistryMap({
    projectUrl,
    serviceRoleKey,
    canonicalIds,
  });

  const { snapshotRows, rejectedRows } = buildSnapshotRows(fetched.rows, registryMap, {
    runId,
    watermarkStart,
    watermarkEnd,
  });

  const csv = toCsv(snapshotRows);
  const csvHash = makeSha256(csv);

  const snapshotPath = path.join(baseEvidenceDir, 'snapshot.csv');
  fs.writeFileSync(snapshotPath, csv, 'utf8');

  const manifest = {
    run_id: runId,
    source_system: 'supabase',
    source_entity: 'deal',
    strategy: 'snapshot-reconciliation-v1',
    watermark_start: watermarkStart,
    watermark_end: watermarkEnd,
    row_count: snapshotRows.length,
    rejected_count: rejectedRows.length,
    truncated: fetched.truncated,
    sha256: csvHash,
    generated_at: new Date().toISOString(),
    snapshot_file: snapshotPath,
  };

  const manifestPath = path.join(baseEvidenceDir, 'manifest.json');
  writeJson(manifestPath, manifest);

  const report = {
    ts_sp: ts,
    run_id: runId,
    evidence_dir: baseEvidenceDir,
    snapshot_file: snapshotPath,
    manifest_file: manifestPath,
    fetched_rows: fetched.rows.length,
    exported_rows: snapshotRows.length,
    rejected_rows: rejectedRows.length,
    rejected_examples: rejectedRows.slice(0, 20),
    watermark_start: watermarkStart,
    watermark_end: watermarkEnd,
    truncated: fetched.truncated,
    sha256: csvHash,
  };

  const reportPath = path.resolve(process.cwd(), `.context/runtime/reports/replication-v1-export-${ts}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  writeJson(reportPath, report);

  process.stdout.write(`${JSON.stringify({ reportPath, snapshotPath, manifestPath }, null, 2)}\n`);

  if (snapshotRows.length === 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }, null, 2));
  process.exit(1);
});
