import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function fail(message) {
  console.error(`[security:guardrails] ${message}`);
  process.exitCode = 1;
}

function ensure(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function scanForForbiddenTokens() {
  const files = [
    ...globSync('mapa-app/.env*', { nodir: true }),
    ...globSync('mapa-app/src/**/*.{ts,tsx,js,jsx,mjs,cjs}', { nodir: true }),
  ];

  const forbidden = ['VITE_SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  for (const file of files) {
    const content = read(file);
    for (const token of forbidden) {
      if (content.includes(token)) {
        fail(`Segredo proibido encontrado em contexto cliente (${file}): ${token}`);
      }
    }
  }
}

function validateMiddlewareTokenGuard() {
  const source = read(path.resolve('scripts/syn-middleware.mjs'));
  ensure(
    source.includes('SYN_MIDDLEWARE_REQUIRE_TOKEN'),
    'Middleware sem flag SYN_MIDDLEWARE_REQUIRE_TOKEN para enforce seguro.',
  );
  ensure(
    source.includes('if (REQUIRE_JOB_TOKEN && !JOB_TOKEN.trim())'),
    'Middleware sem fail-fast quando token obrigatório está ausente.',
  );
}

function validateBackendOnlyIngestionRpcs() {
  const migrationFile = path.resolve('supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql');
  ensure(fs.existsSync(migrationFile), 'Migration de hardening backend-only dos RPCs de ingestão ausente.');

  const source = read(migrationFile);
  ensure(
    source.includes('revoke execute on function public.upsert_canonical_event_v2') && source.includes('from authenticated'),
    'Migration sem revoke de upsert_canonical_event_v2 para authenticated.',
  );
  ensure(
    source.includes('grant execute on function public.upsert_canonical_event_v2') && source.includes('to service_role'),
    'Migration sem grant de upsert_canonical_event_v2 para service_role.',
  );
  ensure(
    source.includes('revoke execute on function public.upsert_canonical_source_registry_v1') && source.includes('from authenticated'),
    'Migration sem revoke de upsert_canonical_source_registry_v1 para authenticated.',
  );
  ensure(
    source.includes('grant execute on function public.upsert_canonical_source_registry_v1') && source.includes('to service_role'),
    'Migration sem grant de upsert_canonical_source_registry_v1 para service_role.',
  );
}

function validateSyncAppEnvDoesNotPublishServiceRole() {
  const source = read(path.resolve('scripts/sync-app-env.mjs'));
  ensure(
    source.includes('forbiddenAppKeys'),
    'sync-app-env sem bloqueio explícito de SERVICE_ROLE_KEY em mapa-app/.env.',
  );
}

function main() {
  scanForForbiddenTokens();
  validateMiddlewareTokenGuard();
  validateBackendOnlyIngestionRpcs();
  validateSyncAppEnvDoesNotPublishServiceRole();

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }

  console.log('[security:guardrails] OK');
}

main();
