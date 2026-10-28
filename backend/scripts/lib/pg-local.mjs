/**
 * Local Postgres harness.
 *
 * The backend's only real database is Postgres, and its migrations are DDL: until
 * they have run against a live server nothing about them is verified. The first
 * attempt at migration 0009 proved the cost of finding that out in CI — it was
 * applied for the first time on `main` and failed on a runner (`FAILED
 * 0009_audit_log_and_sessions.sql`, syntax error from a stripped plpgsql BEGIN).
 *
 * This module runs a throwaway cluster that matches the CI image's major version
 * (pgvector/pgvector:pg17) inside the repository, so a migration can be executed
 * — from zero and as an upgrade over an existing history — before it is pushed.
 *
 * Two rules keep it honest and safe:
 *
 *   1. An explicit `DATABASE_URL` always wins. The harness never invents a
 *      connection when one has been handed to it, which is what lets CI and
 *      `docker compose` use the same gate without a second cluster.
 *   2. It only manages a cluster it created (`backend/.pgdata`), and `stop()`
 *      only stops a server this process started. Nothing else on the machine is
 *      touched, and port 5432 is never used.
 *
 * Dev-only by construction: the cluster listens on loopback only and
 * authenticates with trust, so it must never be pointed at anything but a
 * disposable local directory.
 */

import { existsSync as fsExists } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

/** backend/scripts/lib -> backend */
export const BACKEND_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Disposable cluster, ignored by git. Delete with `npm run db:reset`. */
export const CLUSTER_DIR = join(BACKEND_DIR, '.pgdata');
export const LOG_FILE = join(CLUSTER_DIR, 'server.log');

/** The major version CI pins in `.github/workflows/ci.yml` (`pgvector:pg17`). */
export const REQUIRED_MAJOR = 17;
/** A local default that keeps 5432 free for a Postgres you run yourself. */
export const DEFAULT_PORT = 5455;
export const DEV_USER = 'openstrata';
export const DEV_DB = 'openstrata';

const HOMEBREW_KEGS = ['/opt/homebrew/opt/postgresql@17/bin', '/usr/local/opt/postgresql@17/bin'];
const LINUX_KEGS = ['/usr/lib/postgresql/17/bin'];

/** A failure the operator can act on. Printed without a stack trace. */
export class HarnessError extends Error {}

/** Run a binary and capture its output; throws HarnessError unless allowed to fail. */
export function run(bin, args, { env = process.env, allowFailure = false } = {}) {
  const result = spawnSync(bin, args, { encoding: 'utf8', env });
  if (result.error) {
    if (allowFailure) return { status: 1, stdout: '', stderr: result.error.message };
    throw new HarnessError(`${bin} could not be run: ${result.error.message}`);
  }
  if (result.status !== 0 && !allowFailure) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new HarnessError(`${bin} ${args.join(' ')} failed (exit ${result.status})${detail ? `:\n${detail}` : ''}`);
  }
  return result;
}

/** Parse a port from an env var, defaulting rather than guessing. */
export function parsePort(raw, fallback = DEFAULT_PORT) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback;
  const port = Number(String(raw).trim());
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new HarnessError(`OPENSTRATA_DB_PORT must be a port number, got ${JSON.stringify(raw)}`);
  }
  return port;
}

