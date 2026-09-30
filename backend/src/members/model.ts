/**
 * Member registry domain model — the owner/occupant layer over units.
 *
 * A member is a person linked to a unit (lot) of a council's building. This is
 * the "who" behind the unit->payment->form traceability spine: a unit detail
 * shows the ledger + payment requests, and the member workspace ties both to
 * the people who own and occupy the lot (SPA Form K identity).
 */

export type MemberRoleLabel = 'owner' | 'tenant' | 'both';

export interface MemberRecord {
  /** Stable row id (numeric, serial). */
  id: number;
  /** Tenant scope — the council that owns this row. */
  communityId: string;
  email: string;
  displayName: string;
  phone?: string | null;
  /** Canonical unitRef the member is linked to (e.g. '302'). */
  unitRef: string;
  roleLabel: MemberRoleLabel;
  createdAt: string;
}

export interface MemberInput {
  email: string;
  displayName?: string;
  phone?: string | null;
  unitRef: string;
  roleLabel?: MemberRoleLabel;
}

export function toMemberWire(m: MemberRecord) {
  return {
    id: m.id,
    email: m.email,
    displayName: m.displayName,
    phone: m.phone ?? null,
    unitRef: m.unitRef,
    roleLabel: m.roleLabel,
    createdAt: m.createdAt
  };
}

/** Normalize an email for storage (lowercase, trimmed). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
