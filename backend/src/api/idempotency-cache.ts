/**
 * Process-local idempotency cache for single-host writes. It prevents duplicate
 * posts after lost responses and coalesces concurrent retries. Multi-instance
 * deployments should replace this adapter with a durable database-backed store.
 */
import { createHash } from 'node:crypto';

interface CompletedEntry {
  fingerprint: string;
  value: unknown;
  expiresAt: number;
}

interface PendingEntry {
  fingerprint: string;
  promise: Promise<unknown>;
}

export type IdempotencyOutcome<T> =
  | { status: 'created' | 'replayed'; value: T }
  | { status: 'conflict' }
  | { status: 'full' };

export function requestFingerprint(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export class IdempotencyCache {
  private readonly completed = new Map<string, CompletedEntry>();
  private readonly pending = new Map<string, PendingEntry>();

  constructor(
    private readonly ttlMs = 24 * 60 * 60 * 1000,
    private readonly maxEntries = 10_000,
    private readonly now: () => number = Date.now
  ) {}

  async run<T>(key: string, fingerprint: string, operation: () => Promise<T>): Promise<IdempotencyOutcome<T>> {
    this.sweep();
    const complete = this.completed.get(key);
    if (complete) {
      if (complete.fingerprint !== fingerprint) return { status: 'conflict' };
      return { status: 'replayed', value: complete.value as T };
    }

    const active = this.pending.get(key);
    if (active) {
      if (active.fingerprint !== fingerprint) return { status: 'conflict' };
      return { status: 'replayed', value: (await active.promise) as T };
    }

    if (this.maxEntries < 1) return { status: 'full' };
    // Never evict an unexpired result: forgetting a successful write would let
    // a later retry perform the side effect twice. Refuse new keys under load.
    if (this.completed.size + this.pending.size >= this.maxEntries) return { status: 'full' };

    // Defer the operation to a microtask so the pending entry is installed
    // before user work can throw synchronously or re-enter this cache.
    const promise = Promise.resolve().then(operation);
    const pending: PendingEntry = { fingerprint, promise };
    this.pending.set(key, pending);
    try {
      const value = await promise;
      if (this.pending.get(key) === pending) {
        this.pending.delete(key);
        this.completed.set(key, {
          fingerprint,
          value,
          expiresAt: this.now() + this.ttlMs
        });
      }
      return { status: 'created', value };
    } catch (error) {
      if (this.pending.get(key) === pending) this.pending.delete(key);
      throw error;
    }
  }

  private sweep(): void {
    const now = this.now();
    for (const [key, entry] of this.completed) {
      if (entry.expiresAt <= now) this.completed.delete(key);
    }
  }
}
