import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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

function parseArgs(argv) {
  const options = {
    outputDir: '.context/runtime/reports',
    preflightReport: '',
    exportReport: '',
    importReport: '',
    reconcileReport: '',
    staticOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--output-dir') {
      options.outputDir = argv[index + 1] || options.outputDir;
      index += 1;
      continue;
    }

    if (value === '--preflight-report') {
      options.preflightReport = argv[index + 1] || options.preflightReport;
      index += 1;
      continue;
    }

    if (value === '--export-report') {
      options.exportReport = argv[index + 1] || options.exportReport;
      index += 1;
      continue;
    }

    if (value === '--import-report') {
      options.importReport = argv[index + 1] || options.importReport;
      index += 1;
      continue;
    }

    if (value === '--reconcile-report') {
      options.reconcileReport = argv[index + 1] || options.reconcileReport;
      index += 1;
      continue;
    }

    if (value === '--static-only') {
      options.staticOnly = true;
      continue;
    }
  }

  return options;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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
    stderr: String(result.stderr || ''),
  };
}

function reportDir() {
  return path.resolve(process.cwd(), '.context/runtime/reports');
}

function listReports(prefix) {
  const dir = reportDir();
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.json'))
    .sort()
    .map((name) => path.join(dir, name));
}

function findLatestReport(prefix) {
  const list = listReports(prefix);
  return list.length > 0 ? list[list.length - 1] : '';
}

function findLatestByRun(prefix, runId) {
  const files = listReports(prefix).reverse();
  for (const filePath of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (String(parsed?.run_id || '') === String(runId || '')) {
        return filePath;
      }
    } catch {
      // ignore invalid report and continue.
    }
  }
  return '';
}

