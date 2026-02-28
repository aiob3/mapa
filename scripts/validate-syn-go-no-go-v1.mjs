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

function env(name) {
  const value = process.env[name];
  if (typeof value !== 'string') return '';
  return value.trim();
}

function parseArgs(argv) {
  const outputFlagIndex = argv.indexOf('--output-dir');
  const hasOutputDir = outputFlagIndex >= 0 && typeof argv[outputFlagIndex + 1] === 'string';

  return {
    staticOnly: argv.includes('--static-only'),
    outputDir: hasOutputDir ? argv[outputFlagIndex + 1] : '.context/runtime/reports',
  };
}

function ensureFileExists(filePath) {
  return fs.existsSync(path.resolve(process.cwd(), filePath));
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
  const filePath = path.join(absoluteDir, `go-no-go-v1-${report.ts_sp}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return filePath;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  const requiredDocs = [
    '.context/docs/state-db-006-ingestion-initial-postmortem.md',
    '.context/docs/eligibility-criteria-v1-state-db-006.md',
    '.context/docs/canonical-data-norm-deals-v1-state-db-006.md',
    '.context/docs/manual-csv-ingestion-runbook-state-db-006.md',
    '.context/docs/go-no-go-rigid-checklist-state-db-006.md',
  ];

  const requiredRepoFiles = [
    'scripts/syn-ingest-raw-db.mjs',
    'scripts/validate-syn-post-migration.mjs',
    'scripts/validate-security-guardrails.mjs',
    'supabase/migrations/20260226190000_state_db_006_canonical_source_registry.sql',
    'supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql',
  ];

  const docChecks = requiredDocs.map((filePath) => ({
    check: `file_exists:${filePath}`,
    ok: ensureFileExists(filePath),
  }));

  const repoChecks = requiredRepoFiles.map((filePath) => ({
    check: `file_exists:${filePath}`,
    ok: ensureFileExists(filePath),
  }));

  const requiredEnv = ['SUPABASE_PROJECT_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const hasPublishable = Boolean(env('SUPABASE_PUBLISHABLE_KEY') || env('SUPABASE_ANOM_PUBLIC_KEY'));

  const envChecks = requiredEnv.map((name) => ({
    check: `env_present:${name}`,
    ok: Boolean(env(name)),
  }));
  envChecks.push({
    check: 'env_present:SUPABASE_PUBLISHABLE_KEY|SUPABASE_ANOM_PUBLIC_KEY',
    ok: hasPublishable,
  });

  const staticChecks = [...docChecks, ...repoChecks];
  const staticOk = staticChecks.every((item) => item.ok);

  const commandResults = [];
  if (!options.staticOnly) {
    if (!envChecks.every((item) => item.ok)) {
      commandResults.push({
        command: 'environment_validation',
        code: 2,
        ok: false,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        stdout: '',
        stderr:
          'Variáveis obrigatórias ausentes para validação completa. Defina SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_PUBLISHABLE_KEY (ou SUPABASE_ANOM_PUBLIC_KEY).',
      });
    } else {
      commandResults.push(runCommand('npm', ['run', 'security:guardrails']));
      commandResults.push(runCommand('npm', ['run', 'test', '--', 'syn-pattern-contracts.test.ts']));
      commandResults.push(runCommand('npm', ['run', 'syn:validate:post-migration']));
    }
  }

  const commandSummary = summarize(commandResults);
  const report = {
    ts_sp: tsSp(),
    mode: options.staticOnly ? 'static-only' : 'full',
    status:
      staticOk && (options.staticOnly ? true : commandSummary.ok)
        ? 'GO'
        : 'NO-GO',
    staticChecks,
    envChecks,
    commandResults,
    summary: {
      static_ok: staticOk,
      command_ok: commandSummary.ok,
      ...commandSummary,
    },
  };

  const reportPath = writeReport(options.outputDir, report);
  process.stdout.write(`${JSON.stringify({ reportPath, status: report.status }, null, 2)}\n`);

  if (report.status !== 'GO') {
    process.exit(1);
  }
}

main();
