/**
 * End-to-end smoke suite against a REAL Postgres — the "deploy day" gate.
 *
 * Skipped unless DATABASE_URL is set. Run it on the host after migrations:
 *
 *   cd backend
 *   npm run migrate                     # apply 0001..0004 to Postgres
 *   DATABASE_URL=postgres://… npm run test -- e2e-smoke
 *
 * It exercises the production adapters (PostgresLedgerStore,
 * PostgresPaymentRequestStore, PostgresAuthStore) through the full product
 * flow: register council -> ledger -> billing -> payments -> forms -> meetings,
 * plus cross-council isolation. The ledger `balance` call verifies the hash
 * chain (tamper evidence) on real data.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { PostgresLedgerStore } from '../src/ledger/store.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { PostgresPaymentRequestStore } from '../src/rails/payment-store.js';
import { PostgresAuthStore } from '../src/auth/pg-store.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';
import { bech32Encode } from '../src/rails/rails.js';

const URL = process.env.DATABASE_URL;
const AUTH_SECRET = 'e2e-smoke-secret';
const LNURL = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

describe.skipIf(!URL)('e2e smoke against live Postgres', () => {
  let app: FastifyInstance;
  let ledgerStore: PostgresLedgerStore;
  let paymentsStore: PostgresPaymentRequestStore;
  let authStore: PostgresAuthStore;
  let token: string;
  let councilId: string;

  const auth = (t: string) => ({ authorization: `Bearer ${t}` });

  beforeAll(async () => {
    ledgerStore = new PostgresLedgerStore(URL!);
    paymentsStore = new PostgresPaymentRequestStore(URL!);
    authStore = new PostgresAuthStore(URL!);

    app = await buildServer(
      {
        ledger: new LedgerEngine(ledgerStore),
        rosa: keywordRetriever(corpus),
        reconcile,
        payments: paymentsStore,
        auth: authStore,
        units: DEFAULT_UNITS,
        config: {
          crfMandatoryPct: 10,
          vectorCollection: 'bc_spa_rta_crt',
          rails: {
            fiat: { enabled: true },
            lightning: { enabled: true, endpoint: 'grpc://127.0.0.1:10009' }
          },
          cadPerBtc: 50_000,
          authSecret: AUTH_SECRET,
          authTokenTtl: 3600,
          authRateLimitMax: 1000,
          authRateLimitWindowMs: 60_000
        }
      },
      { logger: false }
    );
    await app.ready();

    const email = `e2e-${Date.now()}@smoke.test`;
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: `E2E Smoke ${Date.now()}`, email, password: 'password123' }
    });
    expect(reg.statusCode).toBe(200);
    token = reg.json().token as string;
    councilId = reg.json().council.id as string;
    expect(councilId).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
    await ledgerStore.close();
    await paymentsStore.close();
    await authStore.close();
  });

  it('persists a ledger post and reads a verified balance back', async () => {
    const post = await app.inject({
      method: 'POST', url: '/api/v1/ledger/post',
      headers: auth(token),
      payload: { fund: 'operating', amountBasis: 4_200, kind: 'credit', type: 'strata_fee' }
    });
    expect(post.json().posted).toBe(true);
    expect(post.json().seq).toBeGreaterThan(0);

    const bal = await app.inject({
      method: 'GET', url: '/api/v1/ledger/balance?fund=operating', headers: auth(token)
    });
    expect(bal.statusCode).toBe(200);
    expect(bal.json().balanceBasis).toBe(4_200);
    expect(bal.json().headTally.length).toBe(8); // hash chain verified on read
  });

  it('runs a billing cycle that posts per-unit AR charges to Postgres', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/billing/run',
      headers: auth(token),
      payload: {
        period: '2026-09', dueDay: 1, graceDays: 5, lateFeeBasis: 2000,
        fees: [
          { unitId: '101', monthlyBasis: 35_000 },
          { unitId: '302', monthlyBasis: 48_500 }
        ],
        arrears: { '302': 99_000 },
        asOf: '2026-09-08'
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.run.charges).toHaveLength(2);
    expect(body.postedCount).toBe(2);
    expect(body.run.lateNotices.map((n: { unitId: string }) => n.unitId)).toEqual(['302']);

    // The AR charge for unit 101 landed on its own ledger account.
    const charge = body.run.charges.find((c: { unitId: string }) => c.unitId === '101');
    const ar = await app.inject({
      method: 'GET', url: `/api/v1/ledger/balance?fund=${encodeURIComponent(charge.referenceCode)}`,
      headers: auth(token)
    });
    expect(ar.json().balanceBasis).toBe(charge.amountBasis);
  });

  it('quotes, confirms and re-quotes a payment — markStatus single-row semantics on Postgres', async () => {
    // This is the PostgresPaymentRequestStore verification flagged in the
    // handoff: after confirm, a re-quote of the same key must return the paid
    // request (status propagated to the single row), not a fresh quote.
    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      headers: auth(token),
      payload: { rail: 'lightning', refId: 'SMOKE1', unitRef: 'unit-302', amountBasis: 50_000, currency: 'CAD', recipient: LNURL }
    });
    expect(quote.json().ok).toBe(true);
    const ref = quote.json().invoice.referenceCode as string;

    const confirm = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(token),
      payload: { referenceCode: ref }
    });
    expect(confirm.json()).toMatchObject({ ok: true, status: 'paid' });

    const re = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      headers: auth(token),
      payload: { rail: 'lightning', refId: 'SMOKE1', unitRef: 'unit-302', amountBasis: 50_000, currency: 'CAD', recipient: LNURL }
    });
    expect(re.json().created).toBe(false);
    expect(re.json().invoice.status).toBe('paid');

    // The confirmed amount is on the council's AR ledger, hash-chain verified.
    const bal = await app.inject({
      method: 'GET', url: `/api/v1/ledger/balance?fund=${encodeURIComponent(ref)}`,
      headers: auth(token)
    });
    expect(bal.json().balanceBasis).toBe(50_000);
  });

  it('keeps councils isolated on the real adapters', async () => {
    const other = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { councilName: 'E2E Other', email: `e2e-other-${Date.now()}@smoke.test`, password: 'password123' }
    });
    const otherToken = other.json().token as string;

    // Different council: same fund, empty ledger.
    const otherBal = await app.inject({
      method: 'GET', url: '/api/v1/ledger/balance?fund=operating', headers: auth(otherToken)
    });
    expect(otherBal.json().balanceBasis).toBe(0);

    // Cannot confirm the first council's payment.
    const confirm = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(otherToken),
      payload: { referenceCode: 'pay-smoke1-unit302' }
    });
    expect(confirm.json()).toMatchObject({ ok: false, reason: 'unknown referenceCode' });
  });

  it('issues forms and counts meeting votes', async () => {
    const form = await app.inject({
      method: 'POST', url: '/api/v1/forms',
      headers: auth(token),
      payload: { kind: 'B', unitId: '101', requestedAt: '2026-08-25', balanceBasis: 0 }
    });
    expect(form.json().state).toBe('issued');
    expect(form.json().dueDate).toBe('2026-09-01');

    const vote = await app.inject({
      method: 'POST', url: '/api/v1/meetings/vote',
      headers: auth(token),
      payload: { threshold: 'majority', eligible: 10, present: 6, yes: 4, no: 2, abstain: 0 }
    });
    expect(vote.json().passed).toBe(true);
  });
});
