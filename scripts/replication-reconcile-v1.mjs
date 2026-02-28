import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
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

function parseArgs(argv) {
  const options = {
    snapshot: '',
    manifest: '',
    outputDir: '',
    runId: '',
    targetRowsFile: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--snapshot') {
      options.snapshot = argv[index + 1] || options.snapshot;
      index += 1;
      continue;
    }

    if (value === '--manifest') {
      options.manifest = argv[index + 1] || options.manifest;
      index += 1;
      continue;
    }

    if (value === '--run-id') {
      options.runId = argv[index + 1] || options.runId;
      index += 1;
      continue;
    }

    if (value === '--output-dir') {
      options.outputDir = argv[index + 1] || options.outputDir;
      index += 1;
      continue;
    }

    if (value === '--target-rows-file') {
      options.targetRowsFile = argv[index + 1] || options.targetRowsFile;
      index += 1;
      continue;
    }
  }

  return options;
}

function requiredOption(value, name) {
  if (!value) {
    throw new Error(`Missing required argument: ${name}`);
  }
  return value;
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
    if (!row.some((cell) => String(cell || '').trim().length > 0)) {
      continue;
    }

    const record = {};
    for (let i = 0; i < headers.length; i += 1) {
      record[headers[i]] = String(row[i] ?? '').trim();
    }
    records.push(record);
  }

  return records;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function quoteSql(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function makeSha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function runPsqlQuery(targetDbUrl, sql) {
  const result = spawnSync('psql', [targetDbUrl, '-At', '-F', '\t', '-c', sql], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
    env: process.env,
  });

  return {
    ok: result.status === 0,
    code: typeof result.status === 'number' ? result.status : 1,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
  };
}

function parsePsqlRows(output) {
  return String(output || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [canonical_id_v2, idempotency_key, entity_kind, status] = line.split('\t');
      return {
        canonical_id_v2: String(canonical_id_v2 || '').trim(),
        idempotency_key: String(idempotency_key || '').trim(),
        entity_kind: String(entity_kind || '').trim().toLowerCase(),
        status: String(status || '').trim().toLowerCase(),
      };
    });
}

function classify({ onlySource, onlyTarget, drift, idempotencyMismatch, whitelist }) {
  const onlySourceUnexpected = onlySource.filter((id) => !whitelist.has(id));
  const onlyTargetUnexpected = onlyTarget.filter((id) => !whitelist.has(id));

  const hasAnomaly =
    onlySourceUnexpected.length > 0
    || onlyTargetUnexpected.length > 0
    || drift > 0
    || idempotencyMismatch > 0;

  return {
    classification: hasAnomaly ? 'anomalia' : 'ok',
    only_source_unexpected: onlySourceUnexpected,
    only_target_unexpected: onlyTargetUnexpected,
  };
}

function updateReplicationRun({ targetDbUrl, runId, report }) {
  const status = report.classification === 'ok' ? 'reconciled' : 'failed';
  const sql = `
    update public.replication_runs_v1
    set status = ${quoteSql(status)},
        reconciled_count = ${Number(report.overlap_ids || 0)},
        only_source_count = ${Number(report.only_source_ids || 0)},
        only_target_count = ${Number(report.only_target_ids || 0)},
        drift_count = ${Number(report.entity_kind_drift_count || 0)},
        ended_at = now(),
        metadata = coalesce(metadata, '{}'::jsonb)
          || jsonb_build_object(
            'reconciliation_ts_sp', ${quoteSql(report.ts_sp)},
            'idempotency_mismatch_count', ${Number(report.idempotency_mismatch_count || 0)},
            'classification', ${quoteSql(report.classification)}
          )
    where run_id = ${quoteSql(runId)};
  `;

  return runPsqlQuery(targetDbUrl, sql);
}

