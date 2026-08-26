/**
 * Deadlines helper — the "What's due" task center
 * (`GET /api/v1/deadlines`): statutory calendar (EPR, depreciation, AGM) plus
 * operational items (open payment quotes expiring), sorted soonest-first.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export type DeadlineSeverity = 'urgent' | 'soon' | 'routine';

export interface DeadlineItem {
  id: string;
  kind: string;
  title: string;
  dueAt: string;
  daysLeft: number;
  severity: DeadlineSeverity;
  jurisdiction: string;
}

export async function fetchDeadlines(): Promise<DeadlineItem[]> {
  const res = await apiFetch<{ ok: boolean; asOf: string; items: DeadlineItem[] }>(
    '/api/v1/deadlines',
    { token: getToken() }
  );
  return res.items;
}
