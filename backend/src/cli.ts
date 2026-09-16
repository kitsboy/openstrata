/**
 * `openstrata` CLI — operational subcommands for the Phase 3 services.
 *
 *   npx tsx src/cli.ts rosa ingest            Validate the BC compliance corpus (pure)
 *   npx tsx src/cli.ts rosa index             Embed + write the corpus into pgvector (needs Ollama + DB)
 *   npx tsx src/cli.ts rosa reset             Dev: drop + re-create the corpus_chunk table
 *   npx tsx src/cli.ts ziggy simulate         Walk a treasury scenario through the state machine
 *
 * `rosa ingest` is pure (no DB/Ollama). `rosa index` writes embeddings into the
 * `corpus_chunk` table (migration 0002) so the vector retriever has data to
 * cosine-search; it is the indexing step, not a gate — runtime Rosa still falls
 * back to the keyword retriever when pgvector/Ollama are offline.
 */

import { BC_CORPUS } from './rosa/bc-corpus.js';
import type { SourceRecord } from './rosa/rosa.js';
import { keywordRetriever } from './rosa/rosa.js';
import { ingestCorpus, resetCorpus } from './rosa/ingest-vector.js';
import { Pool } from 'pg';
import {
  authorizeSpend,
  checkCrfCap,
  reconcileTransfer,
  crfFloor,
  invoiceFingerprint
} from './ziggy/ziggy.js';

async function rosaIngest(): Promise<void> {
  const corpus: SourceRecord[] = BC_CORPUS;
  const distinct = new Set(corpus.map((c) => c.citation)).size;
  const retriever = keywordRetriever(corpus);

  console.log('Rosa ingest — pure corpus validation (nothing written).');
  console.log(`  documents : ${corpus.length}`);
  console.log(`  distinct  : ${distinct} citations`);
  for (const c of corpus) console.log(`    - ${c.citation}  ${c.title}`);

  // Smoke-test retrieval without the embed model (keyword fallback).
  const probe = 'what must a strata report for emergency reserves?';
  const hits = await retriever.retrieve(probe, 3);
  console.log(`\n  retrieval smoke-test for "${probe}":`);
  if (!hits.length) {
    console.log('    (no hits in the loaded corpus)');
  } else {
    for (const h of hits) console.log(`    ${h.score.toFixed(2)}  ${h.source.citation}`);
  }
}

async function rosaIndex(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is required for rosa index');
    process.exit(2);
  }
  const pool = new Pool({ connectionString: dbUrl });
  const collection = process.env.VECTOR_COLLECTION ?? 'bc_spa_rta_crt';
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? 'http://host.docker.internal:11434';
  const embedModel = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text';

  try {
    const result = await ingestCorpus({ pool, collection, ollamaBaseUrl, embedModel });
    console.log('Rosa index — corpus written to pgvector.');
    console.log(`  collection       : ${collection}`);
    console.log(`  ollama           : ${ollamaBaseUrl} (${embedModel})`);
    console.log(`  indexed          : ${result.indexed}`);
    console.log(`  skipped/errors   : ${result.skipped}`);
    if (result.errors.length) {
      console.log('  errors:');
      for (const e of result.errors) console.log(`    - ${e}`);
    }
    if (result.indexed === 0 && result.skipped === BC_CORPUS.length) {
      console.log('  hint: is Ollama running? curl ' + ollamaBaseUrl + '/api/tags');
    }
  } finally {
    await pool.end();
  }
}

async function rosaReset(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is required for rosa reset');
    process.exit(2);
  }
  const pool = new Pool({ connectionString: dbUrl });
  const collection = process.env.VECTOR_COLLECTION ?? 'bc_spa_rta_crt';
  try {
    await resetCorpus(pool, collection);
    console.log(`Rosa reset — dropped + re-created ${collection} (dev only).`);
  } finally {
    await pool.end();
  }
}

function ziggySimulate(): void {
  const budget = {
    fiscalYear: '2026',
    totalOperatingBasis: 4_200_000,
    crfMandatoryPct: 10
  };
  const floor = crfFloor(budget);
  console.log('Ziggy treasury simulation (pure state machine, nothing posted).');
  console.log(`  budget            : ${budget.totalOperatingBasis} bp`);
  console.log(`  CRF mandatory     : ${floor} bp (${budget.crfMandatoryPct}%)`);

  const balances = { crf: 520_000, operating: 210_000 };
  const scenarios = [
    { label: 'elevator refurb', fundCode: 'crf', amountBasis: 40_000, poRef: 'PO-2026-0117', category: 'capital' },
    { label: 'over CRF floor', fundCode: 'crf', amountBasis: 58_000, poRef: 'PO-2026-0201', category: 'capital' },
    { label: 'no PO reference', fundCode: 'operating', amountBasis: 5_000, poRef: '', category: 'repairs' },
    { label: 'bonding deposit', fundCode: 'operating', amountBasis: 3_000, poRef: 'PO-2026-0088', category: 'services' }
  ] as const;

  for (const s of scenarios) {
    const verdict = authorizeSpend(budget, balances, {
      amountBasis: s.amountBasis,
      fundCode: s.fundCode,
      poRef: s.poRef,
      category: s.category,
      description: s.label
    });
    console.log(`  ${verdict.allow ? 'ALLOW ' : 'BLOCK '} ${s.label.padEnd(18)} ${verdict.reason}`);
  }

  const cap = checkCrfCap(budget, balances.crf, 58_000);
  console.log(`\n  CRF cap probe      : floor=${cap.floorBasis}, post=${balances.crf - 58_000}, breached=${cap.breached}`);

  const fp = invoiceFingerprint('INV-914', 'Acme Elevator Co', 40_000);
  console.log(`  invoice fingerprint: ${fp}`);

  const recon = reconcileTransfer(
    'STRATA-FEE et1120',
    [
      { unitId: 'U-1120', refs: ['1120', 'et-1120'] },
      { unitId: 'U-2210', refs: ['2210'] }
    ],
    { id: 'ET-1046', reference: 'STRATA-FEE et1120' }
  );
  console.log(`  reconcile          : ${JSON.stringify(recon)}`);
}

async function main(argv: string[]): Promise<void> {
  const [group, sub] = argv.slice(2);
  if (group === 'rosa' && sub === 'ingest') {
    await rosaIngest();
    return;
  }
  if (group === 'rosa' && sub === 'index') {
    await rosaIndex();
    return;
  }
  if (group === 'rosa' && sub === 'reset') {
    await rosaReset();
    return;
  }
  if (group === 'ziggy' && sub === 'simulate') {
    ziggySimulate();
    return;
  }
  console.error(
    `Usage: npx tsx src/cli.ts <subcommand>\n\n` +
      `  rosa ingest         validate the BC compliance corpus (pure, no DB/Ollama)\n` +
      `  rosa index          embed + write the corpus into pgvector (needs Ollama + DB)\n` +
      `  rosa reset          dev: drop + re-create the corpus_chunk table\n` +
      `  ziggy simulate      walk a treasury scenario through the state machine`
  );
  process.exit(group ? 1 : 0);
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});