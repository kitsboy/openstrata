/**
 * Zero-dependency fixed-window rate limiter for the auth endpoints.
 *
 * Before public exposure the auth surface needs throttling (open signup +
 * password login are brute-force targets). This is a per-process in-memory
 * limiter — correct for the single-host Tailscale deployment. If the API ever
 * runs multi-instance, swap this for a Postgres-backed window (same interface).
 *
 * The limiter counts *failed* attempts: `isLimited` checks the window without
 * consuming it, and `record` is called only after an authentication failure (or
 * a registration attempt). Successful logins clear the email's bucket, so a
 * legitimate user is never locked out by their own success.
 */

export interface RateLimitConfig {
  /** Max recorded failures per key per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  max: 10,
  windowMs: 15 * 60 * 1000 // 15 minutes
};

interface Bucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly max: number;
  private readonly windowMs: number;

  constructor(config: RateLimitConfig = DEFAULT_RATE_LIMIT) {
    this.max = config.max;
    this.windowMs = config.windowMs;
  }

  /** True when `key` has hit the failure ceiling for the current window. */
  isLimited(key: string): boolean {
    this.sweep();
    const bucket = this.buckets.get(key);
    return !!bucket && bucket.count >= this.max && Date.now() < bucket.resetAt;
  }

  /** Record one failure for `key` (no-op once already limited). */
  record(key: string): void {
    this.sweep();
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }
    if (bucket.count < this.max) bucket.count += 1;
  }

  /** Clear a key's window (e.g. after a successful login). */
  clear(key: string): void {
    this.buckets.delete(key);
  }

  /** Seconds until `key` is allowed again (0 when not limited). */
  retryAfterSeconds(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.count < this.max) return 0;
    return Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
  }

  /** Drop expired buckets so the map can't grow without bound. */
  private sweep(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (now >= bucket.resetAt) this.buckets.delete(key);
    }
  }
}
