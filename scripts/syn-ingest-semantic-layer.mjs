import { runSupabaseClickHouseSemanticSync } from './lib/syn-semantic-runtime.mjs';

function parseArgs(argv) {
  const options = {
    dryRun: false,
    batchSize: undefined,
    maxLoops: undefined,
    checkpointFile: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (value === '--batch-size') {
      options.batchSize = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (value === '--max-loops') {
      options.maxLoops = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (value === '--checkpoint-file') {
      options.checkpointFile = argv[index + 1];
      index += 1;
      continue;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = await runSupabaseClickHouseSemanticSync(options);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(`[syn-ingest] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
