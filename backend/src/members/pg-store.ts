/**
 * Postgres implementation of MemberStore backed by the `council_member` table
 * (migration 0006). Tenant-scoped by `community_id` like the unit store.
 */

import pg from 'pg';
import '../db/int8.js';
import type { MemberInput, MemberRecord, MemberRoleLabel } from './model.js';
import { normalizeEmail } from './model.js';
import type { MemberStore } from './store.js';

interface MemberRow {
  id: number;
  community_id: string;
  email: string;
  display_name: string;
  phone: string | null;
  unit_ref: string;
  role_label: string;
  created_at: string;
}

export class PostgresMemberStore implements MemberStore {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private toRecord(row: MemberRow): MemberRecord {
    return {
      id: row.id,
      communityId: row.community_id,
      email: row.email,
      displayName: row.display_name,
      phone: row.phone,
      unitRef: row.unit_ref,
      roleLabel: row.role_label as MemberRoleLabel,
      createdAt: row.created_at
    };
  }

  async list(communityId: string): Promise<MemberRecord[]> {
    const res = await this.pool.query<MemberRow>(
      `SELECT id, community_id, email, display_name, phone, unit_ref, role_label, created_at
         FROM council_member WHERE community_id = $1
        ORDER BY created_at DESC`,
      [communityId]
    );
    return res.rows.map((r) => this.toRecord(r));
  }

  async listByUnit(communityId: string, unitRef: string): Promise<MemberRecord[]> {
    const res = await this.pool.query<MemberRow>(
      `SELECT id, community_id, email, display_name, phone, unit_ref, role_label, created_at
         FROM council_member WHERE community_id = $1 AND unit_ref = $2
        ORDER BY created_at DESC`,
      [communityId, unitRef]
    );
    return res.rows.map((r) => this.toRecord(r));
  }

  async get(communityId: string, id: number): Promise<MemberRecord | null> {
    const res = await this.pool.query<MemberRow>(
      `SELECT id, community_id, email, display_name, phone, unit_ref, role_label, created_at
         FROM council_member WHERE community_id = $1 AND id = $2`,
      [communityId, id]
    );
    return res.rows[0] ? this.toRecord(res.rows[0]) : null;
  }

  async upsert(communityId: string, input: MemberInput): Promise<MemberRecord> {
    const email = normalizeEmail(input.email);
    const res = await this.pool.query<MemberRow>(
      `INSERT INTO council_member (community_id, email, display_name, phone, unit_ref, role_label)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (community_id, email) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         phone = EXCLUDED.phone,
         unit_ref = EXCLUDED.unit_ref,
         role_label = EXCLUDED.role_label,
         updated_at = now()
       RETURNING id, community_id, email, display_name, phone, unit_ref, role_label, created_at`,
      [
        communityId,
        email,
        (input.displayName ?? '').trim() || email.split('@')[0]!,
        input.phone ?? null,
        input.unitRef,
        input.roleLabel ?? 'owner'
      ]
    );
    return this.toRecord(res.rows[0]!);
  }

  async remove(communityId: string, id: number): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM council_member WHERE community_id = $1 AND id = $2`,
      [communityId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async seedDefault(
    communityId: string,
    units: Array<{ unitRef: string; owner?: string }>
  ): Promise<MemberRecord[]> {
    const out: MemberRecord[] = [];
    for (const u of units) {
      if (!u.owner) continue;
      const email = `${u.owner.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`;
      out.push(
        await this.upsert(communityId, {
          email,
          displayName: u.owner,
          unitRef: u.unitRef,
          roleLabel: 'owner'
        })
      );
    }
    return out;
  }
}
