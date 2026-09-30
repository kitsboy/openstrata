/**
 * Canonical unit / lot master-data model (frontend mirror).
 *
 * The site's unit identity must agree with the backend (`backend/src/units/`):
 * same `unitRef` normalization, same occupancy/Form K semantics, same AR fund
 * code derivation. Anything that lists, looks up, or polymerizes a unit — the
 * dashboard unit matrix, the e-transfer reconciliation widget, the wizard's
 * generated config — reads from these helpers instead of inline literals.
 *
 * A later step replaces the in-repo `demoUnits` with the `GET /api/v1/units`
 * backend response; the type is shared so the swap is invisible.
 */

import type { UnitRef } from './reconcile.js';

export type OccupancyStatus = 'occupied' | 'vacant' | 'short-term';

/** Canonical unit record — one shape for the whole product. */
export interface UnitRecord {
  unitRef: string;
  floor: number;
  sqft?: number;
  occupancy: OccupancyStatus;
  tenant?: string | null;
  rent?: number | null;
  eht?: boolean;
  evCharger?: boolean;
  formK?: 'signed' | 'missing';
  /** Owners + occupants (SPA Form K identity) used by reconciliation keys. */
  member?: { owner?: string; occupants: string[] };
}

/** Normalize a unit reference identically to the backend. */
export function normalizeUnitRef(value: string): string {
  const clean = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const stripped = clean.replace(/^u/, '');
  return stripped.replace(/[^0-9]/g, '');
}

/** Deterministic per-unit accounts-receivable ledger fund code (backend-side). */
export function unitArFundCode(unitRef: string): string {
  const n = normalizeUnitRef(unitRef);
  if (!n) throw new Error(`cannot derive AR fund code from empty unit ref: "${unitRef}"`);
  return `ar:unit-${n}`;
}

/** The canonical demo building (mirrors backend/src/units/seed.ts). */
export const demoUnits: UnitRecord[] = [
  { unitRef: '101', floor: 1, sqft: 780, occupancy: 'occupied', tenant: 'M. Chen', rent: 2450, eht: true, formK: 'signed', evCharger: false, member: { owner: 'M. Chen', occupants: ['Chen'] } },
  { unitRef: '102', floor: 1, sqft: 820, occupancy: 'occupied', tenant: 'J. Williams', rent: 2580, eht: true, formK: 'signed', evCharger: true, member: { owner: 'J. Williams', occupants: ['Williams'] } },
  { unitRef: '201', floor: 2, sqft: 950, occupancy: 'vacant', tenant: null, rent: 2890, eht: false, formK: 'missing', evCharger: false },
  { unitRef: '202', floor: 2, sqft: 1100, occupancy: 'occupied', tenant: 'A. Patel', rent: 3100, eht: true, formK: 'signed', evCharger: false, member: { owner: 'A. Patel', occupants: ['Patel'] } },
  { unitRef: '301', floor: 3, sqft: 1200, occupancy: 'occupied', tenant: "S. O'Brien", rent: 3350, eht: true, formK: 'signed', evCharger: true, member: { owner: "S. O'Brien", occupants: ["O'Brien"] } },
  { unitRef: '302', floor: 3, sqft: 1450, occupancy: 'short-term', tenant: 'Airbnb', rent: 4200, eht: true, formK: 'signed', evCharger: false }
];

/** Look up a unit by normalized ref, or null if absent. */
export function findUnit(units: UnitRecord[], unitRef: string): UnitRecord | null {
  const target = normalizeUnitRef(unitRef);
  return units.find((u) => normalizeUnitRef(u.unitRef) === target) ?? null;
}

/**
 * Adapter to the Phase 2 reconciliation engine's `UnitRef` shape, so the
 * e-transfer widget matches against the canonical building data rather than a
 * parallel hard-coded list. Occupant/owner names become name hints.
 */
export function unitsToUnitRefs(units: UnitRecord[]): UnitRef[] {
  return units.map((u) => ({
    id: u.unitRef,
    names: (u.member?.occupants ?? []).slice(),
    aliases: [u.unitRef, `unit ${normalizeUnitRef(u.unitRef)}`, `u${normalizeUnitRef(u.unitRef)}`]
  }));
}

/** Building-ordered units (floor, then ref) for the unit matrix. */
export function buildingOrder(units: UnitRecord[]): UnitRecord[] {
  return units.slice().sort((a, b) => a.floor - b.floor || a.unitRef.localeCompare(b.unitRef));
}