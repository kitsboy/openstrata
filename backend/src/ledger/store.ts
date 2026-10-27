/**
 * Postgres implementation of LedgerStore. The only file that knows the adapter
 * surface; everything upstream talks to `LedgerStore`.
 *
 * Concurrency: `post` is atomic — it computes `seq = MAX(seq)+1` for the
 * account inside the same INSERT transaction via a subquery, so two concurrent
 * posts cannot collide on `seq` (the `(account_id, seq)` unique constraint is
 * the backstop). Reads are plain SELECTs.
 */

import pg from 'pg';
import '../db/int8.js';
import type { AtomicPostInput, IdempotentPostInput, IdempotentPostResult, LedgerStore, AccountId } from './ledger.js';
import { assertTransferRequiresResolution, assertValidAmount, nextTally } from './model.js';
import type { LedgerEntryRow } from './model.js';

export class PostgresLedgerStore implements LedgerStore {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private rowToAccount(row: {
    id: number;
    community_id: string;
    fund_code: string;
    currency: string;
  }): AccountId {
    return {
      id: row.id,
      groupId: row.community_id,
      fundCode: row.fund_code,
      currency: row.currency
    };
  }

  private rowToEntry(row: Record<string, any>): LedgerEntryRow {
    return {
      accountId: row.account_id,
      seq: row.seq,
      amountBasis: row.amount_basis,
      kind: row.kind,
      type: row.type,
      description: row.description,
      referenceCode: row.reference_code,
      reconRef: row.recon_ref ?? undefined,
      resolutionId: row.resolution_id ?? undefined,
      transferSeq: row.transfer_seq ?? undefined,
      prevTally: row.prev_tally,
      tallyRoot: row.tally_root,
      postedAt: new Date(row.posted_at).toISOString()
    };
  }

  async getAccountByFund(groupId: string, fundCode: string): Promise<AccountId | null> {
    const res = await this.pool.query(
      `SELECT a.id, g.community_id, a.fund_code, g.currency
         FROM account a
         JOIN account_group g ON g.id = a.group_id
        WHERE g.community_id = $1 AND a.fund_code = $2`,
      [groupId, fundCode]
    );
    return res.rows[0] ? this.rowToAccount(res.rows[0]) : null;
  }

