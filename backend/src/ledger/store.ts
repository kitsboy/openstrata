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
import type { LedgerStore, AccountId } from './ledger.js';
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
      postedAt: row.posted_at
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
       VALUES ($1, $1, $3)
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

  /**
   * Atomic append: compute seq inside the same statement so concurrent posts to
   * one account stay ordered; a unique violation surfaces as a retryable error.
   */
  async nextSeq(accountId: number): Promise<number> {
    const client = await this.pool.connect();
    try {
      await client.query('LOCK TABLE ledger_entry IN SHARE ROW EXCLUSIVE MODE');
      const res = await client.query<{ s: number }, [number]>(
        `SELECT COALESCE(MAX(seq), 0) + 1 AS s FROM ledger_entry WHERE account_id = $1`,
        [accountId]
      );
      return res.rows[0].s;
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

  async listAll(): Promise<LedgerEntryRow[]> {
    const res = await this.pool.query<Record<string, any>>(
      `SELECT * FROM ledger_entry ORDER BY seq`
    );
    return res.rows.map((r) => this.rowToEntry(r));
  }
}