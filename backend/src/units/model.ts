/**
 * Canonical unit / lot master-data model.
 *
 * This is the single source of truth for a strata building's units. Every other
 * module that references a unit — the ledger (AR accounts), rails
 * (payment/quote), billing, enforcement, forms, meetings, reconciliation — must
 * resolve its unit key through `UnitRegistry`, never a free-form string. That
 * is the "one place to change a unit" guarantee: a unit's identity, its ledger
 * account, and its reconciliation aliases all derive from this record.
 *
 * Pure + deterministic + unit-testable (no DB). In production the registry is
 * seeded from the DB `unit` table; the in-memory/seeded workbook keeps tests and
 * the scaffold honest before a real deployment.
 */

/** Occupancy status for a unit (drives Form K, EHT/SVT, AR tracking). */
export type OccupancyStatus = 'occupied' | 'vacant' | 'short-term';

/** Minimum owner identity captured per SPA Form K. Full docs live elsewhere. */
export interface UnitMember {
  owner?: string; // owner name(s) as registered
  occupants: string[]; // occupant names + start dates tracked for Form K
}

export interface UnitRecord {
  /** Stable unique id, e.g. '302'. Must be unique in a building. */
  unitRef: string;
  /** Floor / level for display and building-matrix ordering. */
  floor: number;
  /** Approximate area (sq ft) — presentation only, not authoritative. */
  sqft?: number;
  occupancy: OccupancyStatus;
  tenant?: string | null;
  /** Monthly rent estimate in CAD (dollars) — advisory, not authoritative. */
  rent?: number | null;
  /** Energy / heat / SVT flags used by the unit matrix. */
  eht?: boolean;
  evCharger?: boolean;
  /** SPA Form K on-file state. */
  formK?: 'signed' | 'missing';
  /** Owners + occupants (Form K identity). */
  member?: UnitMember;
}

export interface UnitRegistry {
  /** All units in building order (floor, then unitRef). */
  all(): UnitRecord[];
  /** Look up a unit by its canonical id (normalized match). */
  get(unitRef: string): UnitRecord | null;
  /** Confirm a unit exists (used as an API guard before posting). */
  has(unitRef: string): boolean;
  /** Reconciliation aliases/keys for a unit (drives no-guess matching). */
  refs(unitRef: string): string[];
  /** True when the reference resolves to exactly one unit. */
  isUniqueRef(reference: string): boolean;
}

/**
 * Normalize a unit reference for comparison: lowercase, strip non-alphanumerics,
 * and drop a leading alpha building prefix (e.g. 'U-1120' -> '1120'). Shared by
 * lookup, reconciliation keys, and ledger account derivation so every module
 * agrees on what "302" means.
 */
export function normalizeUnitRef(value: string): string {
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  // Drop a common single-letter building prefix if a numeric tail remains.
  const stripped = clean.replace(/^u/, '');
  return stripped.replace(/[^0-9]/g, '');
}

/**
 * Deterministic per-unit accounts-receivable ledger fund code.
 *
 * `ar:unit-<n>` is the AR account a unit's charges and confirmed payments post
 * to (see billing + payments/confirm). Keeping it derived from the canonical
 * unitRef guarantees billing AR, payment-confirm, and the ledger all address the
 * same account without a secondary table.
 */
export function unitArFundCode(unitRef: string): string {
  const n = normalizeUnitRef(unitRef);
  if (!n) throw new Error(`cannot derive AR fund code from empty unit ref: "${unitRef}"`);
  return `ar:unit-${n}`;
}

/** Deterministic reconciliation reference code for a unit's ledger/payments. */
export function unitReferenceCode(unitRef: string, refId: string): string {
  const n = normalizeUnitRef(unitRef);
  // Keep the refId readable (hyphens preserved) for traceability in ledger +
  // bank references, just normalized to lowercase.
  const suffix = refId.toLowerCase().trim();
  return `unit-${n}-${suffix}`;
}

/** Build a workbook-backed registry from a plain unit list. */
export function createRegistry(units: UnitRecord[]): UnitRegistry {
  // Canonical map by normalized ref; keep first occurrence, reject duplicates.
  const byRef = new Map<string, UnitRecord>();
  for (const u of units) {
    const k = normalizeUnitRef(u.unitRef);
    if (k && !byRef.has(k)) byRef.set(k, u);
  }

  // Per-unit reconciliation keys: canonical ref, numeric tail, any aliases.
  const keySets = new Map<string, Set<string>>();
  for (const [k, u] of byRef) {
    const keys = new Set<string>();
    keys.add(k);
    const num = normalizeUnitRef(u.unitRef);
    if (num && num !== k) keys.add(num);
    // Occupant/owner name hints for full-mode matching.
    for (const name of u.member?.occupants ?? []) {
      const nk = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (nk) keys.add(nk);
    }
    if (u.member?.owner) {
      const nk = u.member.owner.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (nk) keys.add(nk);
    }
    keySets.set(k, keys);
  }

  const sorted = [...byRef.values()].sort(
    (a, b) => a.floor - b.floor || a.unitRef.localeCompare(b.unitRef)
  );

  return {
    all: () => sorted.map((u) => ({ ...u })),
    get: (unitRef) => byRef.get(normalizeUnitRef(unitRef)) ?? null,
    has: (unitRef) => byRef.has(normalizeUnitRef(unitRef)),
    refs: (unitRef) => {
      const k = normalizeUnitRef(unitRef);
      return keySets.get(k) ? [...(keySets.get(k) as Set<string>)] : [];
    },
    isUniqueRef(reference: string): boolean {
      const target = normalizeUnitRef(reference);
      if (!target) return false;
      let hits = 0;
      for (const [, keys] of keySets) {
        for (const key of keys) {
          if (target === key) hits += 1;
        }
      }
      return hits === 1;
    }
  };
}

/** Default demo workbook — mirrors the public frontend unit matrix + the
 * e-transfer reconciliation demo so the whole product shows the same building. */
export function demoUnits(): UnitRecord[] {
  return [
    { unitRef: '101', floor: 1, sqft: 780, occupancy: 'occupied', tenant: 'M. Chen', rent: 2450, eht: true, formK: 'signed', evCharger: false, member: { owner: 'M. Chen', occupants: ['Chen'] } },
    { unitRef: '102', floor: 1, sqft: 820, occupancy: 'occupied', tenant: 'J. Williams', rent: 2580, eht: true, formK: 'signed', evCharger: true, member: { owner: 'J. Williams', occupants: ['Williams'] } },
    { unitRef: '201', floor: 2, sqft: 950, occupancy: 'vacant', tenant: null, rent: 2890, eht: false, formK: 'missing', evCharger: false },
    { unitRef: '202', floor: 2, sqft: 1100, occupancy: 'occupied', tenant: 'A. Patel', rent: 3100, eht: true, formK: 'signed', evCharger: false, member: { owner: 'A. Patel', occupants: ['Patel'] } },
    { unitRef: '301', floor: 3, sqft: 1200, occupancy: 'occupied', tenant: "S. O'Brien", rent: 3350, eht: true, formK: 'signed', evCharger: true, member: { owner: "S. O'Brien", occupants: ["O'Brien"] } },
    { unitRef: '302', floor: 3, sqft: 1450, occupancy: 'short-term', tenant: 'Airbnb', rent: 4200, eht: true, formK: 'signed', evCharger: false }
  ];
}