  async createAccount(
    groupId: string,
    fundCode: string,
    label: string,
    currency = 'CAD'
  ): Promise<AccountId> {
    // Upsert the owning group first (idempotent across runs / concurrent calls).
    const g = await this.pool.query<{ id: number }>(
      `INSERT INTO account_group (community_id, name, currency)
       VALUES ($1, $2, $3)
       ON CONFLICT (community_id, name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [groupId, groupId, currency]
    );
    const a = await this.pool.query<{ id: number }>(
      `INSERT INTO account (group_id, fund_code, label)
       VALUES ($1, $2, $3)
       ON CONFLICT (group_id, fund_code) DO UPDATE SET label = EXCLUDED.label
       RETURNING id`,
      [g.rows[0].id, fundCode, label]
    );
    return { id: a.rows[0].id, groupId, fundCode, currency };
  }

  private async appendInTransaction(client: pg.PoolClient, input: AtomicPostInput): Promise<LedgerEntryRow> {
    const group = await client.query<{ id: number }>(
      `INSERT INTO account_group (community_id, name, currency)
       VALUES ($1, $1, 'CAD')
       ON CONFLICT (community_id, name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [input.groupId]
    );
    const account = await client.query<{ id: number }>(
      `INSERT INTO account (group_id, fund_code, label)
       VALUES ($1, $2, $2)
       ON CONFLICT (group_id, fund_code) DO UPDATE SET label = EXCLUDED.label
       RETURNING id`,
      [group.rows[0].id, input.fundCode]
    );
    // Serialize all appends to this ledger chain, including the first entry.
    await client.query('SELECT id FROM account WHERE id = $1 FOR UPDATE', [account.rows[0].id]);
    const previous = await client.query<{ seq: number; tally_root: string }>(
      `SELECT seq, tally_root FROM ledger_entry WHERE account_id = $1 ORDER BY seq DESC LIMIT 1`,
      [account.rows[0].id]
    );
    const seq = (previous.rows[0]?.seq ?? 0) + 1;
    const prevTally = previous.rows[0]?.tally_root ?? '';
    const postedAt = input.options.postedAt ?? new Date().toISOString();
    const tallyRoot = nextTally(prevTally, {
      accountId: account.rows[0].id,
      amountBasis: input.amountBasis,
      postedAt,
      resolutionId: input.options.resolutionId,
      transferSeq: input.options.transferSeq
    });
    const inserted = await client.query<Record<string, any>>(
      `INSERT INTO ledger_entry
         (account_id, seq, amount_basis, kind, type, description, reference_code,
          recon_ref, resolution_id, transfer_seq, prev_tally, tally_root, posted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [account.rows[0].id, seq, input.amountBasis, input.kind, input.options.type ?? '',
        input.options.description ?? '', input.options.referenceCode ?? '', input.options.reconRef ?? null,
        input.options.resolutionId ?? null, input.options.transferSeq ?? null, prevTally, tallyRoot, postedAt]
    );
    return this.rowToEntry(inserted.rows[0]);
  }

  /** Append under an account-row lock so sequence allocation and chain append are atomic. */
  async postAtomic(input: AtomicPostInput): Promise<LedgerEntryRow> {
    assertValidAmount(input.amountBasis, input.kind);
    assertTransferRequiresResolution(input.options.transferSeq, input.options.resolutionId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const entry = await this.appendInTransaction(client, input);
      await client.query('COMMIT');
      return entry;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Atomically claim an idempotency key and append its ledger entry in one
   * Postgres transaction. Advisory locks serialize retries of the same key.
   */
  async postIdempotent(input: IdempotentPostInput): Promise<IdempotentPostResult> {
    if (!/^[A-Za-z0-9._:-]{1,128}$/.test(input.idempotencyKey)) throw new Error('invalid idempotency key');
    assertValidAmount(input.amountBasis, input.kind);
    assertTransferRequiresResolution(input.options.transferSeq, input.options.resolutionId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`${input.groupId.length}:${input.groupId}:${input.idempotencyKey}`]);
      if (!Number.isSafeInteger(input.ttlMs) || input.ttlMs <= 0 || input.ttlMs > 120 * 24 * 60 * 60 * 1000) {
        throw new Error('idempotency TTL must be in the range 1ms..120 days');
      }
      if (!/^[a-f0-9]{64}$/.test(input.fingerprint)) throw new Error('idempotency fingerprint must be a lowercase SHA-256 digest');
      await client.query(
        'DELETE FROM ledger_idempotency WHERE community_id = $1 AND idempotency_key = $2 AND expires_at <= now()',
        [input.groupId, input.idempotencyKey]
      );
      const prior = await client.query<{ fingerprint: string; entry: Record<string, any> }>(
        `SELECT i.fingerprint,
                jsonb_build_object(
                  'account_id', e.account_id, 'seq', e.seq, 'amount_basis', e.amount_basis,
                  'kind', e.kind, 'type', e.type, 'description', e.description,
                  'reference_code', e.reference_code, 'recon_ref', e.recon_ref,
                  'resolution_id', e.resolution_id, 'transfer_seq', e.transfer_seq,
                  'prev_tally', e.prev_tally, 'tally_root', e.tally_root,
                  'posted_at', e.posted_at
                ) AS entry
           FROM ledger_idempotency i JOIN ledger_entry e ON e.id = i.ledger_entry_id
          WHERE i.community_id = $1 AND i.idempotency_key = $2
            AND i.expires_at > now()`,
        [input.groupId, input.idempotencyKey]
      );
      if (prior.rows[0]) {
        await client.query('COMMIT');
        if (prior.rows[0].fingerprint !== input.fingerprint) return { status: 'conflict' };
        return { status: 'replayed', entry: this.rowToEntry(prior.rows[0].entry) };
      }
      const entry = await this.appendInTransaction(client, input);
      await client.query(
        `INSERT INTO ledger_idempotency (community_id, idempotency_key, fingerprint, ledger_entry_id, expires_at)
         VALUES ($1,$2,$3,
           (SELECT id FROM ledger_entry WHERE account_id = $4 AND seq = $6),
           now() + ($5::bigint * interval '1 millisecond'))`,
        [input.groupId, input.idempotencyKey, input.fingerprint, entry.accountId, input.ttlMs, entry.seq]
      );
      await client.query('COMMIT');
      return { status: 'created', entry };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Atomic legacy sequence helper, retained for adapter compatibility.
   */
  async nextSeq(accountId: number): Promise<number> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      try {
        await client.query('LOCK TABLE ledger_entry IN SHARE ROW EXCLUSIVE MODE');
        const res = await client.query<{ s: number }, [number]>(
          `SELECT COALESCE(MAX(seq), 0) + 1 AS s FROM ledger_entry WHERE account_id = $1`,
          [accountId]
        );
        await client.query('COMMIT');
        return res.rows[0].s;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    } finally {
      client.release();
    }
  }

  async insert(entry: LedgerEntryRow): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO ledger_entry
           (account_id, seq, amount_basis, kind, type, description,
            reference_code, recon_ref, resolution_id, transfer_seq,
            prev_tally, tally_root, posted_at)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          entry.accountId,
          entry.seq,
          entry.amountBasis,
          entry.kind,
          entry.type,
          entry.description,
          entry.referenceCode,
          entry.reconRef ?? null,
          entry.resolutionId ?? null,
          entry.transferSeq ?? null,
          entry.prevTally,
          entry.tallyRoot,
          entry.postedAt
        ]
      );
    } finally {
      client.release();
    }
  }

  async listEntries(accountId: number): Promise<LedgerEntryRow[]> {
    const res = await this.pool.query<Record<string, any>>(
      `SELECT * FROM ledger_entry WHERE account_id = $1 ORDER BY seq`,
      [accountId]
    );
    return res.rows.map((r) => this.rowToEntry(r));
  }

  /**
   * List all entries, optionally limited to matched accounts (used by `diff`).
   * Filtering happens at query time via the account/account_group join.
   */
  async listAll(accountFilter?: (a: AccountId) => boolean): Promise<LedgerEntryRow[]> {
    // Compute a whitelist of account ids that pass the filter (small in practice).
    let allowed: number[] | null = null;
    if (accountFilter) {
      const res = await this.pool.query(
        `SELECT a.id, g.community_id AS group_id, a.fund_code, g.currency
           FROM account a JOIN account_group g ON g.id = a.group_id`
      );
      allowed = res.rows
        .map((r: any) => this.rowToAccount(r))
        .filter(accountFilter)
        .map((a) => a.id);
    }

    const params: unknown[] = [];
    let where = '';
    if (allowed !== null) {
      where = ` WHERE account_id = ANY($1::bigint[])`;
      // Vitest/Node: pass a JS array; pg serializes to bigint[].
      params.push(allowed.length ? allowed : [-1]);
    }
    const res = await this.pool.query<Record<string, any>>(
      `SELECT * FROM ledger_entry${where} ORDER BY seq`,
      params
    );
    return res.rows.map((r) => this.rowToEntry(r));
  }
}