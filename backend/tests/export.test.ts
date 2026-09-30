import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const AUTH_SECRET = 'export-test-secret';
const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

describe('export + evidence endpoints', () => {
  let app: FastifyInstance;
  let token: string;
  let unitId = '101';

  beforeAll(async () => {
    app = await buildServer(
      {
        ledger: new LedgerEngine(new MemLedgerStore()),
        rosa: keywordRetriever(corpus),
        reconcile,
        payments: new MemPaymentRequestStore(),
        auth: new MemAuthStore(),
        units: DEFAULT_UNITS,
        config: {
          crfMandatoryPct: 10,
          vectorCollection: 'bc_spa_rta_crt',
          rails: { fiat: { enabled: true } },
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

    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'Export Test', email: 'export@test.dev', password: 'password123' }
    });
    expect(reg.statusCode).toBe(200);
    token = reg.json().token as string;

    // Seed some ledger activity so the export has content.
    await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: { authorization: `Bearer ${token}` },
      payload: { fund: 'operating', amountBasis: 4200, kind: 'credit', type: 'strata_fee' }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: { authorization: `Bearer ${token}` },
      payload: { fund: `ar:unit-${unitId}`, amountBasis: 4200, kind: 'credit', type: 'strata_fee' }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/export/portable returns the portable bundle', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/export/portable',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.format).toBe('openstrata-portable/v1');
    expect(body.council.name).toBe('Export Test');
    expect(body.accounts.operating.balanceBasis).toBe(4200);
    expect(body.units.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/compliance/crt-export returns a print-ready HTML chain bundle', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/compliance/crt-export?fund=operating',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    const html = res.body as string;
    expect(html).toContain('CRT Evidence Bundle');
    expect(html).toContain('Hash chain verified');
    expect(html).toContain('+$42.00'); // current-month income from the rollup
  });

  it('GET /api/v1/forms/f/:unitId is WITHHELD while the unit owes a balance', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/forms/f/${unitId}`,
      headers: { authorization: `Bearer ${token}` }
    });
    expect(res.statusCode).toBe(200);
    const html = res.body as string;
    expect(html).toContain('Form F');
    expect(html).toContain('WITHHELD');
  });

  it('GET /api/v1/forms/b/:unitId renders a Form B with the 7-day deadline', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/forms/b/${unitId}`,
      headers: { authorization: `Bearer ${token}` }
    });
    expect(res.statusCode).toBe(200);
    const html = res.body as string;
    expect(html).toContain('Form B');
    expect(html).toContain('Due');
    expect(html).toContain('Balance');
  });

  it('all export endpoints require auth', async () => {
    for (const url of ['/api/v1/export/portable', '/api/v1/compliance/crt-export', `/api/v1/forms/b/${unitId}`]) {
      const res = await app.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });
});
