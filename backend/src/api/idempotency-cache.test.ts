import { describe, expect, it, vi } from 'vitest';
import { IdempotencyCache, requestFingerprint } from './idempotency-cache.js';

describe('IdempotencyCache', () => {
  it('replays identical requests and conflicts when the same key has different content', async () => {
    const cache = new IdempotencyCache();
    const request = { fund: 'operating', amountBasis: 1200 };
    const fingerprint = requestFingerprint(request);
    const first = await cache.run('council:key-1', fingerprint, async () => ({ seq: 1 }));
    const replay = await cache.run('council:key-1', fingerprint, async () => ({ seq: 2 }));
    const conflict = await cache.run('council:key-1', requestFingerprint({ ...request, amountBasis: 1 }), async () => ({ seq: 3 }));

    expect(first).toEqual({ status: 'created', value: { seq: 1 } });
    expect(replay).toEqual({ status: 'replayed', value: { seq: 1 } });
    expect(conflict).toEqual({ status: 'conflict' });
  });

  it('fingerprints JSON objects independently of key insertion order', () => {
    expect(requestFingerprint({ fund: 'operating', meta: { b: 2, a: 1 } })).toBe(
      requestFingerprint({ meta: { a: 1, b: 2 }, fund: 'operating' })
    );
  });

  it('coalesces concurrent retries onto one side effect', async () => {
    const cache = new IdempotencyCache();
    const operation = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { seq: 1 };
    });
    const fingerprint = requestFingerprint({ amountBasis: 500 });
    const results = await Promise.all([
      cache.run('council:key-2', fingerprint, operation),
      cache.run('council:key-2', fingerprint, operation),
      cache.run('council:key-2', fingerprint, operation)
    ]);

    expect(operation).toHaveBeenCalledTimes(1);
    expect(results.map((result) => result.status).sort()).toEqual(['created', 'replayed', 'replayed']);
    expect(results.every((result) => result.status === 'created' || result.status === 'replayed' ? result.value.seq === 1 : false)).toBe(true);
  });

  it('releases failed work so a safe retry can run', async () => {
    const cache = new IdempotencyCache();
    await expect(cache.run('council:key-3', 'same', async () => { throw new Error('temporary'); })).rejects.toThrow('temporary');
    await expect(cache.run('council:key-3', 'same', async () => 'recovered')).resolves.toEqual({ status: 'created', value: 'recovered' });
  });

  it('expires completed responses and refuses capacity exhaustion without evicting successful results', async () => {
    let now = 100;
    const cache = new IdempotencyCache(10, 1, () => now);
    await cache.run('council:key-4', 'same', async () => 'old');
    await expect(cache.run('council:key-5', 'same', async () => 'overflow')).resolves.toEqual({ status: 'full' });
    await expect(cache.run('council:key-4', 'same', async () => 'duplicate')).resolves.toEqual({ status: 'replayed', value: 'old' });
    now = 111;
    await expect(cache.run('council:key-5', 'same', async () => 'new')).resolves.toEqual({ status: 'created', value: 'new' });

    now += 11;
    let release!: (value: string) => void;
    let started!: () => void;
    const startSignal = new Promise<void>((resolve) => { started = resolve; });
    const pending = cache.run('council:key-6', 'same', () => new Promise<string>((resolve) => { release = resolve; started(); }));
    await startSignal;
    now += 1;
    await expect(cache.run('council:key-7', 'same', async () => 'overflow')).resolves.toEqual({ status: 'full' });
    release('done');
    await pending;
  });
});
