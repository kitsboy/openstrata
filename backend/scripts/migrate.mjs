#!/usr/bin/env node
/**
 * Minimal, dependency-light schema migration runner.
 *
 * Applies each `.sql` file in src/ledger/migrations lexically once, tracking
 * SHA-256 checksums in `_schema_version`. `--check` performs a read-only
 * preflight and fails on drift, orphaned records, or pending migrations. It reads `DATABASE_URL` from the
 * environment (or backend/.env via dotenv if present).
 *
 * Usage:  node scripts/migrate.mjs [--check]  (from backend/)
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);

// Let dotenv load backend/.env if it exists (never fail if missing).
try {
  require('dotenv')?.config?.({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });
} catch {
  /* dotenv not installed — rely on ambient DATABASE_URL */
}

const pg = require('pg');
const MIGRATIONS_DIR = join(dirname(dirname(fileURLToPath(import.meta.url))), 'src', 'ledger', 'migrations');

export async function runMigrations(client, { checkOnly = false } = {}) {
  let lockAcquired = false;
  try {
    // Serialize migration runners before any migration metadata is created or
    // inspected. The lock changes session lock state, not schema or table data.
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['openstrata:schema-migrations']);
    lockAcquired = true;
    if (!checkOnly) {
      await client.query(`CREATE TABLE IF NOT EXISTS _schema_version (
        file TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    }
    const table = await client.query(`
      SELECT to_regclass(current_schema() || '._schema_version') AS name,
             EXISTS (
               SELECT 1 FROM information_schema.columns
                WHERE table_schema = current_schema() AND table_name = '_schema_version' AND column_name = 'checksum'
             ) AS has_checksum
    `);
    if (!table.rows[0]?.name) {
      throw new Error('migration metadata is missing; run npm run migrate first');
    }

    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    const migrations = new Map();
    for (const file of files) {
      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
      migrations.set(file, { sql, checksum: createHash('sha256').update(sql).digest('hex') });
    }
    if (!table.rows[0].has_checksum && checkOnly) throw new Error('migration checksums are not installed; run npm run migrate');
    const rows = await client.query(table.rows[0].has_checksum ? 'SELECT file, checksum FROM _schema_version' : 'SELECT file, NULL::text AS checksum FROM _schema_version');
    let hasChecksum = table.rows[0].has_checksum;
    const done = new Map(rows.rows.map((r) => [r.file, r.checksum]));
    const orphaned = [...done.keys()].filter((file) => !migrations.has(file));
    if (orphaned.length) throw new Error(`applied migration files are missing: ${orphaned.join(', ')}`);
    const unpinned = [...done.keys()].filter((file) => done.get(file) === null);
    if (hasChecksum && unpinned.length) {
      if (checkOnly) throw new Error(`migration checksums need baselining for: ${unpinned.join(', ')}; run npm run migrate`);
      // If the 0008 ALTER was committed by an older runner before its ledger
      // row was recorded, finish that special baseline idempotently in-place.
      if (unpinned.includes('0008_migration_checksum.sql')) {
        const checksumMigration = migrations.get('0008_migration_checksum.sql');
        await client.query('BEGIN');
        try {
          for (const file of unpinned.filter((name) => name !== '0008_migration_checksum.sql')) {
            const checksum = migrations.get(file).checksum;
            await client.query('UPDATE _schema_version SET checksum = $2 WHERE file = $1 AND checksum IS NULL', [file, checksum]);
            done.set(file, checksum);
          }
          await client.query(
            `UPDATE _schema_version SET checksum = $2 WHERE file = $1 AND checksum IS NULL`,
            ['0008_migration_checksum.sql', checksumMigration.checksum]
          );
          await client.query('COMMIT');
          done.set('0008_migration_checksum.sql', checksumMigration.checksum);
          console.log(`baselined ${unpinned.length} legacy migration checksum(s)`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else {
        await client.query('BEGIN');
        try {
          for (const file of unpinned) {
            const checksum = migrations.get(file).checksum;
            await client.query('UPDATE _schema_version SET checksum = $2 WHERE file = $1 AND checksum IS NULL', [file, checksum]);
            done.set(file, checksum);
          }
          await client.query('COMMIT');
          console.log(`baselined ${unpinned.length} legacy migration checksum(s)`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }
    }
    // Install the checksum column before iterating migrations lexically. This is
    // needed for both fresh databases and legacy databases: otherwise pending
    // 0007 is encountered before 0008 and cannot be recorded with its checksum.
    if (!hasChecksum) {
      const checksumFile = '0008_migration_checksum.sql';
      const migration = migrations.get(checksumFile);
      if (!migration) throw new Error(`required checksum migration ${checksumFile} is missing`);
      const baseline = [...done.keys()]
        .filter((appliedFile) => appliedFile !== checksumFile)
        .map((appliedFile) => [appliedFile, migrations.get(appliedFile).checksum]);
      await client.query('BEGIN');
      try {
        const sql = stripTransactionWrappers(migration.sql);
        await client.query(sql);
        for (const [appliedFile, checksum] of baseline) {
          await client.query('UPDATE _schema_version SET checksum = $2 WHERE file = $1', [appliedFile, checksum]);
          done.set(appliedFile, checksum);
        }
        await client.query(
          `INSERT INTO _schema_version (file, checksum) VALUES ($1, $2)
           ON CONFLICT (file) DO UPDATE SET checksum = EXCLUDED.checksum`,
          [checksumFile, migration.checksum]
        );
        await client.query('COMMIT');
        done.set(checksumFile, migration.checksum);
        hasChecksum = true;
        console.log(`installed migration checksums; baselined ${baseline.length} legacy migration(s)`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    let applied = 0;
    let pending = 0;
    for (const [file, migration] of migrations) {
      if (done.has(file)) {
        const stored = done.get(file);
        if (stored === null) throw new Error(`checksum baseline missing for applied migration ${file}; manual review required`);
        if (stored !== migration.checksum) throw new Error(`applied migration was modified: ${file} (checksum mismatch)`);
        continue;
      }
      pending += 1;
      if (checkOnly) {
        console.log(`pending   ${file}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        // Migration files own their transaction boundaries where needed; strip
        // wrappers so schema changes and the version/checksum row commit atomically.
        const transactionalSql = stripTransactionWrappers(migration.sql);
        await client.query(transactionalSql);
        await client.query('INSERT INTO _schema_version (file, checksum) VALUES ($1, $2)', [file, migration.checksum]);
        await client.query('COMMIT');
        applied += 1;
        console.log(`applied  ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`FAILED  ${file}`);
        throw err;
      }
    }
    if (checkOnly && pending > 0) {
      throw new Error(`${pending} migration(s) pending; run npm run migrate`);
    }
    console.log(checkOnly ? 'migration status clean (checksums match; no pending migrations)' : applied === 0 ? 'no pending migrations' : `applied ${applied} migration(s)`);
  } finally {
    if (lockAcquired) {
      try {
        await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['openstrata:schema-migrations']);
      } catch {
        // Connection close releases the session advisory lock if unlock fails.
      }
    }
  }
}

/**
 * Remove standalone migration BEGIN/COMMIT wrapper statements while leaving
 * comments, string literals, and quoted bodies untouched.
 *
 * A plain line filter is not enough. A plpgsql function body is written as
 * `BEGIN ... END;` inside a dollar-quoted `$$ ... $$` block, and stripping that
 * BEGIN leaves `RAISE EXCEPTION ...` with no block to belong to — exactly how
 * 0009 first failed in CI (`syntax error at or near "RAISE"`, code 42601). So
 * each line is classified using the quoting state carried in from the lines
 * before it, and only a wrapper that begins in plain SQL context is dropped.
 */
export function stripTransactionWrappers(sql) {
  const kept = [];
  let state = { type: 'plain' };
  for (const line of sql.split(/\r?\n/)) {
    const isWrapper = state.type === 'plain' && /^\s*(?:BEGIN|COMMIT)\s*;?\s*$/i.test(line);
    if (!isWrapper) kept.push(line);
    state = scanLineState(line, state);
  }
  return kept.join('\n');
}

/** `$$`, `$body$` — the tagged form is legal too. `$1` is a placeholder, not a tag. */
const DOLLAR_QUOTE_TAG = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/;

/**
 * Track SQL quoting state across one line and return the state at its end.
 * Handles line comments, nestable block comments, single-quoted strings,
 * double-quoted identifiers, and dollar-quoted bodies — the last of which is
 * what keeps a function body opaque to the wrapper stripper.
 */
export function scanLineState(line, state = { type: 'plain' }) {
  let current = state;
  let i = 0;
  while (i < line.length) {
    if (current.type === 'line-comment') return { type: 'plain' };

    if (current.type === 'block-comment') {
      if (line.startsWith('/*', i)) {
        current = { type: 'block-comment', depth: current.depth + 1 };
        i += 2;
      } else if (line.startsWith('*/', i)) {
        i += 2;
        current = current.depth === 1 ? { type: 'plain' } : { type: 'block-comment', depth: current.depth - 1 };
      } else {
        i += 1;
      }
      continue;
    }

    if (current.type === 'single' || current.type === 'double') {
      const quote = current.type === 'single' ? "'" : '"';
      if (line[i] !== quote) {
        i += 1;
      } else if (line[i + 1] === quote) {
        i += 2; // doubled quote is an escaped quote, not a closer
      } else {
        current = { type: 'plain' };
        i += 1;
      }
      continue;
    }

    if (current.type === 'dollar') {
      if (line.startsWith(current.tag, i)) {
        i += current.tag.length;
        current = { type: 'plain' };
      } else {
        i += 1;
      }
      continue;
    }

    // Plain SQL context.
    if (line.startsWith('--', i)) return { type: 'plain' }; // comments end at the newline
    if (line.startsWith('/*', i)) {
      current = { type: 'block-comment', depth: 1 };
      i += 2;
    } else if (line[i] === "'" || line[i] === '"') {
      current = { type: line[i] === "'" ? 'single' : 'double' };
      i += 1;
    } else if (line[i] === '$') {
      const tag = DOLLAR_QUOTE_TAG.exec(line.slice(i));
      if (tag) {
        current = { type: 'dollar', tag: tag[0] };
        i += tag[0].length;
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }
  return current;
}

async function main() {
  try {
    require('dotenv')?.config?.({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });
  } catch {
    /* dotenv not installed — rely on ambient DATABASE_URL */
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exitCode = 2;
    return;
  }
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 5_000 });
  await client.connect();
  try {
    await runMigrations(client, { checkOnly: process.argv.includes('--check') });
  } finally {
    await client.end();
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}