async function main() {
  const ts = tsSp();
  const args = parseArgs(process.argv.slice(2));

  const snapshotPath = path.resolve(process.cwd(), requiredOption(args.snapshot, '--snapshot'));
  const manifestPath = path.resolve(process.cwd(), requiredOption(args.manifest, '--manifest'));
  const outputDir = args.outputDir
    ? path.resolve(process.cwd(), args.outputDir)
    : path.dirname(snapshotPath);

  fs.mkdirSync(outputDir, { recursive: true });

  const snapshotContent = fs.readFileSync(snapshotPath, 'utf8');
  const snapshotRows = rowsToRecords(parseCsv(snapshotContent));
  const snapshotSha = makeSha256(snapshotContent);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const runId = args.runId || manifest.run_id;

  if (snapshotSha !== String(manifest.sha256 || '').trim()) {
    throw new Error(`Snapshot hash mismatch: expected ${manifest.sha256}, got ${snapshotSha}`);
  }

  const sourceMap = new Map();
  for (const row of snapshotRows) {
    const canonicalId = String(row.canonical_id_v2 || '').trim();
    if (!canonicalId) {
      continue;
    }
    sourceMap.set(canonicalId, {
      idempotency_key: String(row.idempotency_key || '').trim(),
      status: String(row.status || '').trim().toLowerCase(),
    });
  }

  const sourceSet = new Set([...sourceMap.keys()]);

  let targetRows = [];
  const targetDbUrl = env('REPLICA_TARGET_DB_URL');

  if (args.targetRowsFile) {
    targetRows = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args.targetRowsFile), 'utf8'));
  } else {
    if (!targetDbUrl) {
      throw new Error('Missing REPLICA_TARGET_DB_URL or --target-rows-file');
    }

    const sql = `
      select canonical_id_v2, idempotency_key, entity_kind, status
      from replica_live.canonical_events_deals_v1
      where source_watermark_start >= ${quoteSql(manifest.watermark_start)}
        and source_watermark_end <= ${quoteSql(manifest.watermark_end)}
        and run_id = ${quoteSql(runId)};
    `;

    const query = runPsqlQuery(targetDbUrl, sql);
    if (!query.ok) {
      throw new Error(`Target query failed: ${query.stderr || query.stdout}`);
    }

    targetRows = parsePsqlRows(query.stdout);
  }

  const targetMap = new Map();
  for (const row of targetRows) {
    const canonicalId = String(row.canonical_id_v2 || '').trim();
    if (!canonicalId) {
      continue;
    }
    targetMap.set(canonicalId, {
      idempotency_key: String(row.idempotency_key || '').trim(),
      entity_kind: String(row.entity_kind || '').trim().toLowerCase(),
      status: String(row.status || '').trim().toLowerCase(),
    });
  }

  const targetSet = new Set([...targetMap.keys()]);

  const overlap = [];
  const onlySource = [];
  const onlyTarget = [];
  let idempotencyMismatch = 0;
  let statusMismatch = 0;

  for (const sourceId of sourceSet) {
    if (targetSet.has(sourceId)) {
      overlap.push(sourceId);
      const sourceRow = sourceMap.get(sourceId);
      const targetRow = targetMap.get(sourceId);
      if (sourceRow?.idempotency_key !== targetRow?.idempotency_key) {
        idempotencyMismatch += 1;
      }
      if ((sourceRow?.status || '') !== (targetRow?.status || '')) {
        statusMismatch += 1;
      }
    } else {
      onlySource.push(sourceId);
    }
  }

  for (const targetId of targetSet) {
    if (!sourceSet.has(targetId)) {
      onlyTarget.push(targetId);
    }
  }

  const drift = [...targetMap.values()].filter((row) => row.entity_kind !== 'deal').length;
  const whitelist = new Set(
    String(env('REPLICATION_RECONCILIATION_WHITELIST', ''))
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );

  const classification = classify({
    onlySource,
    onlyTarget,
    drift,
    idempotencyMismatch,
    whitelist,
  });

  const report = {
    ts_sp: ts,
    run_id: runId,
    source_ids: sourceSet.size,
    target_ids: targetSet.size,
    overlap_ids: overlap.length,
    only_source_ids: onlySource.length,
    only_target_ids: onlyTarget.length,
    entity_kind_drift_count: drift,
    idempotency_mismatch_count: idempotencyMismatch,
    status_mismatch_count: statusMismatch,
    classification: classification.classification,
    only_source_unexpected_ids: classification.only_source_unexpected,
    only_target_unexpected_ids: classification.only_target_unexpected,
    only_source_sample: onlySource.slice(0, 20),
    only_target_sample: onlyTarget.slice(0, 20),
  };

  const reportPath = path.resolve(process.cwd(), `.context/runtime/reports/replication-v1-reconcile-${ts}.json`);
  writeJson(reportPath, report);

  const evidencePath = path.join(outputDir, 'reconciliation.json');
  writeJson(evidencePath, report);

  if (!args.targetRowsFile && targetDbUrl) {
    const update = updateReplicationRun({ targetDbUrl, runId, report });
    report.replication_run_update = {
      ok: update.ok,
      code: update.code,
      stderr: update.stderr,
    };
    if (!update.ok) {
      report.classification = 'anomalia';
      report.replication_run_update.reason = 'failed_to_persist_reconciliation_status';
    }
    writeJson(reportPath, report);
    writeJson(evidencePath, report);
  }

  process.stdout.write(`${JSON.stringify({ reportPath, evidencePath, classification: report.classification }, null, 2)}\n`);

  if (report.classification !== 'ok') {
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
