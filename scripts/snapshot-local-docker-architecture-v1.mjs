import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env.clickhouse'), quiet: true });

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

  const parts = formatter.formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function parseArgs(argv) {
  const options = {
    outputDir: '.context/runtime/snapshots',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--output-dir' && argv[index + 1]) {
      options.outputDir = argv[index + 1];
      index += 1;
    }
  }

  return options;
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
}

function parseSupabaseEnv(output) {
  const envMap = {};
  const lines = String(output || '').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    const raw = m[2].trim();
    const value = raw.replace(/^"/, '').replace(/"$/, '');
    envMap[key] = value;
  }
  return envMap;
}

function parsePendingRemoteMigrations(output) {
  const pending = [];
  const lines = String(output || '').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*(\d{14})\s*\|\s*\|\s*/);
    if (match) pending.push(match[1]);
  }
  return pending;
}

function resolveClickHousePublishedPort() {
  const result = run('docker', ['compose', '-f', 'infra/clickhouse/docker-compose.yml', 'port', 'clickhouse', '8123']);
  if (result.status !== 0) {
    return process.env.CLICKHOUSE_HTTP_PORT?.trim() || '8123';
  }

  const text = String(result.stdout || '').trim();
  const hostPort = text.split(':').pop();
  return hostPort || process.env.CLICKHOUSE_HTTP_PORT?.trim() || '8123';
}

