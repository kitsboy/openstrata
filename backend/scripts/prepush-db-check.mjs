#!/usr/bin/env node
/**
 * Pre-push migration gate.
 *
 * `main` is the first place the migrations in `src/ledger/migrations` are read by
 * anything other than this repository. Migration 0009 was executed for the first
 * time in CI and broke the build there (`FAILED 0009_audit_log_and_sessions.sql`,
 * syntax error at or near "RAISE"), so the rule this script enforces is simple:
 * **a migration has to have been applied before it is pushed.**
 *
 * It proves that twice over, because the two ways a migration can be wrong are
 * different:
 *
 *   upgrade path   apply pending migrations to the persistent development
 *                  database, which already carries an applied history — checksum
 *                  drift (an earlier migration edited after the fact), DDL that
 *                  is not repeatable, and the ALTER path a real deployment takes.
 *   from zero      drop and recreate a scratch database, then apply every
 *                  migration in order — syntax errors, ordering, a missing
 *                  extension, a plpgsql body the runner mangles. This is the CI
 *                  path, and the one 0009 failed.
 *
 * Then it runs the backend suite against the scratch database and requires that
 * nothing skipped, because an unset or wrong `DATABASE_URL` is exactly how the
 * durable paths (ledger idempotency, sessions, the audit table) go untested while
 * the suite still reports green.
 *
 * Wiring: `.githooks/pre-push` runs this. Install the hook from the repository
 * root with `npm run hooks:install`. To push without the gate,
 * `OPENSTRATA_SKIP_DB_CHECK=1` or `git push --no-verify`.
 */

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import {
  BACKEND_DIR,
  DEV_DB,
  HarnessError,
  checkVectorExtension,
  createDatabase,
  databaseExists,
  describeUrl,
  dropDatabase,
  findBinaryDir,
  initCluster,
  isLocalHost,
  missingPostgresMessage,
  parsePort,
  resolveDatabaseUrl,
  scratchDatabaseName,
  startCluster,
  stopCluster,
  withDatabase
} from './lib/pg-local.mjs';

const MIGRATE = join(BACKEND_DIR, 'scripts', 'migrate.mjs');
const LABEL = 20;
const TOTAL_STEPS = 5;

const SKIP_HINT = [
  'To push anyway (leaving the migrations unverified):',
  '  OPENSTRATA_SKIP_DB_CHECK=1 git push        # or: git push --no-verify'
].join('\n');

class StepFailed extends Error {
  constructor(step, message, { output } = {}) {
    super(message);
    this.step = step;
    this.output = output;
  }
}

const started = Date.now();
let stepNumber = 0;

/** Start a numbered step line; `ok` or `fail` finishes it, exactly once. */
function step(name) {
  stepNumber += 1;
  process.stdout.write(`[${stepNumber}/${TOTAL_STEPS}] ${name.padEnd(LABEL)}`);
  const at = Date.now();
  return {
    name,
    ok: (detail) => console.log(`${detail} (${elapsed(at)})`),
    fail: () => console.log('FAILED')
  };
}

/** Finish the current step line as failed and build the error the reporter prints. */
function stepFailure(current, message, output) {
  current.fail();
  return new StepFailed(current.name, message, { output });
}

