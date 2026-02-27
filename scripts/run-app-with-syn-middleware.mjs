import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appEnvPath = path.join(repoRoot, 'mapa-app', '.env');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function log(message) {
  console.log(`[app+syn] ${message}`);
}

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return dotenv.parse(fs.readFileSync(filePath, 'utf8'));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseMiddlewareEndpoint(urlValue) {
  const fallback = 'http://127.0.0.1:8787';
  const parsed = new URL((urlValue || fallback).trim());
  const port = parsed.port
    ? Number(parsed.port)
    : parsed.protocol === 'https:'
      ? 443
      : 80;

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Porta inválida para middleware: ${parsed.port || '(vazia)'}`);
  }

  return {
    url: `${parsed.protocol}//${parsed.hostname}:${port}`,
    host: parsed.hostname,
    port,
  };
}

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Processo interrompido por sinal ${signal}: ${cmd} ${args.join(' ')}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Comando falhou (${code}): ${cmd} ${args.join(' ')}`));
        return;
      }
      resolve();
    });
  });
}

async function waitForHealth(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError = 'sem resposta';

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${url}/health`, { method: 'GET' });
      if (response.ok) {
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await wait(500);
  }

  throw new Error(`Middleware não respondeu em ${url}/health (${lastError})`);
}

async function main() {
  const mode = process.argv[2] || 'dev';
  if (!['dev', 'preview'].includes(mode)) {
    throw new Error('Modo inválido. Use: dev ou preview');
  }

  await runCommand(npmCmd, ['run', 'sync:env:app'], { cwd: repoRoot });

  const appEnv = parseEnv(appEnvPath);
  const endpoint = parseMiddlewareEndpoint(appEnv.VITE_SYN_MIDDLEWARE_URL);
  const middlewareToken = (process.env.SYN_MIDDLEWARE_TOKEN || `syn-dev-${Date.now()}`).trim();

  const middlewareEnv = {
    ...process.env,
    SYN_MIDDLEWARE_HOST: endpoint.host,
    SYN_MIDDLEWARE_PORT: String(endpoint.port),
    SYN_MIDDLEWARE_URL: endpoint.url,
    SYN_MIDDLEWARE_TOKEN: middlewareToken,
    SYN_MIDDLEWARE_REQUIRE_TOKEN: process.env.SYN_MIDDLEWARE_REQUIRE_TOKEN || 'true',
  };

  log(`iniciando middleware em ${endpoint.url}`);
  const middlewareProc = spawn('node', ['scripts/syn-middleware.mjs'], {
    cwd: repoRoot,
    env: middlewareEnv,
    stdio: 'inherit',
  });

  let appProc = null;
  let isShuttingDown = false;
  const shutdown = () => {
    isShuttingDown = true;
    if (appProc && !appProc.killed) {
      appProc.kill('SIGTERM');
    }
    if (middlewareProc && !middlewareProc.killed) {
      middlewareProc.kill('SIGTERM');
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);

  middlewareProc.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }
    if (!appProc) {
      const reason = signal ? `sinal ${signal}` : `código ${code}`;
      console.error(`[app+syn] middleware encerrou antes do app (${reason}).`);
      process.exit(code ?? 1);
      return;
    }
    if (appProc.exitCode === null) {
      console.error('[app+syn] middleware encerrou durante execução do app.');
      appProc.kill('SIGTERM');
    }
  });

  await waitForHealth(endpoint.url);
  log('middleware saudável, iniciando aplicação');

  const appArgs = mode === 'dev' ? ['--prefix', 'mapa-app', 'run', 'dev'] : ['--prefix', 'mapa-app', 'run', 'preview'];
  appProc = spawn(npmCmd, appArgs, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });

  appProc.on('exit', (code, signal) => {
    isShuttingDown = true;
    if (middlewareProc.exitCode === null) {
      middlewareProc.kill('SIGTERM');
    }
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(`[app+syn] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
