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
import { PostgresPaymentRequestStore } from './rails/payment-store.js';
import { PostgresAuthStore } from './auth/pg-store.js';
import { LiveRateProvider } from './rails/rate-provider.js';
import { buildServer } from './api/server.js';
import { DEFAULT_UNITS } from './units/seed.js';

async function main(): Promise<void> {
  const config = loadConfig();

  const store = new PostgresLedgerStore(config.dbUrl);
  const ledger = new LedgerEngine(store);
  const payments = new PostgresPaymentRequestStore(config.dbUrl);
  const auth = new PostgresAuthStore(config.dbUrl);

  // Stub corpus sourced from the BC compliance knowledge base (docs). In
  // production this is loaded from the pgvector `corpus_chunk` table and the
  // embed/chat models; the keyword fallback keeps the API runnable before then.
  const corpus: SourceRecord[] = await import('./rosa/bc-corpus.js').then((m) => m.BC_CORPUS);
  const rosa = keywordRetriever(corpus);

  const app = await buildServer({
    ledger,
    rosa,
    reconcile,
    payments,
    auth,
    resolver: new LiveRateProvider({
      fallbackRate: Number.isFinite(Number(process.env.CAD_PER_BTC))
        ? Number(process.env.CAD_PER_BTC)
        : undefined
    }),
    units: DEFAULT_UNITS,
    config: {
      crfMandatoryPct: config.crfMandatoryPct,
      vectorCollection: config.vectorCollection,
      rails: config.rails,
      cadPerBtc: Number(process.env.CAD_PER_BTC ?? 0) || 0,
      authSecret: config.authSecret,
      authTokenTtl: config.authTokenTtl,
      authRateLimitMax: config.authRateLimitMax,
      authRateLimitWindowMs: config.authRateLimitWindowMs
    }
  });

  await app.listen({ host: config.host, port: config.port });
  app.log.info(`openstrata-backend listening on ${config.host}:${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});