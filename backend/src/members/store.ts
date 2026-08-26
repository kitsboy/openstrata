/**
 * Tenant-scoped member registry store.
 *
 * Mirrors the unit store tenancy boundary: a member row is always addressed as
 * (communityId, …), so the same email can exist in two councils without
 * colliding. Members resolve unitRefs through the canonical unit registry so
 * the workspace never shows a unit that does not exist.
 */

import type { MemberInput, MemberRecord } from './model.js';

export interface MemberStore {
  /** All members for a council, newest first. */
  list(communityId: string): Promise<MemberRecord[]>;
  /** Members for one unit, newest first. */
  listByUnit(communityId: string, unitRef: string): Promise<MemberRecord[]>;
  /** Look up one member row by id (scoped). */
  get(communityId: string, id: number): Promise<MemberRecord | null>;
  /** Insert or update by (communityId, email); returns the stored row. */
  upsert(communityId: string, input: MemberInput): Promise<MemberRecord>;
  /** Remove a member row; true when a row was deleted. */
  remove(communityId: string, id: number): Promise<boolean>;
  /** Seed a fresh council's members from the unit registry owner/occupant data. */
  seedDefault(communityId: string, units: Array<{ unitRef: string; owner?: string }>): Promise<MemberRecord[]>;
}