/** `pg_config --bindir` — the bin directory of whatever Postgres is on PATH. */
export function pgConfigBindir() {
  const result = spawnSync('pg_config', ['--bindir'], { encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim() ? result.stdout.trim() : null;
}

/**
 * Locate a Postgres 17 bin directory, or `null` when the machine has none.
 *
 * Order: an explicit override, then the Homebrew keg for 17, then the Linux
 * package path, then whatever `pg_config` is on PATH — accepted only when it is
 * the same major, so the local gate runs the same server version as CI. The
 * PATH lookup runs last and lazily: it costs a process spawn, and nobody with a
 * keg should pay for it.
 */
export function findBinaryDir({ env = process.env, exists = fsExists, exec = run, pgConfig = pgConfigBindir } = {}) {
  const usable = (candidate) => {
    if (!exists(join(candidate.dir, 'pg_ctl')) || !exists(join(candidate.dir, 'initdb'))) return null;
    const version = pgVersion(candidate.dir, { exec, allowFailure: true });
    if (version === null) return null;
    // An explicit override is taken as given (and reported), because a
    // contributor may deliberately run the gate on a newer server.
    if (candidate.pinned || version.major === REQUIRED_MAJOR) return { ...candidate, version };
    return null;
  };

  const pinned = env.OPENSTRATA_PG_BIN?.trim();
  if (pinned) {
    const found = usable({ dir: pinned, source: 'OPENSTRATA_PG_BIN', pinned: true });
    if (found) return found;
  }
  for (const dir of [...HOMEBREW_KEGS, ...LINUX_KEGS]) {
    const found = usable({ dir, source: `postgres keg ${dir}`, pinned: false });
    if (found) return found;
  }
  const onPath = pgConfig();
  if (onPath) {
    const found = usable({ dir: onPath, source: 'pg_config on PATH', pinned: false });
    if (found) return found;
  }
  return null;
}

/** Read `initdb --version` from a bin directory. `null` when it cannot be run. */
export function pgVersion(binDir, { exec = run, allowFailure = false } = {}) {
  const result = exec(join(binDir, 'initdb'), ['--version'], { allowFailure: true });
  if (result.status !== 0) {
    if (allowFailure) return null;
    throw new HarnessError(`${join(binDir, 'initdb')} --version failed: ${(result.stderr || '').trim()}`);
  }
  const match = /(\d+)(?:\.(\d+))?/.exec(result.stdout);
  if (!match) return null;
  return { major: Number(match[1]), full: result.stdout.trim() };
}

/** FindBinaryDir throws; callers that can explain the fix use this. */
export function requireBinaryDir(options = {}) {
  const found = findBinaryDir(options);
  if (!found) throw new HarnessError(missingPostgresMessage());
  return found;
}

export function missingPostgresMessage() {
  return [
    `PostgreSQL ${REQUIRED_MAJOR} + pgvector were not found (the version CI runs).`,
    '',
    '  macOS:  brew install postgresql@17 pgvector',
    '  Debian: apt-get install postgresql-17 postgresql-17-pgvector',
    '',
    'Or point the harness at an existing installation with OPENSTRATA_PG_BIN=/path/to/pg/bin.'
  ].join('\n');
}

/**
 * The 0003 migration runs `CREATE EXTENSION vector`, so a cluster without
 * pgvector cannot apply the schema at all. Check the extension files that
 * belong to *this* server's sharedir, not a name on PATH.
 */
export function checkVectorExtension(binaryDir, { exec = run, exists = fsExists } = {}) {
  const configured = exec(join(binaryDir, 'pg_config'), ['--sharedir'], { allowFailure: true });
  if (configured.status !== 0) {
    return { ok: false, why: `pg_config --sharedir failed in ${binaryDir}` };
  }
  const control = join(configured.stdout.trim(), 'extension', 'vector.control');
  return exists(control)
    ? { ok: true, control }
    : { ok: false, control, why: `pgvector is not installed for this server (missing ${control})` };
}

/** The connection string for the harness cluster. */
export function localUrl({ port = DEFAULT_PORT, user = DEV_USER, database = DEV_DB, host = '127.0.0.1' } = {}) {
  return `postgres://${user}@${host}:${port}/${database}`;
}

/**
 * Which database the gate should use: an explicit `DATABASE_URL` (CI,
 * `docker compose`, a Postgres you already run) or the harness cluster.
 */
export function resolveDatabaseUrl(env = process.env) {
  const explicit = env.DATABASE_URL?.trim();
  if (explicit) return { url: explicit, mode: 'external' };
  return { url: localUrl({ port: parsePort(env.OPENSTRATA_DB_PORT) }), mode: 'local' };
}

/** Hosts the gate is willing to create a scratch database on without being told to. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', 'host.docker.internal']);

export function isLocalHost(host) {
  return LOCAL_HOSTS.has(String(host ?? '').toLowerCase());
}

/** Split a connection string into the pieces the harness needs. */
export function describeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new HarnessError(`not a valid connection string: ${url}`);
  }
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username || DEV_USER),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '') || DEV_DB)
  };
}

export function isRunning(binaryDir, port, { exec = run } = {}) {
  const result = exec(join(binaryDir, 'pg_isready'), ['-h', '127.0.0.1', '-p', String(port), '-q'], { allowFailure: true });
  return result.status === 0;
}

