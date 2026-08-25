#!/usr/bin/env node
/**
 * Minimal, dependency-light schema migration runner.
 *
 * Applies each `.sql` file in src/ledger/migrations lexically once, tracking
 * applied files in a `_schema_version` table. It reads `DATABASE_URL` from the
 * environment (or backend/.env via dotenv if present).
 *
 * Usage:  node scripts/migrate.mjs  (from backend/)
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Let dotenv load backend/.env if it exists (never fail if missing).
try {
  require('dotenv')?.config?.({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });
} catch {
  /* dotenv not installed — rely on ambient DATABASE_URL */
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(2);
}

const pg = require('pg');
const MIGRATIONS_DIR = join(dirname(dirname(fileURLToPath(import.meta.url))), 'src', 'ledger', 'migrations');

async function main() {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS _schema_version (
      file TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    const done = new Set(
      (await client.query('SELECT file FROM _schema_version')).rows.map((r) => r.file)
    );
    let applied = 0;
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _schema_version (file) VALUES ($1)', [file]);
        await client.query('COMMIT');
        applied += 1;
        console.log(`applied  ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`FAILED  ${file}`);
        throw err;
      }
    }
    console.log(applied === 0 ? 'no pending migrations' : `applied ${applied} migration(s)`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});