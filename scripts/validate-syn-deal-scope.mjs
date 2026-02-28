import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function resolveAnonKey() {
  return process.env.SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.SUPABASE_ANOM_PUBLIC_KEY?.trim() || '';
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

function normalizeEntityKind(row) {
  const fromEvent = row?.event_layer && typeof row.event_layer === 'object'
    ? row.event_layer.entity_kind
    : '';
  const fromRaw = row?.raw_payload && typeof row.raw_payload === 'object'
    ? row.raw_payload.entity_kind
    : '';
  return String(fromEvent || fromRaw || '').trim().toLowerCase();
}

async function main() {
  const projectUrl = required('SUPABASE_PROJECT_URL').replace(/\/+$/, '');
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = resolveAnonKey();
  if (!anonKey) {
    throw new Error('Missing SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANOM_PUBLIC_KEY in .env');
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: 'application/json',
  };

  const leadsRes = await httpJson(
    `${projectUrl}/rest/v1/api_syn_leads_view_v1?select=id&order=id.asc&limit=500`,
    headers,
  );

  if (!leadsRes.ok) {
    throw new Error(`Failed to query api_syn_leads_view_v1 (${leadsRes.status}): ${leadsRes.text}`);
  }

  const leadsRows = Array.isArray(leadsRes.json) ? leadsRes.json : [];
  const leadIds = leadsRows
    .map((row) => String(row?.id || '').trim())
    .filter((id) => /^[0-9]+$/.test(id));

  if (leadIds.length === 0) {
    const report = {
      success: true,
      checked_rows: 0,
      invalid_rows: 0,
      note: 'No rows returned from api_syn_leads_view_v1; scope check considered pass for empty dataset.',
      checked_at: new Date().toISOString(),
    };
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const idList = leadIds.join(',');
  const eventsRes = await httpJson(
    `${projectUrl}/rest/v1/canonical_events?select=id,event_layer,raw_payload&id=in.(${idList})`,
    headers,
  );

  if (!eventsRes.ok) {
    throw new Error(`Failed to query canonical_events for lead IDs (${eventsRes.status}): ${eventsRes.text}`);
  }

  const eventsRows = Array.isArray(eventsRes.json) ? eventsRes.json : [];
  const invalid = [];

  for (const row of eventsRows) {
    const kind = normalizeEntityKind(row);
    if (kind !== 'deal') {
      invalid.push({
        id: row?.id,
        entity_kind: kind || null,
      });
    }
  }

  const report = {
    success: invalid.length === 0,
    checked_rows: eventsRows.length,
    invalid_rows: invalid.length,
    invalid_examples: invalid.slice(0, 20),
    checked_at: new Date().toISOString(),
  };

  console.log(JSON.stringify(report, null, 2));

  if (invalid.length > 0) {
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
