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
