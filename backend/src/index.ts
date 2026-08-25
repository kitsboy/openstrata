/**
 * Phase 3 backend entrypoint. Boots:
 *   - PostgresLedgerStore (trust ledger) + LedgerEngine
 *   - Rosa retriever (keyword fallback until pgvector/Ollama is provisioned)
 *   - Reconciler (unit-reference matching)
 *   - Fastify API
 */

import { loadConfig } from './config.js';
import { PostgresLedgerStore } from './ledger/store.js';
import { LedgerEngine } from './ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from './rosa/rosa.js';
import { reconcile } from './trf/recon.js';
import { buildServer } from './api/server.js';

async function main(): Promise<void> {
  const config = loadConfig();

  const store = new PostgresLedgerStore(config.dbUrl);
  const ledger = new LedgerEngine(store);

  // Stub corpus sourced from the BC compliance knowledge base (docs). In
  // production this is loaded from the pgvector `corpus_chunk` table and the
  // embed/chat models; the keyword fallback keeps the API runnable before then.
  const corpus: SourceRecord[] = await import('./rosa/bc-corpus.js').then((m) => m.BC_CORPUS);
  const rosa = keywordRetriever(corpus);

  const app = await buildServer({
    ledger,
    rosa,
    reconcile,
    config: {
      crfMandatoryPct: config.crfMandatoryPct,
      vectorCollection: config.vectorCollection
    }
  });

  await app.listen({ host: config.host, port: config.port });
  app.log.info(`openstrata-backend listening on ${config.host}:${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});