/** Initialise the cluster directory if it does not already hold one. */
export async function initCluster(binaryDir, { dir = CLUSTER_DIR, exec = run, mkdir: mkdirFn = mkdir, exists = fsExists } = {}) {
  if (exists(join(dir, 'PG_VERSION'))) return false;
  await mkdirFn(dir, { recursive: true });
  try {
    exec(join(binaryDir, 'initdb'), ['-D', dir, '-U', DEV_USER, '--auth=trust', '-E', 'UTF8', '--no-sync']);
  } catch (error) {
    throw new HarnessError(`${error.message}\n\nThe cluster directory ${dir} is disposable: remove it and try again (npm run db:reset).`);
  }
  return true;
}

/**
 * Start the cluster if it is not already listening. Returns `{ started }` so the
 * caller stops only what it started.
 */
export function startCluster(binaryDir, port = DEFAULT_PORT, { dir = CLUSTER_DIR, exec = run, log = LOG_FILE } = {}) {
  if (isRunning(binaryDir, port, { exec })) return { started: false };
  const options = ['-p', String(port), '-k', dir, '-c', 'listen_addresses=127.0.0.1', '-c', 'synchronous_commit=off'];
  try {
    exec(join(binaryDir, 'pg_ctl'), ['-D', dir, '-l', log, '-o', options.join(' '), '-w', '-t', '30', 'start']);
  } catch (error) {
    throw new HarnessError(`${error.message}\n\nServer log: ${log}`);
  }
  return { started: true };
}

export function stopCluster(binaryDir, { dir = CLUSTER_DIR, exec = run } = {}) {
  try {
    exec(join(binaryDir, 'pg_ctl'), ['-D', dir, '-m', 'fast', '-w', '-t', '30', 'stop'], { allowFailure: true });
  } catch {
    /* already stopped */
  }
}

/** Create and drop databases through the `pg` client, so no CLI tools are needed. */
export function pgClient(url, { Client } = {}) {
  const pg = require('pg');
  return new (Client ?? pg.Client)({ connectionString: url, connectionTimeoutMillis: 5_000 });
}

/**
 * Run a statement against the maintenance database on the same server. `CREATE
 * DATABASE` and `DROP DATABASE` cannot run inside a transaction block, so this
 * uses a short-lived dedicated connection rather than a pool.
 */
export async function withMaintenanceConnection(url, fn, { connect = pgClient } = {}) {
  const base = new URL(url);
  // `postgres` exists in every cluster, including one initialised with -U.
  base.pathname = '/postgres';
  const client = connect(base.toString());
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function dropDatabase(url, name, { connect = pgClient, closeConnections = true } = {}) {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new HarnessError(`refusing to drop the suspicious database name ${JSON.stringify(name)}`);
  await withMaintenanceConnection(
    url,
    async (client) => {
      // `WITH (FORCE)` terminates stragglers left by a failed test run; without
      // it a leaked connection would make the next run fail on DROP.
      await client.query(`DROP DATABASE IF EXISTS ${name}${closeConnections ? ' WITH (FORCE)' : ''}`);
    },
    { connect }
  );
}

export async function createDatabase(url, name, { connect = pgClient } = {}) {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new HarnessError(`refusing to create the suspicious database name ${JSON.stringify(name)}`);
  await withMaintenanceConnection(
    url,
    async (client) => {
      await client.query(`CREATE DATABASE ${name}`);
    },
    { connect }
  );
}

export async function databaseExists(url, name, { connect = pgClient } = {}) {
  return withMaintenanceConnection(
    url,
    async (client) => {
      const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
      return result.rowCount > 0;
    },
    { connect }
  );
}

/** Point a connection string at a different database on the same server. */
export function withDatabase(url, name) {
  const parsed = new URL(url);
  parsed.pathname = `/${name}`;
  return parsed.toString();
}

/** The scratch database the gate migrates and tests against. */
export function scratchDatabaseName(baseUrl) {
  const { database } = describeUrl(baseUrl);
  return `${database}_gate`;
}

/** Remove the cluster directory. */
export async function removeCluster({ dir = CLUSTER_DIR, rm: rmFn = rm } = {}) {
  await rmFn(dir, { recursive: true, force: true });
}
