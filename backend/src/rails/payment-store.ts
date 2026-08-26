/**
 * Postgres implementation of PaymentRequestStore backed by the
 * `payment_request` table (migration 0003). Keeps rail quotes durable and
 * idempotent across restarts.
 */

import pg from 'pg';
import '../db/int8.js';
import type {
  PaymentRequest,
  PaymentRequestStatus,
  PaymentRequestStore,
  Rail
} from './payment-request.js';

interface Row {
  ref_id: string;
  unit_ref: string;
  community_id: string;
  rail: string;
  reference_code: string;
  amount_basis: number;
  currency: string;
  recipient: string;
  invoice: string;
  fiat_locked_basis: number;
  amount_sat: number;
  expires_at: string | null;
  status: string;
  created_at: string;
}

export class PostgresPaymentRequestStore implements PaymentRequestStore {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private toRow(row: Row): PaymentRequest {
    return {
      refId: row.ref_id,
      unitRef: row.unit_ref,
      communityId: row.community_id,
      rail: row.rail as Rail,
      referenceCode: row.reference_code,
      amountBasis: row.amount_basis,
      currency: row.currency,
      recipient: row.recipient,
      invoice: row.invoice,
      fiatLockedBasis: row.fiat_locked_basis,
      amountSat: row.amount_sat,
      expiresAt: row.expires_at ?? undefined,
      status: row.status as PaymentRequestStatus,
      createdAt: row.created_at
    };
  }

  async getByKey(
    communityId: string,
    refId: string,
    unitRef: string,
    rail: Rail
  ): Promise<PaymentRequest | null> {
    const res = await this.pool.query(
      `SELECT * FROM payment_request
        WHERE community_id = $1 AND ref_id = $2 AND unit_ref = $3 AND rail = $4`,
      [communityId, refId, unitRef, rail]
    );
    return res.rows[0] ? this.toRow(res.rows[0]) : null;
  }

  async findByReference(communityId: string, referenceCode: string): Promise<PaymentRequest | null> {
    const res = await this.pool.query(
      `SELECT * FROM payment_request WHERE community_id = $1 AND reference_code = $2`,
      [communityId, referenceCode]
    );
    return res.rows[0] ? this.toRow(res.rows[0]) : null;
  }

  async save(req: PaymentRequest): Promise<void> {
    await this.pool.query(
      `INSERT INTO payment_request
         (ref_id, unit_ref, community_id, rail, reference_code, amount_basis,
          currency, recipient, invoice, fiat_locked_basis, amount_sat, expires_at, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (community_id, ref_id, unit_ref, rail) DO NOTHING`,
      [
        req.refId,
        req.unitRef,
        req.communityId,
        req.rail,
        req.referenceCode,
        req.amountBasis,
        req.currency,
        req.recipient,
        req.invoice,
        req.fiatLockedBasis,
        req.amountSat,
        req.expiresAt ?? null,
        req.status
      ]
    );
  }

  async markStatus(
    communityId: string,
    referenceCode: string,
    status: PaymentRequestStatus
  ): Promise<void> {
    await this.pool.query(
      `UPDATE payment_request SET status = $3, updated_at = now()
        WHERE community_id = $1 AND reference_code = $2`,
      [communityId, referenceCode, status]
    );
  }

  async listByUnit(communityId: string, unitRef: string): Promise<PaymentRequest[]> {
    const res = await this.pool.query<Row>(
      `SELECT * FROM payment_request
        WHERE community_id = $1 AND unit_ref = $2 ORDER BY created_at DESC`,
      [communityId, unitRef]
    );
    return res.rows.map((r) => this.toRow(r));
  }
}