function mask(value) {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return '***';
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function yamlArray(items, indent = 0) {
  const pad = ' '.repeat(indent);
  if (!Array.isArray(items) || items.length === 0) {
    return `${pad}[]`;
  }
  return items.map((item) => `${pad}- ${item}`).join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ts = tsSp();
  const snapshotDir = path.resolve(process.cwd(), options.outputDir, `local-docker-${ts}`);

  const supabaseStatus = run('npx', ['--yes', 'supabase', 'status', '-o', 'env']);
  if (supabaseStatus.status !== 0) {
    throw new Error(`Falha ao obter status do Supabase local: ${supabaseStatus.stderr || supabaseStatus.stdout}`);
  }

  const migrationList = run('npx', ['--yes', 'supabase', 'migration', 'list']);
  const pendingRemoteMigrations = parsePendingRemoteMigrations(migrationList.stdout);
  const supa = parseSupabaseEnv(supabaseStatus.stdout);
  const clickhousePort = resolveClickHousePublishedPort();

  const snapshot = {
    ts_sp: ts,
    generated_at: new Date().toISOString(),
    local_stack: {
      supabase: {
        api_url: supa.API_URL || '',
        rest_url: supa.REST_URL || '',
        graphql_url: supa.GRAPHQL_URL || '',
        db_url: supa.DB_URL || '',
        studio_url: supa.STUDIO_URL || '',
      },
      clickhouse: {
        host: process.env.CLICKHOUSE_HOST || '127.0.0.1',
        http_port: clickhousePort,
        database: process.env.CLICKHOUSE_DB || 'mapa_semantic',
        user: process.env.CLICKHOUSE_USER || 'mapa_app',
      },
    },
    gate_context: {
      pending_remote_migrations: pendingRemoteMigrations,
      migration_parity: pendingRemoteMigrations.length === 0 ? 'aligned' : 'pending_remote',
    },
    secrets_masked: {
      publishable_key: mask(supa.PUBLISHABLE_KEY || ''),
      secret_key: mask(supa.SECRET_KEY || ''),
      service_role_key: mask(supa.SERVICE_ROLE_KEY || ''),
      clickhouse_password: mask(process.env.CLICKHOUSE_PASSWORD || ''),
    },
  };

  const snapshotYaml = `version: "1"
kind: "local_docker_architecture_snapshot"
ts_sp: "${snapshot.ts_sp}"
generated_at: "${snapshot.generated_at}"
local_stack:
  supabase:
    api_url: "${snapshot.local_stack.supabase.api_url}"
    rest_url: "${snapshot.local_stack.supabase.rest_url}"
    graphql_url: "${snapshot.local_stack.supabase.graphql_url}"
    db_url: "${snapshot.local_stack.supabase.db_url}"
    studio_url: "${snapshot.local_stack.supabase.studio_url}"
  clickhouse:
    host: "${snapshot.local_stack.clickhouse.host}"
    http_port: "${snapshot.local_stack.clickhouse.http_port}"
    database: "${snapshot.local_stack.clickhouse.database}"
    user: "${snapshot.local_stack.clickhouse.user}"
gate_context:
  migration_parity: "${snapshot.gate_context.migration_parity}"
  pending_remote_migrations:
${yamlArray(snapshot.gate_context.pending_remote_migrations, 4)}
secrets_masked:
  publishable_key: "${snapshot.secrets_masked.publishable_key}"
  secret_key: "${snapshot.secrets_masked.secret_key}"
  service_role_key: "${snapshot.secrets_masked.service_role_key}"
  clickhouse_password: "${snapshot.secrets_masked.clickhouse_password}"
`;

  const composeReplicaYaml = `name: mapa-replica-v1
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-mapa}
      POSTGRES_USER: \${POSTGRES_USER:-mapa}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-mapa_local_password}
    ports:
      - "\${POSTGRES_PORT:-54326}:5432"
    volumes:
      - ./volumes/postgres:/var/lib/postgresql/data
      - ./bootstrap/postgres:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-mapa} -d \${POSTGRES_DB:-mapa}"]
      interval: 10s
      timeout: 5s
      retries: 12

  clickhouse:
    image: clickhouse/clickhouse-server:24.8
    restart: unless-stopped
    environment:
      CLICKHOUSE_DB: \${CLICKHOUSE_DB:-mapa_semantic}
      CLICKHOUSE_USER: \${CLICKHOUSE_USER:-mapa_app}
      CLICKHOUSE_PASSWORD: \${CLICKHOUSE_PASSWORD:-mapa_local_dev_password}
      CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: "1"
    ports:
      - "\${CLICKHOUSE_HTTP_PORT:-8123}:8123"
      - "\${CLICKHOUSE_NATIVE_PORT:-9000}:9000"
    volumes:
      - ./volumes/clickhouse-data:/var/lib/clickhouse
      - ./volumes/clickhouse-logs:/var/log/clickhouse-server
      - ./bootstrap/clickhouse:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:8123/ping"]
      interval: 10s
      timeout: 5s
      retries: 12

  syn-middleware:
    image: node:20-alpine
    restart: unless-stopped
    working_dir: /workspace
    command: ["node", "scripts/syn-middleware.mjs"]
    environment:
      SYN_MIDDLEWARE_PORT: \${SYN_MIDDLEWARE_PORT:-8787}
      SYN_MIDDLEWARE_TOKEN: \${SYN_MIDDLEWARE_TOKEN:-change-me}
      SUPABASE_PROJECT_URL: \${SUPABASE_PROJECT_URL}
      SUPABASE_SERVICE_ROLE_KEY: \${SUPABASE_SERVICE_ROLE_KEY}
      CLICKHOUSE_HOST: clickhouse
      CLICKHOUSE_HTTP_PORT: "8123"
      CLICKHOUSE_DB: \${CLICKHOUSE_DB:-mapa_semantic}
      CLICKHOUSE_USER: \${CLICKHOUSE_USER:-mapa_app}
      CLICKHOUSE_PASSWORD: \${CLICKHOUSE_PASSWORD:-mapa_local_dev_password}
    ports:
      - "\${SYN_MIDDLEWARE_PORT:-8787}:8787"
    volumes:
      - ../../../../:/workspace:ro
    depends_on:
      clickhouse:
        condition: service_healthy
`;

  const composeOverrideYaml = `services:
  clickhouse:
    ports:
      - "${clickhousePort}:8123"
      - "\${CLICKHOUSE_NATIVE_PORT:-19000}:9000"
`;

  const envTemplateYaml = `version: "1"
kind: "docker_env_template"
required:
  postgres:
    POSTGRES_DB: "mapa"
    POSTGRES_USER: "mapa"
    POSTGRES_PASSWORD: "<definir>"
    POSTGRES_PORT: "54326"
  clickhouse:
    CLICKHOUSE_DB: "mapa_semantic"
    CLICKHOUSE_USER: "mapa_app"
    CLICKHOUSE_PASSWORD: "<definir>"
    CLICKHOUSE_HTTP_PORT: "${clickhousePort}"
    CLICKHOUSE_NATIVE_PORT: "19000"
  middleware:
    SYN_MIDDLEWARE_PORT: "8787"
    SYN_MIDDLEWARE_TOKEN: "<definir>"
  supabase_source:
    SUPABASE_PROJECT_URL: "${supa.API_URL || 'http://127.0.0.1:54321'}"
    SUPABASE_SERVICE_ROLE_KEY: "<definir>"
    SUPABASE_PUBLISHABLE_KEY: "${supa.PUBLISHABLE_KEY || ''}"
`;

  const readme = `# Local Docker Snapshot (${ts})

Arquivos gerados para replicar a arquitetura local validada.

## Arquivos

1. \`docker-architecture-snapshot.yaml\`: inventário da stack local e contexto de gate.
2. \`docker-compose.replica.v1.yaml\`: compose base para réplica local.
3. \`docker-compose.replica.override.local.yaml\`: override de portas locais detectadas.
4. \`docker-env.template.yaml\`: variáveis mínimas em formato YAML.

## Uso

\`\`\`bash
docker compose -f docker-compose.replica.v1.yaml -f docker-compose.replica.override.local.yaml --env-file .env up -d
\`\`\`
`;

  await fs.mkdir(snapshotDir, { recursive: true });
  await fs.writeFile(path.join(snapshotDir, 'docker-architecture-snapshot.yaml'), snapshotYaml, 'utf8');
  await fs.writeFile(path.join(snapshotDir, 'docker-compose.replica.v1.yaml'), composeReplicaYaml, 'utf8');
  await fs.writeFile(path.join(snapshotDir, 'docker-compose.replica.override.local.yaml'), composeOverrideYaml, 'utf8');
  await fs.writeFile(path.join(snapshotDir, 'docker-env.template.yaml'), envTemplateYaml, 'utf8');
  await fs.writeFile(path.join(snapshotDir, 'README.md'), readme, 'utf8');

  const reportDir = path.resolve(process.cwd(), '.context/runtime/reports');
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `local-docker-snapshot-${ts}.json`);
  await fs.writeFile(
    reportPath,
    `${JSON.stringify({ ts_sp: ts, snapshotDir, reportPath, snapshot }, null, 2)}\n`,
    'utf8',
  );

  process.stdout.write(`${JSON.stringify({ ts_sp: ts, snapshotDir, reportPath }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`[snapshot:docker:local] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
