import http from 'node:http';

import {
  fetchSemanticSignalsSummary,
  pingClickHouse,
  runSupabaseClickHouseSemanticSync,
} from './lib/syn-semantic-runtime.mjs';

const PORT = Number(process.env.SYN_MIDDLEWARE_PORT || 8787);
const HOST = process.env.SYN_MIDDLEWARE_HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.SYN_MIDDLEWARE_CORS_ORIGIN || '*';
const JOB_TOKEN = process.env.SYN_MIDDLEWARE_TOKEN || '';
const REQUIRE_JOB_TOKEN = (process.env.SYN_MIDDLEWARE_REQUIRE_TOKEN || 'true').toLowerCase() !== 'false';

if (REQUIRE_JOB_TOKEN && !JOB_TOKEN.trim()) {
  console.error('[syn-middleware] SYN_MIDDLEWARE_TOKEN obrigatório (defina SYN_MIDDLEWARE_REQUIRE_TOKEN=false apenas para ambiente controlado).');
  process.exit(1);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Syn-Middleware-Token');
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Body JSON inválido.');
  }
}

function extractToken(req) {
  const headerToken = req.headers['x-syn-middleware-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return '';
}

function assertJobToken(req) {
  if (!JOB_TOKEN.trim()) {
    return;
  }

  const provided = extractToken(req);
  if (!provided || provided !== JOB_TOKEN) {
    const error = new Error('Token inválido para executar job de ingestão.');
    error.statusCode = 401;
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: 'Request inválido.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      const ping = await pingClickHouse();
      sendJson(res, 200, {
        service: 'syn-middleware',
        ok: Boolean(ping.ok),
        clickhouse: ping,
        now: new Date().toISOString(),
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/syn/semantic-signals-summary') {
      const refreshFirst = url.searchParams.get('refresh') === 'true';
      let ingest = null;

      if (refreshFirst) {
        assertJobToken(req);
        ingest = await runSupabaseClickHouseSemanticSync({});
      }

      const summary = await fetchSemanticSignalsSummary();
      sendJson(res, 200, {
        ...summary,
        ingest,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/syn/jobs/ingest-semantic-layer') {
      assertJobToken(req);
      const body = await readRequestBody(req);
      const ingest = await runSupabaseClickHouseSemanticSync({
        dryRun: Boolean(body.dryRun),
        batchSize: typeof body.batchSize === 'number' ? body.batchSize : undefined,
        maxLoops: typeof body.maxLoops === 'number' ? body.maxLoops : undefined,
        checkpointFile: typeof body.checkpointFile === 'string' ? body.checkpointFile : undefined,
      });

      sendJson(res, 200, {
        ok: true,
        ingest,
      });
      return;
    }

    sendJson(res, 404, {
      error: 'Rota não encontrada.',
      routes: [
        'GET /health',
        'GET /api/syn/semantic-signals-summary',
        'POST /api/syn/jobs/ingest-semantic-layer',
      ],
    });
  } catch (error) {
    const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    sendJson(res, statusCode, {
      error: error instanceof Error ? error.message : String(error),
      now: new Date().toISOString(),
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[syn-middleware] listening on http://${HOST}:${PORT}`);
});
