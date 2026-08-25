import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore } from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund; funds must not be co-mingled.'
  }
];

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer(
    {
      ledger: new LedgerEngine(new MemLedgerStore()),
      rosa: keywordRetriever(corpus),
      reconcile,
      config: { crfMandatoryPct: 10, vectorCollection: 'bc_spa_rta_crt' }
    },
    { logger: false }
  );
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('fastify API', () => {
  it('GET /health', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().service).toBe('openstrata-backend');
  });

  it('POST /api/v1/ledger/post then GET ledger/balance', async () => {
    const post = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      payload: {
        community: 'demo',
        fund: 'operating',
        amountBasis: 4200,
        kind: 'credit',
        type: 'strata_fee',
        referenceCode: 'unit-101',
        reconRef: 'ET-100'
      }
    });
    expect(post.statusCode).toBe(200);
    expect(post.json().posted).toBe(true);

    const bal = await app.inject({
      method: 'GET',
      url: '/api/v1/ledger/balance?community=demo&fund=operating'
    });
    expect(bal.statusCode).toBe(200);
    expect(bal.json().balanceBasis).toBe(4200);
  });

  it('POST /api/v1/treasury/authorize hard-blocks a CRF breach', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/authorize',
      payload: {
        balances: { crf: 500_000 },
        spend: { amountBasis: 100_000, fundCode: 'crf', poRef: 'PO-200', category: 'roofing' }
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ allow: false, blocked: 'crf-floor' });
  });

  it('POST /api/v1/rosa/query returns a citation-scoped answer', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rosa/query',
      payload: { question: 'What is the reserve fund percentage?' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.cited).toContain('SPA s.92-96');
    expect(body.uncertain).toBe(false);
  });

  it('POST /api/v1/rosa/query fails closed for an unrelated question', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rosa/query',
      payload: { question: 'average rainfall omaha' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().cited).toHaveLength(0);
    expect(res.json().uncertain).toBe(true);
  });

  it('POST /api/v1/treasury/reconcile auto-posts a unique unit reference', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/reconcile',
      payload: {
        reference: 'Unit 302 May',
        units: [
          { unitId: '101', refs: ['101', 'unit101', 'chen'] },
          { unitId: '302', refs: ['302', 'unit302', 'chen'] }
        ]
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'auto', unitId: '302' });
  });
});