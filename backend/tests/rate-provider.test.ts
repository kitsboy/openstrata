import { describe, expect, it, vi, afterEach } from 'vitest';
import { LiveRateProvider } from '../src/rails/rate-provider.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { MemLedgerStore } from './memstore.js';

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.CAD_PER_BTC;
});

describe('LiveRateProvider', () => {
  function stubFeed(payload: unknown, status = 200) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify(payload), {
          status,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
  }

  it('returns the CAD rate from the mempool.space payload shape', async () => {
    stubFeed({ CAD: 123456.78, USD: 90000.5 });
    const provider = new LiveRateProvider();
    expect(await provider.cadPerBtc()).toBe(123456.78);
  });

  it('accepts a Coinbase-style nested amount', async () => {
    stubFeed({ data: { base: 'BTC', currency: 'CAD', amount: '88000.25' } });
    const provider = new LiveRateProvider();
    expect(await provider.cadPerBtc()).toBe(88000.25);
  });

  it('caches the fetched rate within the TTL (single upstream call)', async () => {
    stubFeed({ CAD: 50000 });
    const provider = new LiveRateProvider({ cacheMs: 60_000 });
    await provider.cadPerBtc();
    await provider.cadPerBtc();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to the env/static rate when the feed is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    process.env.CAD_PER_BTC = '47000';
    const provider = new LiveRateProvider();
    expect(await provider.cadPerBtc()).toBe(47000);
  });

  it('falls back to null when neither the feed nor env provide a rate', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    const provider = new LiveRateProvider();
    expect(await provider.cadPerBtc()).toBeNull();
  });

  it('treats a malformed payload as a feed failure (fallback)', async () => {
    stubFeed({ nope: true });
    const provider = new LiveRateProvider({ fallbackRate: 48000 });
    expect(await provider.cadPerBtc()).toBe(48000);
  });
});

describe('LedgerEngine.series', () => {
  it('rolls income and expenses up by calendar month, zero-filling gaps', async () => {
    const engine = new LedgerEngine(new MemLedgerStore());
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();

    await engine.post('c1', 'operating', 10_000, 'credit', { type: 'fee', postedAt: lastMonth });
    await engine.post('c1', 'operating', -3_000, 'debit', { type: 'repair', postedAt: lastMonth });
    await engine.post('c1', 'operating', 12_000, 'credit', { type: 'fee' }); // this month

    const points = await engine.series('c1', 'operating', 3);
    expect(points).toHaveLength(3);
    const last = points[points.length - 1];
    expect(last.month).toBe(thisMonth);
    expect(last.incomeBasis).toBe(12_000);
    expect(last.expenseBasis).toBe(0);

    const prev = points[points.length - 2];
    expect(prev.month).toBe(lastMonth.slice(0, 7));
    expect(prev.incomeBasis).toBe(10_000);
    expect(prev.expenseBasis).toBe(3_000);
    expect(prev.netBasis).toBe(7_000);

    // Earliest point has no activity → zeros.
    expect(points[0].incomeBasis).toBe(0);
  });

  it('returns zero-filled months for a fund with no account yet', async () => {
    const engine = new LedgerEngine(new MemLedgerStore());
    const points = await engine.series('c1', 'crf', 4);
    expect(points).toHaveLength(4);
    expect(points.every((p) => p.incomeBasis === 0 && p.expenseBasis === 0)).toBe(true);
  });
});
