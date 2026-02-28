import fs from 'node:fs';
import path from 'node:path';
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

function env(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function parseArgs(argv) {
  const outputFlagIndex = argv.indexOf('--output-dir');
  const hasOutputDir = outputFlagIndex >= 0 && typeof argv[outputFlagIndex + 1] === 'string';

  return {
    staticOnly: argv.includes('--static-only'),
    outputDir: hasOutputDir ? argv[outputFlagIndex + 1] : '.context/runtime/reports',
    minDealRows: Number(argv.includes('--min-deal-rows') ? argv[argv.indexOf('--min-deal-rows') + 1] : '1') || 1,
  };
}

function runCommand(command, args) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
    env: process.env,
  });
  const endedAt = new Date().toISOString();

  return {
    command: `${command} ${args.join(' ')}`,
    code: typeof result.status === 'number' ? result.status : 1,
    ok: result.status === 0,
    startedAt,
    endedAt,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || result.error?.message || ''),
  };
}

function ensureFileExists(filePath) {
  return fs.existsSync(path.resolve(process.cwd(), filePath));
}

function detectPendingRemoteMigrations(output) {
  const pending = [];
  const lines = String(output || '').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*(\d{14})\s*\|\s*\|\s*/);
    if (match) {
      pending.push(match[1]);
    }
  }
  return pending;
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

async function countDealRows({ projectUrl, serviceRoleKey, maxScan = 5000 }) {
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: 'application/json',
  };

  const batchSize = 500;
  let cursor = 0;
  let scanned = 0;
  let deals = 0;

  while (scanned < maxScan) {
    const query = new URLSearchParams({
      select: 'id,event_layer,raw_payload',
      order: 'id.asc',
      limit: String(batchSize),
      id: `gt.${cursor}`,
    });

    const res = await httpJson(`${projectUrl}/rest/v1/canonical_events?${query.toString()}`, headers);
    if (!res.ok) {
      return {
        ok: false,
        scanned,
        deals,
        error: `canonical_events query failed (${res.status}): ${res.text}`,
      };
    }

    const rows = Array.isArray(res.json) ? res.json : [];
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      scanned += 1;
      if (normalizeEntityKind(row) === 'deal') {
        deals += 1;
      }
    }

    const lastRow = rows[rows.length - 1];
    cursor = Number(lastRow?.id || cursor);

    if (rows.length < batchSize) {
      break;
    }
  }

  return {
    ok: true,
    scanned,
    deals,
  };
}

function summarize(results) {
  const failed = results.filter((item) => !item.ok);
  return {
    ok: failed.length === 0,
    passed: results.length - failed.length,
    failed: failed.length,
  };
}

