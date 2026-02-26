import process from 'node:process';

const host = process.env.CLICKHOUSE_HOST || '127.0.0.1';
const port = process.env.CLICKHOUSE_HTTP_PORT || '8123';
const user = process.env.CLICKHOUSE_USER || 'mapa_app';
const password = process.env.CLICKHOUSE_PASSWORD || 'mapa_local_dev_password';

const baseUrl = `http://${host}:${port}`;
const auth = Buffer.from(`${user}:${password}`).toString('base64');

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

async function main() {
  const ping = await request('/ping');
  if (!ping.ok || ping.text.trim() !== 'Ok.') {
    console.error(`[clickhouse] ping failed: status=${ping.status} body="${ping.text.trim()}"`);
    process.exit(1);
  }

  const health = await request('/?query=select%201');
  if (!health.ok || health.text.trim() !== '1') {
    console.error(`[clickhouse] query failed: status=${health.status} body="${health.text.trim()}"`);
    process.exit(1);
  }

  console.log(`[clickhouse] healthy at ${baseUrl}`);
}

main().catch((error) => {
  console.error(`[clickhouse] healthcheck error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