function elapsed(from) {
  const ms = Date.now() - from;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

/** Vitest colours its summary, and the colours sit between the words and counts. */
const ANSI = /\u001b\[[0-9;]*m/g;

/** Run a command, capturing output so a failure can be reported with its own log. */
function capture(command, args, { env = process.env, startedAt = Date.now() } = {}) {
  const result = spawnSync(command, args, {
    cwd: BACKEND_DIR,
    env: { NO_COLOR: '1', ...env },
    encoding: 'utf8'
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(ANSI, '');
  return { status: result.status ?? 1, output, ms: Date.now() - startedAt, error: result.error };
}

function migrate(databaseUrl, current, extraArgs = []) {
  const result = capture(process.execPath, [MIGRATE, ...extraArgs], {
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  if (result.status !== 0 || result.error) {
    throw stepFailure(current, 'the migration runner failed', result.output || result.error?.message);
  }
  return result;
}

/** `no pending migrations` / `applied 2 migration(s)` / `migration status clean` */
function migrationOutcome(output) {
  const line = output
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^(no pending migrations|applied \d+ migration\(s\)|migration status clean)/.test(l))
    .pop();
  return line ?? output.trim().split('\n').pop() ?? 'done';
}

/**
 * Which database to work on, and where the binaries are. Fails before touching
 * anything when the answer would be unsafe: no local Postgres to run against, or
 * a remote `DATABASE_URL` this must not create scratch databases on.
 */
function resolveTarget() {
  const target = resolveDatabaseUrl();
  const { host, port, database } = describeUrl(target.url);

  if (target.mode === 'external' && !isLocalHost(host)) {
    throw new StepFailed(
      'target',
      `DATABASE_URL points at ${host}, and this gate will not create scratch databases on a remote server.\n` +
        'Either unset DATABASE_URL so it uses the local cluster (npm run db:up), or skip the gate.'
    );
  }

  if (target.mode === 'external') return { ...target, host, database, port, binary: findBinaryDir() };

  const binary = findBinaryDir();
  if (!binary) {
    throw new StepFailed('target', 'no local PostgreSQL to run the migrations against', {
      output: `${missingPostgresMessage()}\n\nOr set DATABASE_URL to a Postgres you already run.`
    });
  }
  const vector = checkVectorExtension(binary.dir);
  if (!vector.ok) {
    throw new StepFailed('target', 'the local PostgreSQL cannot create the schema', {
      output: `${vector.why}\n\n  macOS: brew install pgvector`
    });
  }
  return { ...target, host, database, port: parsePort(process.env.OPENSTRATA_DB_PORT), binary };
}

async function main() {
  const target = resolveTarget();
  const { url, host, database, port, binary } = target;
  let startedHere = false;

  try {
    const cluster = step('target');
    if (target.mode === 'local') {
      await initCluster(binary.dir);
      startedHere = startCluster(binary.dir, port).started;
      const exists = await databaseExists(url, DEV_DB);
      if (!exists) await createDatabase(url, DEV_DB);
      cluster.ok(`local cluster ${binary.version.full} on 127.0.0.1:${port}${exists ? '' : `, created ${DEV_DB}`}`);
    } else {
      cluster.ok(`DATABASE_URL → ${host}:${port}/${database}`);
    }

    // 1. The upgrade path: a database that already carries applied history.
    const upgrade = step('upgrade path');
    const upgraded = migrate(url, upgrade);
    const checked = migrate(url, upgrade, ['--check']);
    upgrade.ok(`${DEV_DB}: ${migrationOutcome(upgraded.output)}; ${migrationOutcome(checked.output)}`);

    // 2. From zero, which is what CI's fresh container sees.
    const scratch = scratchDatabaseName(url);
    const scratchUrl = withDatabase(url, scratch);
    const fromZero = step('from zero');
    await dropDatabase(url, scratch);
    await createDatabase(url, scratch);
    fromZero.ok(`${scratch}: ${migrationOutcome(migrate(scratchUrl, fromZero).output)}`);

    // 3. Re-running must be a no-op, and nothing may have drifted.
    const reRun = step('re-run + checks');
    const again = migrate(scratchUrl, reRun);
    if (!/no pending migrations/.test(again.output)) {
      throw stepFailure(reRun, 'applying the migrations twice did not settle', again.output);
    }
    const checkAgain = migrate(scratchUrl, reRun, ['--check']);
    if (!/migration status clean/.test(checkAgain.output)) {
      throw stepFailure(reRun, 'migrate --check did not report a clean status', checkAgain.output);
    }
    reRun.ok('re-run reported no pending migrations; migrate:check clean');

    // 4. The durable paths, against the freshly migrated database.
    const suite = step('postgres suite');
    const ran = capture('npm', ['test'], { env: { ...process.env, DATABASE_URL: scratchUrl } });
    const summary = ran.output.split('\n').find((line) => /^\s*Tests\s+\d/.test(line));
    const passed = Number(/(\d+) passed/.exec(summary ?? '')?.[1] ?? 0);
    const skipped = Number(/(\d+) skipped/.exec(summary ?? '')?.[1] ?? 0);
    const failed = Number(/(\d+) failed/.exec(summary ?? '')?.[1] ?? 0);
    if (ran.status !== 0 || failed > 0 || passed === 0) {
      throw stepFailure(suite, 'the backend suite failed', ran.output);
    }
    if (skipped > 0) {
      throw stepFailure(suite, `${skipped} test(s) skipped — the database was not used`, `${summary}\n\nThe Postgres tests skip themselves when DATABASE_URL is missing or wrong.`);
    }
    suite.ok(`${passed} passed, 0 skipped against ${scratch}`);

    console.log(`\nmigration gate passed in ${elapsed(started)} — the schema applies from zero and as an upgrade.`);
    return 0;
  } finally {
    try {
      const scratch = scratchDatabaseName(url);
      if (await databaseExists(url, scratch).catch(() => false)) await dropDatabase(url, scratch);
    } catch {
      /* the cluster may already be gone; the scratch database is disposable */
    }
    if (startedHere && !process.env.OPENSTRATA_KEEP_DB) {
      stopCluster(binary.dir);
    } else if (startedHere) {
      console.log('  (local cluster left running — npm run db:down to stop it)');
    }
  }
}

main()
  .then((code) => {
    process.exitCode = code ?? 0;
  })
  .catch((error) => {
    if (error instanceof StepFailed) {
      console.error(`\n${error.step}: ${error.message}`);
      if (error.output) console.error(`\n${error.output.trimEnd()}\n`);
      console.error(SKIP_HINT);
    } else if (error instanceof HarnessError) {
      console.error(`\nmigration gate could not run: ${error.message}\n`);
      console.error(SKIP_HINT);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  });
