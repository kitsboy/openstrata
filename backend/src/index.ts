/**
 * Phase 3 backend entrypoint. Boots:
 *   - PostgresLedgerStore (trust ledger) + LedgerEngine
 *   - Rosa retriever (pgvector/Ollama when available, keyword fallback otherwise)
 *   - Reconciler (unit-reference matching)
 *   - Fastify API
 */

import { Pool } from 'pg';
import { loadConfig } from './config.js';
import { PostgresLedgerStore } from './ledger/store.js';
import { LedgerEngine } from './ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from './rosa/rosa.js';
import { vectorRetriever, vectorStoreReady } from './rosa/vector-retriever.js';
import { reconcile } from './trf/recon.js';
import { PostgresPaymentRequestStore } from './rails/payment-store.js';
import { PostgresAuthStore } from './auth/pg-store.js';
import { LiveRateProvider } from './rails/rate-provider.js';
import { buildServer } from './api/server.js';
import { DemoInteracProvider, HttpInteracProvider } from './rails/interac.js';
import { DEFAULT_UNITS } from './units/seed.js';
import { PostgresUnitStore } from './units/pg-store.js';
import { PostgresMemberStore } from './members/pg-store.js';

async function main(): Promise<void> {
  const config = loadConfig();

  const store = new PostgresLedgerStore(config.dbUrl);
  const ledger = new LedgerEngine(store);
  const payments = new PostgresPaymentRequestStore(config.dbUrl);
  const auth = new PostgresAuthStore(config.dbUrl);
  const units = new PostgresUnitStore(config.dbUrl);
  const members = new PostgresMemberStore(config.dbUrl);

  // Corpus: in-memory starter set (docs/bc-compliance) + the pgvector table
  // once `rosa ingest` has indexed it. We always keep the in-memory copy so
  // the keyword fallback still works if pgvector/Ollama are offline.
  const corpus: SourceRecord[] = await import('./rosa/bc-corpus.js').then((m) => m.BC_CORPUS);

  // Prefer real embeddings when pgvector + Ollama are reachable; otherwise the
  // keyword retriever keeps Rosa runnable (the safe floor).
  let rosa = keywordRetriever(corpus);
  let vectorPool: Pool | undefined;

  // Probe pgvector readiness with a short-lived pool (the store keeps its own).
  let useVector = false;
  try {
    const probe = new Pool({ connectionString: config.dbUrl });
    useVector = await vectorStoreReady(probe, config.vectorCollection);
    await probe.end();
  } catch {
    useVector = false;
  }

  if (useVector) {
    vectorPool = new Pool({ connectionString: config.dbUrl });
    rosa = vectorRetriever({
      pool: vectorPool,
      ollamaBaseUrl: config.ollamaBaseUrl,
      embedModel: config.ollamaEmbedModel,
      collection: config.vectorCollection,
      corpus
    });
  }

  // Interac e-Transfer: live only when the council's financial institution
  // issued a credential. Otherwise the labelled rehearsal keeps the handshake
  // exercisable end to end without pretending a bank was contacted.
  const interac =
    config.interac.enabled && config.interac.apiUrl && config.interac.merchantId && config.interac.apiKey
      ? new HttpInteracProvider({
          apiUrl: config.interac.apiUrl,
          merchantId: config.interac.merchantId,
          apiKey: config.interac.apiKey,
          gatewayHosts: config.interac.gatewayHosts,
          ttlMinutes: config.interac.requestTtlMinutes
        })
      : new DemoInteracProvider();

  const app = await buildServer({
    ledger,
    rosa,
    reconcile,
    payments,
    auth,
    interac,
    resolver: new LiveRateProvider({
      fallbackRate: Number.isFinite(Number(process.env.CAD_PER_BTC))
        ? Number(process.env.CAD_PER_BTC)
        : undefined
    }),
    units: DEFAULT_UNITS, // registry fallback for legacy seams
    unitStore: units,
    memberStore: members,
    readinessChecks: {
      postgres: async () => {
        const probe = new Pool({ connectionString: config.dbUrl, connectionTimeoutMillis: 1500, max: 1 });
        try {
          await probe.query('SELECT 1');
          return true;
        } finally {
          await probe.end();
        }
      }
    },
    config: {
      crfMandatoryPct: config.crfMandatoryPct,
      vectorCollection: config.vectorCollection,
      rails: config.rails,
      cadPerBtc: Number(process.env.CAD_PER_BTC ?? 0) || 0,
      authSecret: config.authSecret,
      authTokenTtl: config.authTokenTtl,
      authRateLimitMax: config.authRateLimitMax,
      authRateLimitWindowMs: config.authRateLimitWindowMs,
      payLinkSecret: config.payLink.secret,
      payLinkTtlDays: config.payLink.ttlDays,
      corsOrigins: config.corsOrigins
    }
  });

  // Patch app.close so the vector pool + every store shut down together.
  const _origClose = app.close.bind(app);
  app.close = (async () => {
    await _origClose();
    await vectorPool?.end();
    await store.close();
    await payments.close();
    await auth.close();
    await units.close();
    await members.close();
  }) as typeof app.close;

  await app.listen({ host: config.host, port: config.port });
  app.log.info(`openstrata-backend listening on ${config.host}:${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
