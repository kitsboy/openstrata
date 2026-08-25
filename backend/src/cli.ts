/**
 * `openstrata` CLI — operational subcommands for the Phase 3 services.
 *
 *   npx tsx src/cli.ts rosa ingest            Load + validate the BC compliance corpus
 *   npx tsx src/cli.ts ziggy simulate         Walk a treasury scenario through the state machine
 *
 * These stay pure over the deterministic domain modules (Rosa's keyword corpus,
 * Ziggy's authorize/cap/reconcile) so operators can smoke-test the engines
 * without spinning up Postgres/Ollama.
 */

import { BC_CORPUS } from './rosa/bc-corpus.js';
import { keywordRetriever, type SourceRecord } from './rosa/rosa.js';
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

  console.log('Rosa ingest — nothing written (pure corpus validation).');
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
  if (group === 'ziggy' && sub === 'simulate') {
    ziggySimulate();
    return;
  }
  console.error(
    `Usage: npx tsx src/cli.ts <subcommand>\n\n` +
      `  rosa ingest         validate the BC compliance corpus\n` +
      `  ziggy simulate      walk a treasury scenario through the state machine`
  );
  process.exit(group ? 1 : 0);
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});