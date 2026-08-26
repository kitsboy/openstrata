/**
 * Tenant-scoped unit master-data store.
 *
 * Each council (tenant) owns its own building. A unit is always addressed as
 * (communityId, unitRef), so the same unitRef can exist in two councils without
 * colliding — this is the tenancy boundary for unit data. The `UnitRegistry`
 * in model.ts stays as the in-memory/indexing view over a unit list; stores
 * here produce those lists per council.
 */

import type { UnitRecord } from './model.js';

export interface UnitStore {
  /** All units for a council, in building order (floor, then unitRef). */
  list(communityId: string): Promise<UnitRecord[]>;
  /** Look up one unit by canonical ref. */
  get(communityId: string, unitRef: string): Promise<UnitRecord | null>;
  /** Insert or replace a unit (same (communityId, unitRef) key). */
  upsert(communityId: string, unit: UnitRecord): Promise<UnitRecord>;
  /** Remove a unit; returns true when a row was deleted. */
  remove(communityId: string, unitRef: string): Promise<boolean>;
  /** Seed a fresh council with the standard demo building. */
  seedDefault(communityId: string): Promise<UnitRecord[]>;
}
