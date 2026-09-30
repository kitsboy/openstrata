/**
 * Postgres implementation of UnitStore backed by the `unit` table
 * (migration 0005). Tenant-scoped by `community_id` — every read/write is
 * keyed on the council, so unit master data is isolated per council.
 */

import pg from 'pg';
import '../db/int8.js';
import type { OccupancyStatus, UnitMember, UnitRecord } from './model.js';
import { demoUnits } from './model.js';
import type { UnitStore } from './store.js';

interface UnitRow {
  community_id: string;
  unit_ref: string;
  floor: number;
  sqft: number | null;
  occupancy: string;
  tenant: string | null;
  rent: number | null;
  eht: boolean;
  ev_charger: boolean;
  form_k: string;
  owner: string | null;
  occupants: string;
}

export class PostgresUnitStore implements UnitStore {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private toRecord(row: UnitRow): UnitRecord {
    const member: UnitMember = {
      owner: row.owner ?? undefined,
      occupants: parseOccupants(row.occupants)
    };
    return {
      unitRef: row.unit_ref,
      floor: row.floor,
      sqft: row.sqft ?? undefined,
      occupancy: row.occupancy as OccupancyStatus,
      tenant: row.tenant,
      rent: row.rent ?? null,
      eht: row.eht,
      evCharger: row.ev_charger,
      formK: row.form_k as UnitRecord['formK'],
      member
    };
  }

  async list(communityId: string): Promise<UnitRecord[]> {
    const res = await this.pool.query<UnitRow>(
      `SELECT community_id, unit_ref, floor, sqft, occupancy, tenant, rent,
              eht, ev_charger, form_k, owner, occupants
         FROM unit WHERE community_id = $1
        ORDER BY floor, unit_ref`,
      [communityId]
    );
    return res.rows.map((r) => this.toRecord(r));
  }

  async get(communityId: string, unitRef: string): Promise<UnitRecord | null> {
    const res = await this.pool.query<UnitRow>(
      `SELECT community_id, unit_ref, floor, sqft, occupancy, tenant, rent,
              eht, ev_charger, form_k, owner, occupants
         FROM unit WHERE community_id = $1 AND unit_ref = $2`,
      [communityId, unitRef]
    );
    return res.rows[0] ? this.toRecord(res.rows[0]) : null;
  }

  async upsert(communityId: string, unit: UnitRecord): Promise<UnitRecord> {
    const occupants = JSON.stringify(unit.member?.occupants ?? []);
    await this.pool.query(
      `INSERT INTO unit (community_id, unit_ref, floor, sqft, occupancy, tenant,
                         rent, eht, ev_charger, form_k, owner, occupants)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (community_id, unit_ref) DO UPDATE SET
         floor = EXCLUDED.floor,
         sqft = EXCLUDED.sqft,
         occupancy = EXCLUDED.occupancy,
         tenant = EXCLUDED.tenant,
         rent = EXCLUDED.rent,
         eht = EXCLUDED.eht,
         ev_charger = EXCLUDED.ev_charger,
         form_k = EXCLUDED.form_k,
         owner = EXCLUDED.owner,
         occupants = EXCLUDED.occupants,
         updated_at = now()`,
      [
        communityId,
        unit.unitRef,
        unit.floor,
        unit.sqft ?? null,
        unit.occupancy,
        unit.tenant ?? null,
        unit.rent ?? null,
        unit.eht ?? false,
        unit.evCharger ?? false,
        unit.formK ?? 'missing',
        unit.member?.owner ?? null,
        occupants
      ]
    );
    return (await this.get(communityId, unit.unitRef)) as UnitRecord;
  }

  async remove(communityId: string, unitRef: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM unit WHERE community_id = $1 AND unit_ref = $2`,
      [communityId, unitRef]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async seedDefault(communityId: string): Promise<UnitRecord[]> {
    for (const unit of demoUnits()) {
      await this.upsert(communityId, unit);
    }
    return this.list(communityId);
  }
}

function parseOccupants(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