function readJsonIfExists(filePath) {
  if (!filePath) return null;
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function ensureFile(filePath) {
  return fs.existsSync(path.resolve(process.cwd(), filePath));
}

function summarize(results) {
  const failed = results.filter((item) => !item.ok);
  return {
    ok: failed.length === 0,
    passed: results.length - failed.length,
    failed: failed.length,
  };
}

function commandOk(report, pattern) {
  if (!report || !Array.isArray(report.commandResults)) {
    return false;
  }
  const matched = report.commandResults.find((result) => String(result.command || '').includes(pattern));
  return Boolean(matched?.ok);
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  const staticChecks = [
    '.context/docs/replication-readiness-state-db-007.md',
    '.context/docs/replication-runbook-v1-hostinger.md',
    '.context/docs/replication-reconciliation-contract-v1.md',
    'scripts/replication-preflight-v1.mjs',
    'scripts/replication-snapshot-export-v1.mjs',
    'scripts/replication-import-hostinger-v1.mjs',
    'scripts/replication-reconcile-v1.mjs',
    'infra/postgres/hostinger/20260228070000_replication_target_v1.sql',
  ].map((item) => ({ check: `file_exists:${item}`, ok: ensureFile(item) }));

  const commandResults = [];

  let preflightPath = options.preflightReport || findLatestReport('replication-v1-preflight-');
  let exportPath = options.exportReport || findLatestReport('replication-v1-export-');
  let importPath = options.importReport || findLatestReport('replication-v1-import-');
  let reconcilePath = options.reconcileReport || findLatestReport('replication-v1-reconcile-');

  if (!options.staticOnly) {
    const preflight = runCommand('node', ['scripts/replication-preflight-v1.mjs']);
    commandResults.push(preflight);
    preflightPath = findLatestReport('replication-v1-preflight-');

    // Re-resolve import/reconcile/export by run_id to avoid stale report mix.
    const latestImport = readJsonIfExists(importPath || findLatestReport('replication-v1-import-'));
    const runId = latestImport?.run_id || '';
    if (runId) {
      importPath = findLatestByRun('replication-v1-import-', runId) || importPath;
      reconcilePath = findLatestByRun('replication-v1-reconcile-', runId) || reconcilePath;
      exportPath = findLatestByRun('replication-v1-export-', runId) || exportPath;
    }
  }

  const preflightReport = readJsonIfExists(preflightPath);
  const exportReport = readJsonIfExists(exportPath);
  const importReport = readJsonIfExists(importPath);
  const reconcileReport = readJsonIfExists(reconcilePath);

  const runId = importReport?.run_id || reconcileReport?.run_id || exportReport?.run_id || '';
  const runIdAligned =
    Boolean(runId)
    && String(importReport?.run_id || '') === runId
    && String(reconcileReport?.run_id || '') === runId
    && String(exportReport?.run_id || '') === runId;

  const snapshotFile = importReport?.snapshot_file || exportReport?.snapshot_file || '';
  const manifestFile = importReport?.manifest_file || exportReport?.manifest_file || '';
  const explicitEvidenceProvided = Boolean(options.importReport && options.exportReport && options.reconcileReport);
  const nonTruncatedExport = exportReport ? exportReport.truncated !== true : false;
  const evidenceFile = path.resolve(
    process.cwd(),
    path.dirname(snapshotFile || '.context/runtime/evidence'),
    'reconciliation.json',
  );

  const gateChecks = [
    {
      gate: 'RPL-GATE-001',
      description: 'Preflight READY',
      ok: preflightReport?.readiness_status === 'READY',
      evidence: preflightPath || null,
    },
    {
      gate: 'RPL-GATE-002',
      description: 'Migration local/remoto alinhada (preflight)',
      ok: commandOk(preflightReport, 'supabase migration list'),
      evidence: preflightPath || null,
    },
    {
      gate: 'RPL-GATE-003',
      description: 'syn:go-no-go:v1 em GO (preflight)',
      ok: commandOk(preflightReport, 'validate-syn-go-no-go-v1.mjs'),
      evidence: preflightPath || null,
    },
    {
      gate: 'RPL-GATE-004',
      description: 'Dataset mínimo não vazio',
      ok: Number(preflightReport?.datasetCheck?.deals || 0) >= Number(preflightReport?.datasetCheck?.min_required || 1),
      evidence: preflightPath || null,
    },
    {
      gate: 'RPL-GATE-005',
      description: 'Import report disponível e bem-sucedido',
      ok: Boolean(importReport && importReport.success === true),
      evidence: importPath || null,
    },
    {
      gate: 'RPL-GATE-006',
      description: 'Import executado em mode apply',
      ok: Boolean(importReport && importReport.mode === 'apply'),
      evidence: importPath || null,
    },
    {
      gate: 'RPL-GATE-007',
      description: 'Reconciliação classificada como ok',
      ok: Boolean(reconcileReport && reconcileReport.classification === 'ok'),
      evidence: reconcilePath || null,
    },
    {
      gate: 'RPL-GATE-008',
      description: 'Sem drift de entity_kind e sem mismatch de idempotência',
      ok:
        Boolean(reconcileReport)
        && Number(reconcileReport.entity_kind_drift_count || 0) === 0
        && Number(reconcileReport.idempotency_mismatch_count || 0) === 0,
      evidence: reconcilePath || null,
    },
    {
      gate: 'RPL-GATE-009',
      description: 'Pacote de evidência completo e run_id consistente',
      ok:
        (options.staticOnly || explicitEvidenceProvided)
        && runIdAligned
        && nonTruncatedExport
        && Boolean(snapshotFile && ensureFile(snapshotFile))
        && Boolean(manifestFile && ensureFile(manifestFile))
        && ensureFile(evidenceFile),
      evidence: runIdAligned ? path.dirname(snapshotFile) : null,
    },
  ];

  const staticOk = staticChecks.every((item) => item.ok);
  const commandSummary = summarize(commandResults);
  const gateOk = gateChecks.every((item) => item.ok);

  const status = options.staticOnly
    ? (staticOk ? 'GO' : 'NO-GO')
    : (staticOk && commandSummary.ok && gateOk ? 'GO' : 'NO-GO');

  const report = {
    ts_sp: tsSp(),
    mode: options.staticOnly ? 'static-only' : 'full',
    status,
    staticChecks,
    commandResults,
    gateChecks,
    resolvedEvidence: {
      run_id: runId || null,
      preflight_report: preflightPath || null,
      export_report: exportPath || null,
      import_report: importPath || null,
      reconcile_report: reconcilePath || null,
      snapshot_file: snapshotFile || null,
      manifest_file: manifestFile || null,
      reconciliation_file: ensureFile(evidenceFile) ? evidenceFile : null,
    },
    summary: {
      static_ok: staticOk,
      command_ok: commandSummary.ok,
      gates_ok: gateOk,
      ...commandSummary,
    },
  };

  const reportPath = path.resolve(process.cwd(), options.outputDir, `replication-v1-go-no-go-${report.ts_sp}.json`);
  writeJson(reportPath, report);

  process.stdout.write(`${JSON.stringify({ reportPath, status }, null, 2)}\n`);

  if (status !== 'GO') {
    process.exit(1);
  }
}

main();
