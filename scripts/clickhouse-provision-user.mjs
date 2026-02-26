import { provisionClickHouseSynUser } from './lib/syn-semantic-runtime.mjs';

async function main() {
  const result = await provisionClickHouseSynUser({});
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(`[clickhouse:provision-user] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
