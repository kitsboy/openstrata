#!/usr/bin/env node
/**
 * Idempotent demo-community seed for the trust ledger.
 *
 * Creates the Cedar Point demo community with isolated Operating / CRF /
 * Special Levy accounts. Safe to re-run: accounts are upserted. This mirrors
 * the seed baked into src/ledger/schema.sql (fresh initdb volumes) so a DB
 * brought up via migrations has the same demo data.
 *
 * Usage: node scripts/seed.mjs  (from backend/)
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
try {
  require('dotenv')?.config?.({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });
} catch {
  /* ambient DATABASE_URL */
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(2);
}

const pg = require('pg');
const DEMO = [
  { fundCode: 'operating', label: 'Operating Fund' },
  { fundCode: 'crf', label: 'Contingency Reserve' },
  { fundCode: 'special_levy', label: 'Special Levy' }
];

async function main() {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const g = await client.query(
      `INSERT INTO account_group (community_id, name, currency)
       VALUES ($1, $1, 'CAD')
       ON CONFLICT (community_id, name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['demo-cedar-point']
    );
    for (const f of DEMO) {
      await client.query(
        `INSERT INTO account (group_id, fund_code, label)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, fund_code) DO UPDATE SET label = EXCLUDED.label`,
        [g.rows[0].id, f.fundCode, f.label]
      );
    }
    console.log(`seeded 'demo-cedar-point' with ${DEMO.length} accounts`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});