/**
 * Member registry helpers — the owner/occupant layer over units
 * (`GET|POST /api/v1/members`, `DELETE /api/v1/members/:id`). Powers the member
 * workspace: who owns/occupies each lot, linked to the unit's AR + payments.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export type MemberRoleLabel = 'owner' | 'tenant' | 'both';

export interface MemberWire {
  id: number;
  email: string;
  displayName: string;
  phone: string | null;
  unitRef: string;
  roleLabel: MemberRoleLabel;
  createdAt: string;
}

export async function fetchMembers(): Promise<MemberWire[]> {
  const res = await apiFetch<{ ok: boolean; members: MemberWire[] }>('/api/v1/members', {
    token: getToken()
  });
  return res.members;
}

export async function fetchMembersByUnit(unitRef: string): Promise<MemberWire[]> {
  const res = await apiFetch<{ ok: boolean; members: MemberWire[] }>(
    `/api/v1/members/unit?unitRef=${encodeURIComponent(unitRef)}`,
    { token: getToken() }
  );
  return res.members;
}

export async function createMember(input: {
  email: string;
  displayName?: string;
  phone?: string | null;
  unitRef: string;
  roleLabel?: MemberRoleLabel;
}): Promise<MemberWire> {
  const res = await apiFetch<{ ok: boolean; member: MemberWire }>('/api/v1/members', {
    method: 'POST',
    body: input,
    token: getToken()
  });
  return res.member;
}

export async function deleteMember(id: number): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/v1/members/${id}`, { method: 'DELETE', token: getToken() });
}
