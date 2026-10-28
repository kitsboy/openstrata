#!/usr/bin/env node
/**
 * Manage the throwaway local Postgres cluster (see scripts/lib/pg-local.mjs).
 *
 *   node scripts/db-local.mjs up       initialise if needed, start, ensure the database
 *   node scripts/db-local.mjs down     stop it, leaving the data directory in place
 *   node scripts/db-local.mjs status   report what exists and what is listening
 *   node scripts/db-local.mjs url      print the connection string, touch nothing
 *   node scripts/db-local.mjs reset    delete the data directory, then init and start
 *
 * From backend/: `npm run db:up`, `npm run db:status`, ... `npm run db:down`.
 * Export the URL to run anything against it:
 *
 *   export DATABASE_URL=$(npm run --silent db:url)
 *   npm run migrate && npm test
 *
 * Dev-only: loopback only, trust authentication, disposable data directory.
 */

import {
  CLUSTER_DIR,
  DEV_DB,
  HarnessError,
  checkVectorExtension,
  createDatabase,
  databaseExists,
  findBinaryDir,
  initCluster,
  isRunning,
  localUrl,
  missingPostgresMessage,
  parsePort,
  removeCluster,
  requireBinaryDir,
  startCluster,
  stopCluster
} from './lib/pg-local.mjs';

const USAGE = `usage: node scripts/db-local.mjs <up|down|status|reset|url>

  up      initialise if needed and start the cluster, then ensure the database exists
  down    stop the cluster (the data directory is kept)
  status  report the binary, the cluster directory, and whether the server is running
  url     print the local connection string without changing anything
  reset   stop, delete backend/.pgdata, then initialise and start again`;

async function up() {
  const binary = requireBinaryDir();
  const vector = checkVectorExtension(binary.dir);
  if (!vector.ok) {
    throw new HarnessError(`${vector.why}\n\n  macOS: brew install pgvector`);
  }
  const port = parsePort(process.env.OPENSTRATA_DB_PORT);
  const created = await initCluster(binary.dir);
  const { started } = startCluster(binary.dir, port);
  const url = localUrl({ port });
  const existed = await databaseExists(url, DEV_DB);
  if (!existed) await createDatabase(url, DEV_DB);

  console.log(`local Postgres ready — ${binary.version.full} (${binary.source})`);
  console.log(`  cluster  ${CLUSTER_DIR}${created ? ' (initialised)' : ''}`);
  console.log(`  server   ${started ? 'started' : 'already running'} on 127.0.0.1:${port}`);
  console.log(`  database ${DEV_DB}${existed ? '' : ' (created)'}`);
  console.log(`  url      ${url}`);
  console.log('');
  console.log('  export DATABASE_URL=$(npm run --silent db:url)   # then: npm run migrate && npm test');
  console.log('  npm run db:down                                  # stop it when you are done');
  return url;
}

function down() {
  const binary = findBinaryDir();
  if (!binary) {
    console.log(`nothing to stop — ${missingPostgresMessage().split('\n')[0]}`);
    return;
  }
  const port = parsePort(process.env.OPENSTRATA_DB_PORT);
  if (!isRunning(binary.dir, port)) {
    console.log(`local Postgres is not running on 127.0.0.1:${port}`);
    return;
  }
  stopCluster(binary.dir);
  console.log(`stopped local Postgres (data directory kept at ${CLUSTER_DIR})`);
}

async function reset() {
  const binary = requireBinaryDir();
  stopCluster(binary.dir);
  await removeCluster();
  console.log(`removed ${CLUSTER_DIR}`);
  return up();
}

async function status() {
  const binary = findBinaryDir();
  const port = parsePort(process.env.OPENSTRATA_DB_PORT);
  if (!binary) {
    console.log('local Postgres: not installed');
    console.log(missingPostgresMessage());
    return;
  }
  const vector = checkVectorExtension(binary.dir);
  const running = isRunning(binary.dir, port);
  console.log(`local Postgres: ${binary.version.full} (${binary.source})`);
  console.log(`  pgvector ${vector.ok ? 'present' : 'MISSING'}`);
  console.log(`  cluster  ${CLUSTER_DIR}`);
  console.log(`  server   ${running ? `running on 127.0.0.1:${port}` : 'not running (start with npm run db:up)'}`);
  if (running) {
    const url = localUrl({ port });
    try {
      console.log(`  database ${DEV_DB} ${(await databaseExists(url, DEV_DB)) ? 'exists' : 'does not exist yet'}`);
    } catch (error) {
      console.log(`  database unreachable: ${error.message}`);
    }
  }
  const external = process.env.DATABASE_URL?.trim();
  console.log(
    `  DATABASE_URL ${external ? `is set (${external.replace(/:[^:@/]*@/, ':***@')}) and takes precedence` : 'is not set (the local cluster is the target)'}`
  );
}

async function main() {
  const command = process.argv[2];
  switch (command) {
    case 'up':
      await up();
      break;
    case 'down':
      down();
      break;
    case 'status':
      await status();
      break;
    case 'url':
      console.log(localUrl({ port: parsePort(process.env.OPENSTRATA_DB_PORT) }));
      break;
    case 'reset':
      await reset();
      break;
    default:
      console.error(USAGE);
      process.exitCode = command ? 2 : 0;
  }
}

main().catch((error) => {
  console.error(error instanceof HarnessError ? `db-local: ${error.message}` : error);
  process.exitCode = 1;
});
