import crypto from 'node:crypto';
import process from 'node:process';
import path from 'node:path';
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

defaults();

function defaults() {
  if (!process.env.SYN_VALIDATION_RETRIES) {
    process.env.SYN_VALIDATION_RETRIES = '3';
  }
  if (!process.env.SYN_VALIDATION_RETRY_DELAY_MS) {
    process.env.SYN_VALIDATION_RETRY_DELAY_MS = '2000';
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function resolveAnonKey() {
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (publishable) return publishable;
  const legacyAnon = process.env.SUPABASE_ANOM_PUBLIC_KEY?.trim();
  if (legacyAnon) return legacyAnon;
  throw new Error('Missing SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANOM_PUBLIC_KEY) in .env');
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function httpJson(url, { method = 'GET', headers = {}, body } = {}) {
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    text,
    json,
  };
}

async function getMigrationList() {
  try {
    const output = execSync('npx --yes supabase migration list', {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    return { ok: true, output };
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr) : '';
    const stdout = error?.stdout ? String(error.stdout) : '';
    return { ok: false, output: `${stdout}\n${stderr}`.trim() };
  }
}

async function createValidationUser({ projectUrl, serviceRoleKey }) {
  const nowTs = Date.now();
  const rand = crypto.randomBytes(4).toString('hex');
  const email = process.env.SUPABASE_VALIDATION_EMAIL?.trim() || `syn.validation+${nowTs}.${rand}@mapa.local`;
  const password = process.env.SUPABASE_VALIDATION_PASSWORD?.trim() || `SynVal!${crypto.randomBytes(8).toString('hex')}`;

  const createRes = await httpJson(`${projectUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        source: 'syn-post-migration-validation',
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create validation user (${createRes.status}): ${createRes.text}`);
  }

  return {
    email,
    password,
    userId: createRes.json?.id || null,
  };
}

async function signInValidationUser({ projectUrl, anonKey, email, password }) {
  const signInRes = await httpJson(`${projectUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!signInRes.ok) {
    throw new Error(`Failed to sign in validation user (${signInRes.status}): ${signInRes.text}`);
  }

  const accessToken = signInRes.json?.access_token;
  if (!accessToken) {
    throw new Error('Validation sign-in did not return access_token');
  }

  return accessToken;
}

async function cleanupValidationUser({ projectUrl, serviceRoleKey, userId }) {
  if (!userId) {
    return;
  }

  await httpJson(`${projectUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });
}

function summarizeRpcResult(name, result) {
  const message = result.json?.message || result.json?.error_description || result.json?.error || result.text;
  return {
    rpc: name,
    ok: result.ok,
    status: result.status,
    message: String(message || '').slice(0, 220),
  };
}

function isSchemaCacheMiss(result) {
  return result.status === 404 && String(result.json?.code || '').toUpperCase() === 'PGRST202';
}

async function callRpc({ projectUrl, token, anonKey, rpcName }) {
  return httpJson(`${projectUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: '{}',
  });
}

async function callRpcAsServiceRole({ projectUrl, serviceRoleKey, rpcName }) {
  return httpJson(`${projectUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: '{}',
  });
}

async function tryReloadSchema({ projectUrl, serviceRoleKey }) {
  const candidates = ['pgrst_reload_schema', 'reload_schema'];
  const attempts = [];

  for (const fn of candidates) {
    const res = await callRpcAsServiceRole({ projectUrl, serviceRoleKey, rpcName: fn });
    attempts.push({ fn, status: res.status, ok: res.ok, message: (res.json?.message || res.text || '').slice(0, 180) });
    if (res.ok) {
      return { ok: true, attempts };
    }
  }

  return { ok: false, attempts };
}

async function validateRpcs({ projectUrl, anonKey, userToken, retries, retryDelayMs, serviceRoleKey }) {
  const rpcNames = [
    'api_syn_leads_v1',
    'api_syn_heatmap_v1',
    'api_syn_outreach_v1',
    'api_syn_sector_v1',
    'api_syn_kpis_v1',
  ];

  const cycles = [];

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const batch = [];
    for (const rpcName of rpcNames) {
      const res = await callRpc({ projectUrl, token: userToken, anonKey, rpcName });
      batch.push({ rpcName, res });
    }

    const misses = batch.filter((item) => isSchemaCacheMiss(item.res));
    cycles.push({
      attempt,
      results: batch.map(({ rpcName, res }) => summarizeRpcResult(rpcName, res)),
      schemaCacheMisses: misses.map((item) => item.rpcName),
    });

    if (misses.length === 0) {
      return {
        ok: batch.every((item) => item.res.ok),
        cycles,
        finalResults: batch,
        mitigation: null,
      };
    }

    const mitigation = await tryReloadSchema({ projectUrl, serviceRoleKey });
    cycles[cycles.length - 1].mitigation = mitigation;
    await wait(retryDelayMs);
  }

  const last = cycles[cycles.length - 1];
  const serviceRoleDiagnostics = [];
  for (const rpcName of last.results.filter((r) => !r.ok).map((r) => r.rpc)) {
    const serviceRes = await callRpcAsServiceRole({ projectUrl, serviceRoleKey, rpcName });
    serviceRoleDiagnostics.push({
      rpc: rpcName,
      serviceRoleStatus: serviceRes.status,
      serviceRoleOk: serviceRes.ok,
      serviceRoleMessage: (serviceRes.json?.message || serviceRes.text || '').slice(0, 220),
    });
  }

  return {
    ok: false,
    cycles,
    finalResults: [],
    mitigation: {
      serviceRoleDiagnostics,
    },
  };
}

async function validateSemanticLayerColumn({ projectUrl, serviceRoleKey }) {
  const res = await httpJson(`${projectUrl}/rest/v1/canonical_events?select=semantic_layer&limit=1`, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/json',
    },
  });

  return {
    ok: res.ok,
    status: res.status,
    message: (res.json?.message || res.text || '').slice(0, 220),
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const projectUrl = required('SUPABASE_PROJECT_URL').replace(/\/+$/, '');
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = resolveAnonKey();
  const retries = Number(process.env.SYN_VALIDATION_RETRIES || '3');
  const retryDelayMs = Number(process.env.SYN_VALIDATION_RETRY_DELAY_MS || '2000');

  const report = {
    startedAt,
    projectUrl,
    migrationList: null,
    semanticLayerColumn: null,
    authenticatedRpcValidation: null,
    validationUser: null,
    finishedAt: null,
    success: false,
  };

  const migrationList = await getMigrationList();
  report.migrationList = migrationList;

  report.semanticLayerColumn = await validateSemanticLayerColumn({ projectUrl, serviceRoleKey });

  let validationUser = null;
  try {
    validationUser = await createValidationUser({ projectUrl, serviceRoleKey });
    report.validationUser = {
      email: validationUser.email,
      userId: validationUser.userId,
      mode: process.env.SUPABASE_VALIDATION_EMAIL ? 'predefined' : 'ephemeral',
    };

    const userToken = await signInValidationUser({
      projectUrl,
      anonKey,
      email: validationUser.email,
      password: validationUser.password,
    });

    report.authenticatedRpcValidation = await validateRpcs({
      projectUrl,
      anonKey,
      userToken,
      retries,
      retryDelayMs,
      serviceRoleKey,
    });
  } finally {
    if (validationUser && !process.env.SUPABASE_VALIDATION_EMAIL) {
      await cleanupValidationUser({ projectUrl, serviceRoleKey, userId: validationUser.userId });
    }
  }

  report.finishedAt = new Date().toISOString();
  report.success = Boolean(report.semanticLayerColumn?.ok) && Boolean(report.authenticatedRpcValidation?.ok);

  console.log(JSON.stringify(report, null, 2));

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
