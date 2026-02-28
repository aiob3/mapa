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
    apply: false,
    runId: '',
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

    if (value === '--apply') {
      options.apply = true;
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

function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function makeSha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
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

function quoteSql(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function buildSql({ runId, rows, manifest }) {
  const statements = [];

  statements.push('begin;');
  statements.push(`insert into public.replication_runs_v1 (
    run_id, source_system, source_entity, watermark_start, watermark_end, status, row_count, snapshot_sha256, metadata
  ) values (
    ${quoteSql(runId)},
    'supabase',
    'deal',
    ${quoteSql(manifest.watermark_start)},
    ${quoteSql(manifest.watermark_end)},
    'started',
    ${rows.length},
    ${quoteSql(manifest.sha256)},
    jsonb_build_object('strategy', 'snapshot-reconciliation-v1', 'generated_at', ${quoteSql(manifest.generated_at || new Date().toISOString())})
  )
  on conflict (run_id) do update set
    status = 'started',
    row_count = excluded.row_count,
    snapshot_sha256 = excluded.snapshot_sha256,
    metadata = excluded.metadata,
    started_at = now(),
    ended_at = null;`);

  for (const row of rows) {
    statements.push(`insert into replica_stage.canonical_events_deals_v1 (
      canonical_id_v2,
      source_id,
      canonical_subject_id,
      idempotency_key,
      entity_kind,
      status,
      event_layer,
      iam_layer,
      raw_payload,
      created_at,
      updated_at,
      source_watermark_start,
      source_watermark_end,
      run_id,
      replicated_at
    ) values (
      ${quoteSql(row.canonical_id_v2)},
      ${quoteSql(row.source_id)},
      ${quoteSql(row.canonical_subject_id)},
      ${quoteSql(row.idempotency_key)},
      'deal',
      ${quoteSql(row.status || 'active')},
      ${quoteSql(row.event_layer_json)}::jsonb,
      ${quoteSql(row.iam_layer_json)}::jsonb,
      ${quoteSql(row.raw_payload_json)}::jsonb,
      ${quoteSql(row.created_at)},
      ${quoteSql(row.updated_at)},
      ${quoteSql(row.watermark_start)},
      ${quoteSql(row.watermark_end)},
      ${quoteSql(runId)},
      now()
    )
    on conflict (canonical_id_v2) do update set
      source_id = excluded.source_id,
      canonical_subject_id = excluded.canonical_subject_id,
      idempotency_key = excluded.idempotency_key,
      entity_kind = excluded.entity_kind,
      status = excluded.status,
      event_layer = excluded.event_layer,
      iam_layer = excluded.iam_layer,
      raw_payload = excluded.raw_payload,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      source_watermark_start = excluded.source_watermark_start,
      source_watermark_end = excluded.source_watermark_end,
      run_id = excluded.run_id,
      replicated_at = now();`);
  }

  statements.push(`select public.promote_replication_run_v1(${quoteSql(runId)});`);
  statements.push(`update public.replication_runs_v1
set status = 'imported',
    imported_count = ${rows.length},
    ended_at = now()
where run_id = ${quoteSql(runId)};`);
  statements.push('commit;');

  return `${statements.join('\n\n')}\n`;
}

function runPsql({ targetDbUrl, sqlPath }) {
  const startedAt = new Date().toISOString();
  const result = spawnSync('psql', [targetDbUrl, '-v', 'ON_ERROR_STOP=1', '-f', sqlPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
    env: process.env,
  });
  const endedAt = new Date().toISOString();

  return {
    command: `psql <target> -v ON_ERROR_STOP=1 -f ${sqlPath}`,
    startedAt,
    endedAt,
    code: typeof result.status === 'number' ? result.status : 1,
    ok: result.status === 0,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
  };
}

function markRunFailed({ targetDbUrl, runId, reason }) {
  const sql = `
    update public.replication_runs_v1
    set status = 'failed',
        ended_at = now(),
        metadata = coalesce(metadata, '{}'::jsonb)
          || jsonb_build_object('import_error', ${quoteSql(reason)})
    where run_id = ${quoteSql(runId)};
  `;

  const result = spawnSync('psql', [targetDbUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
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

function validateRows(rows) {
  const invalid = [];
  for (const row of rows) {
    const requiredKeys = [
      'canonical_id_v2',
      'source_id',
      'canonical_subject_id',
      'idempotency_key',
      'entity_kind',
      'event_layer_json',
      'iam_layer_json',
      'raw_payload_json',
      'updated_at',
      'created_at',
    ];

    const missing = requiredKeys.filter((key) => !String(row[key] || '').trim());
    if (missing.length > 0 || String(row.entity_kind).toLowerCase() !== 'deal') {
      invalid.push({
        canonical_id_v2: row.canonical_id_v2 || null,
        missing,
        entity_kind: row.entity_kind || null,
      });
    }
  }

  return invalid;
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

  const snapshotText = fs.readFileSync(snapshotPath, 'utf8');
  const manifest = readJson(manifestPath);

  const snapshotSha = makeSha256(snapshotText);
  if (snapshotSha !== manifest.sha256) {
    throw new Error(`Snapshot hash mismatch: expected ${manifest.sha256}, got ${snapshotSha}`);
  }

  const rows = rowsToRecords(parseCsv(snapshotText));
  const invalid = validateRows(rows);
  if (invalid.length > 0) {
    throw new Error(`Snapshot contains ${invalid.length} invalid rows. First issue: ${JSON.stringify(invalid[0])}`);
  }

  const manifestRunId = String(manifest.run_id || '').trim();
  if (args.runId && manifestRunId && args.runId !== manifestRunId) {
    throw new Error(`--run-id (${args.runId}) differs from manifest.run_id (${manifestRunId}).`);
  }
  const runId = args.runId || manifestRunId || `repv1-${ts}`;
  const sql = buildSql({ runId, rows, manifest });
  const sqlPath = path.join(outputDir, `replication-import-${runId}.sql`);
  fs.writeFileSync(sqlPath, sql, 'utf8');

  let execution = {
    ok: true,
    code: 0,
    skipped: true,
    command: 'psql',
    stdout: 'Dry-run mode. SQL file generated only.',
    stderr: '',
  };

  if (args.apply) {
    const targetDbUrl = env('REPLICA_TARGET_DB_URL');
    if (!targetDbUrl) {
      throw new Error('Missing REPLICA_TARGET_DB_URL for --apply mode');
    }
    execution = runPsql({ targetDbUrl, sqlPath });
    if (!execution.ok) {
      const failureUpdate = markRunFailed({
        targetDbUrl,
        runId,
        reason: execution.stderr || execution.stdout || 'import failed',
      });
      execution.failureUpdate = failureUpdate;
    }
  }

  const report = {
    ts_sp: ts,
    run_id: runId,
    mode: args.apply ? 'apply' : 'dry-run',
    snapshot_file: snapshotPath,
    manifest_file: manifestPath,
    sql_file: sqlPath,
    row_count: rows.length,
    sha256: snapshotSha,
    execution,
    success: execution.ok,
  };

  const reportPath = path.resolve(process.cwd(), `.context/runtime/reports/replication-v1-import-${ts}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  writeJson(reportPath, report);

  process.stdout.write(`${JSON.stringify({ reportPath, sqlPath, mode: report.mode, success: report.success }, null, 2)}\n`);

  if (!report.success) {
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
