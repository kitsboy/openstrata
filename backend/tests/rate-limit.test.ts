import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { RateLimiter } from '../src/auth/rate-limit.js';
import { buildServer } from '../src/api/server.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

const AUTH_SECRET = 'rate-limit-test-secret';

describe('RateLimiter', () => {
  it('allows attempts up to the ceiling, then limits', () => {
    const limiter = new RateLimiter({ max: 3, windowMs: 60_000 });
    expect(limiter.isLimited('a')).toBe(false);
    limiter.record('a');
    limiter.record('a');
    limiter.record('a');
    expect(limiter.isLimited('a')).toBe(true);
    expect(limiter.retryAfterSeconds('a')).toBeGreaterThan(0);
  });

  it('treats keys independently', () => {
    const limiter = new RateLimiter({ max: 1, windowMs: 60_000 });
    limiter.record('x');
    expect(limiter.isLimited('x')).toBe(true);
    expect(limiter.isLimited('y')).toBe(false);
  });

  it('clear() resets the window (success clears a key)', () => {
    const limiter = new RateLimiter({ max: 2, windowMs: 60_000 });
    limiter.record('a');
    limiter.record('a');
    expect(limiter.isLimited('a')).toBe(true);
    limiter.clear('a');
    expect(limiter.isLimited('a')).toBe(false);
    expect(limiter.retryAfterSeconds('a')).toBe(0);
  });

  it('expires the window over time', async () => {
    const limiter = new RateLimiter({ max: 1, windowMs: 20 });
    limiter.record('a');
    expect(limiter.isLimited('a')).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(limiter.isLimited('a')).toBe(false);
  });

  it('does not grow the bucket map with expired keys', async () => {
    const limiter = new RateLimiter({ max: 1, windowMs: 10 });
    limiter.record('gone');
    await new Promise((resolve) => setTimeout(resolve, 20));
    limiter.record('fresh'); // sweep happens on record
    expect((limiter as unknown as { buckets: Map<string, unknown> }).buckets.size).toBe(1);
  });
});

async function buildThrottleApp(): Promise<FastifyInstance> {
  const instance = await buildServer(
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
        // Small ceiling so the test can trip the throttle quickly.
        authRateLimitMax: 3,
        authRateLimitWindowMs: 60_000
      }
    },
    { logger: false }
  );
  await instance.ready();
  return instance;
}

describe('auth throttle (integration)', () => {
  it('returns 401 for bad credentials up to the ceiling, then 429 with retry-after', async () => {
    const app = await buildThrottleApp();
    try {
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { councilName: 'Throttle Test', email: 'owner@throttle.test', password: 'password123' }
      });

      const attempt = () =>
        app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: { email: 'owner@throttle.test', password: 'wrong-password' }
        });

      for (let i = 0; i < 3; i++) {
        const res = await attempt();
        expect(res.statusCode).toBe(401);
      }
      const blocked = await attempt();
      expect(blocked.statusCode).toBe(429);
      expect(blocked.headers['retry-after']).toBeDefined();
      const body = blocked.json();
      expect(body.reason).toContain('too many login attempts');
      expect(body.retryAfter).toBeGreaterThan(0);
    } finally {
      await app.close();
    }
  });

  it('a successful login is never blocked by its own success', async () => {
    // Fresh instance so the IP window is clean: one failure, then a correct
    // password must still succeed (success clears the email bucket).
    const app = await buildThrottleApp();
    try {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { councilName: 'Throttle Two', email: 'second@throttle.test', password: 'password123' }
      });
      expect(res.statusCode).toBe(200);

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'second@throttle.test', password: 'nope' }
      });
      const ok = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'second@throttle.test', password: 'password123' }
      });
      expect(ok.statusCode).toBe(200);
    } finally {
      await app.close();
    }
  });
});