function writeReport(outputDir, report) {
  const absoluteDir = path.resolve(process.cwd(), outputDir);
  fs.mkdirSync(absoluteDir, { recursive: true });
  const filePath = path.join(absoluteDir, `replication-v1-preflight-${report.ts_sp}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return filePath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const requiredDocs = [
    '.context/docs/replication-readiness-state-db-007.md',
    '.context/docs/replication-runbook-v1-hostinger.md',
    '.context/docs/replication-reconciliation-contract-v1.md',
    '.context/docs/go-no-go-rigid-checklist-state-db-006.md',
    '.context/docs/manual-csv-ingestion-runbook-state-db-006.md',
    '.context/plans/state-db-006-continuity.md',
  ];

  const requiredFiles = [
    'scripts/replication-snapshot-export-v1.mjs',
    'scripts/replication-import-hostinger-v1.mjs',
    'scripts/replication-reconcile-v1.mjs',
    'scripts/replication-go-no-go-v1.mjs',
    'scripts/validate-syn-go-no-go-v1.mjs',
    'infra/postgres/hostinger/20260228070000_replication_target_v1.sql',
  ];

  const staticChecks = [
    ...requiredDocs.map((filePath) => ({ check: `file_exists:${filePath}`, ok: ensureFileExists(filePath) })),
    ...requiredFiles.map((filePath) => ({ check: `file_exists:${filePath}`, ok: ensureFileExists(filePath) })),
  ];

  const sourceEnvChecks = [
    'SUPABASE_PROJECT_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ].map((name) => ({ check: `env_present:${name}`, ok: Boolean(env(name)) }));

  sourceEnvChecks.push({
    check: 'env_present:SUPABASE_PUBLISHABLE_KEY|SUPABASE_ANOM_PUBLIC_KEY',
    ok: Boolean(env('SUPABASE_PUBLISHABLE_KEY') || env('SUPABASE_ANOM_PUBLIC_KEY')),
  });

  const targetEnvChecks = [
    { check: 'env_present:REPLICA_TARGET_DB_URL', ok: Boolean(env('REPLICA_TARGET_DB_URL')) },
    {
      check: 'target_db_url_has_sslmode',
      ok: /sslmode=(require|verify-full)/i.test(env('REPLICA_TARGET_DB_URL')),
    },
    {
      check: 'target_db_uses_replicator_writer',
      ok: /user=replicator_writer/i.test(env('REPLICA_TARGET_DB_URL')),
    },
  ];

  const staticOk = staticChecks.every((item) => item.ok);
  const envOk = [...sourceEnvChecks, ...targetEnvChecks].every((item) => item.ok);

  const commandResults = [];
  let datasetCheck = {
    ok: options.staticOnly,
    scanned: 0,
    deals: 0,
    min_required: options.minDealRows,
    message: options.staticOnly ? 'skipped_in_static_only_mode' : 'not executed',
  };

  if (!options.staticOnly) {
    if (!envOk) {
      commandResults.push({
        command: 'environment_validation',
        code: 2,
        ok: false,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        stdout: '',
        stderr:
          'Variáveis obrigatórias ausentes. Defina SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY|SUPABASE_ANOM_PUBLIC_KEY e REPLICA_TARGET_DB_URL (com sslmode=require|verify-full e user=replicator_writer).',
      });
    } else {
      const migrationList = runCommand('npx', ['--yes', 'supabase', 'migration', 'list']);
      const pending = detectPendingRemoteMigrations(migrationList.stdout);
      if (migrationList.ok && pending.length > 0) {
        migrationList.ok = false;
        migrationList.code = 3;
        migrationList.stderr = `Pending migrations not applied to remote: ${pending.join(', ')}`;
      }
      commandResults.push(migrationList);

      commandResults.push(runCommand('node', ['scripts/validate-syn-go-no-go-v1.mjs']));
      commandResults.push(runCommand('node', ['scripts/validate-syn-deal-scope.mjs']));

      const targetProbe = runCommand('psql', [env('REPLICA_TARGET_DB_URL'), '-At', '-c', 'select 1;']);
      if (!targetProbe.ok && /ENOENT|not found/i.test(targetProbe.stderr)) {
        targetProbe.stderr = 'psql not found in PATH. Install psql client or provide execution host with PostgreSQL client.';
      }
      commandResults.push(targetProbe);

      const deals = await countDealRows({
        projectUrl: env('SUPABASE_PROJECT_URL').replace(/\/+$/, ''),
        serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
      });

      datasetCheck = {
        ok: deals.ok && deals.deals >= options.minDealRows,
        scanned: deals.scanned,
        deals: deals.deals,
        min_required: options.minDealRows,
        message: deals.ok
          ? `Deal rows found: ${deals.deals}`
          : deals.error,
      };
    }
  }

  const commandSummary = summarize(commandResults);
  const ready = staticOk && (options.staticOnly ? true : commandSummary.ok) && datasetCheck.ok;

  const report = {
    ts_sp: tsSp(),
    mode: options.staticOnly ? 'static-only' : 'full',
    readiness_status: ready ? 'READY' : 'NOT_READY',
    source_of_truth: 'local/supabase-current',
    replication_target: 'hostinger-vps-postgresql16',
    strategy: 'snapshot-reconciliation-v1',
    cadence: 'daily-plus-on-demand',
    staticChecks,
    sourceEnvChecks,
    targetEnvChecks,
    commandResults,
    datasetCheck,
    summary: {
      static_ok: staticOk,
      env_ok: envOk,
      command_ok: commandSummary.ok,
      dataset_ok: datasetCheck.ok,
      ready,
      ...commandSummary,
    },
  };

  const reportPath = writeReport(options.outputDir, report);
  process.stdout.write(`${JSON.stringify({ reportPath, readiness_status: report.readiness_status }, null, 2)}\n`);

  if (!ready) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    readiness_status: 'NOT_READY',
    error: error instanceof Error ? error.message : String(error),
  }, null, 2));
  process.exit(1);
});
