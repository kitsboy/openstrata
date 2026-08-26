/**
 * Canonical unit/lot registry from the backend (`GET /api/v1/units`).
 *
 * The frontend's own model (`$lib/units.ts`) documents this swap as the
 * intended step: the type is shared, so replacing the in-repo `demoUnits` with
 * the backend response is invisible to consumers. The dashboard tools matrix
 * reads from here when a session is live, and falls back to the demo registry
 * otherwise.
 */

import { apiFetch } from './client';
import { getToken } from './token';
import { normalizeUnitRef } from '$lib/units';
import type { UnitRef } from '$lib/reconcile';

/** Backend wire shape for a unit (see `backend/src/api/server.ts` → GET /units). */
export interface ApiUnit {
  unitRef: string;
  floor: number;
  sqft: number | null;
  occupancy: 'occupied' | 'vacant' | 'short-term';
  tenant: string | null;
  rent: number | null;
  eht: boolean;
  evCharger: boolean;
  formK: 'signed' | 'missing';
  arFundCode: string;
  reconciliationRefs: string[];
}

export async function fetchUnits(): Promise<ApiUnit[]> {
  const res = await apiFetch<{ ok: boolean; units: ApiUnit[] }>('/api/v1/units', {
    token: getToken()
  });
  return res.units;
}

/** One confirmed payment request on a unit's AR account (traceability). */
export interface UnitPayment {
  refId: string;
  referenceCode: string;
  rail: string;
  amountBasis: number;
  status: 'quoted' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;
}

/** `GET /api/v1/units/:unitRef` — unit + its AR account + payments. */
export interface UnitDetail {
  unit: ApiUnit;
  ar: {
    fundCode: string;
    balanceBasis: number;
    entryCount: number;
    headTally: string[];
  };
  payments: UnitPayment[];
}

export async function fetchUnitDetail(unitRef: string): Promise<UnitDetail> {
  const res = await apiFetch<{ ok: boolean } & UnitDetail>(
    `/api/v1/units/${encodeURIComponent(unitRef)}`,
    { token: getToken() }
  );
  return { unit: res.unit, ar: res.ar, payments: res.payments };
}

/** Upsert a unit (`POST /api/v1/units`, treasurer+). */
export async function createUnit(input: {
  unitRef: string;
  floor: number;
  occupancy?: ApiUnit['occupancy'];
  sqft?: number;
  tenant?: string | null;
  rent?: number | null;
}): Promise<ApiUnit> {
  const res = await apiFetch<{ ok: boolean; unit: ApiUnit }>('/api/v1/units', {
    method: 'POST',
    token: getToken(),
    body: input
  });
  return res.unit;
}

/** Remove a unit (`DELETE /api/v1/units/:unitRef`, admin only). */
export async function deleteUnit(unitRef: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/v1/units/${encodeURIComponent(unitRef)}`, {
    method: 'DELETE',
    token: getToken()
  });
}

/**
 * Adapter from the backend wire shape to the reconciliation engine's `UnitRef`
 * (same alias strategy as `$lib/units.ts` → `unitsToUnitRefs`: '302', 'unit 302',
 * 'u302'). The backend registry carries no occupant names yet, so `names` is
 * empty — reference matching still works on the unit numbers alone.
 */
export function apiUnitsToUnitRefs(units: ApiUnit[]): UnitRef[] {
  return units.map((u) => {
    const normalized = normalizeUnitRef(u.unitRef);
    return {
      id: u.unitRef,
      names: [],
      aliases: [u.unitRef, `unit ${normalized}`, `u${normalized}`]
    };
  });
}
