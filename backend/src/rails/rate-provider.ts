/**
 * Live CAD/BTC rate provider (item #7 — replaces the static/env fallback seam).
 *
 * Fetches the spot price from mempool.space's public `/api/v1/prices` endpoint
 * (which the site's CSP already allows), caches it for a short TTL, and falls
 * back to the env `CAD_PER_BTC` value when the feed is unreachable so quoting
 * never hard-fails. The endpoint is overridable for operators who run their own
 * feed.
 *
 * Production wiring: pass `resolver: new LiveRateProvider()` into `buildServer`.
 * Tests can inject a `fetch` stub or a fixed `fallbackRate`.
 */

import type { RateProvider } from './rails.js';

export interface LiveRateOptions {
  /** Rate feed URL returning `{ CAD: number }` (mempool.space format). */
  endpoint?: string;
  /** How long a fetched rate is reused, in ms. */
  cacheMs?: number;
  /** Abort the fetch after this many ms. */
  timeoutMs?: number;
  /** Fallback when the feed is down — typically from env CAD_PER_BTC. */
  fallbackRate?: number;
}

const DEFAULT_ENDPOINT = 'https://mempool.space/api/v1/prices';
const DEFAULT_CACHE_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 4000;

export class LiveRateProvider implements RateProvider {
  private cache: { at: number; value: number | null } = { at: 0, value: null };
  private readonly fallback: number | null;

  constructor(private readonly options: LiveRateOptions = {}) {
    const fromEnv = Number(process.env.CAD_PER_BTC);
    const fallback =
      this.options.fallbackRate ?? (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : null);
    this.fallback = fallback;
  }

  async cadPerBtc(): Promise<number | null> {
    const { endpoint = DEFAULT_ENDPOINT, cacheMs = DEFAULT_CACHE_MS, timeoutMs = DEFAULT_TIMEOUT_MS } =
      this.options;

    if (this.cache.value !== null && Date.now() - this.cache.at < cacheMs) {
      return this.cache.value;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let res: Response;
      try {
        res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { accept: 'application/json' }
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) throw new Error(`rate feed responded ${res.status}`);
      const json = (await res.json()) as { CAD?: unknown; data?: { amount?: unknown } };
      // mempool.space: { CAD, USD, ... }; Coinbase spot: { data: { amount } }
      const raw = json?.CAD ?? json?.data?.amount;
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) throw new Error('unexpected rate payload');
      this.cache = { at: Date.now(), value };
      return value;
    } catch {
      // Feed down, slow, or malformed → fall back to the static/env rate.
      return this.fallback;
    }
  }
}
