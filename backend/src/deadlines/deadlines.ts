/**
 * Statutory + operational deadline calendar for a council.
 *
 * Pure + deterministic: given a reference date and jurisdiction, computes the
 * fixed statutory dates every BC strata must track (EPR filing, depreciation
 * report, AGM window, Form B delivery). The API layer augments these with
 * operational deadlines (open payment quotes expiring, unit AR arrears) so the
 * "What's due" task center shows one honest list.
 */

export type DeadlineSeverity = 'urgent' | 'soon' | 'routine';

export interface StatutoryDeadline {
  id: string;
  kind: string; // 'epr' | 'depreciation' | 'agm' | 'form_b' | ...
  title: string;
  dueAt: string; // ISO date (YYYY-MM-DD)
  severity: DeadlineSeverity;
  jurisdiction: string;
}

export interface DeadlineItem extends StatutoryDeadline {
  daysLeft: number; // from the reference date
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const MS = 86_400_000;
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / MS);
}

function severityFor(daysLeft: number): DeadlineSeverity {
  if (daysLeft < 0) return 'urgent';
  if (daysLeft <= 14) return 'urgent';
  if (daysLeft <= 45) return 'soon';
  return 'routine';
}

/**
 * BC statutory calendar (canonical per docs/BC-STRATA-COMPLIANCE.md):
 *  - EPR disclosure: Dec 31 of the current year (Energy Performance Report).
 *  - Depreciation report: every 3 years (renewal required by the SPA).
 *  - AGM: within 2 months of fiscal year end.
 *  - Form B delivery: within 7 days of request (surfaced per-request, not here).
 *  - Annual information: strata corporation must hold an AGM each year.
 */
export function statutoryDeadlines(
  reference: Date,
  jurisdiction = 'BC',
  fiscalYearEndMonth = 8 // default Aug 31 FYE (BC common)
): StatutoryDeadline[] {
  const year = reference.getFullYear();
  const out: StatutoryDeadline[] = [];

  // EPR — Dec 31 of the current year.
  out.push({
    id: 'epr',
    kind: 'epr',
    title: 'Energy Performance Report (EPR) filing',
    dueAt: `${year}-12-31`,
    severity: 'routine',
    jurisdiction
  });

  // Depreciation report — renew every 3 years; track from the reference year.
  const depDue = new Date(Date.UTC(year + (year % 3 === 0 ? 0 : 3 - (year % 3)), 11, 31));
  out.push({
    id: 'depreciation',
    kind: 'depreciation',
    title: 'Depreciation report renewal',
    dueAt: iso(depDue),
    severity: 'routine',
    jurisdiction
  });

  // AGM — within 2 months after fiscal year end (each year).
  const agmDue = new Date(Date.UTC(year, fiscalYearEndMonth - 1, 31));
  agmDue.setUTCMonth(agmDue.getUTCMonth() + 2);
  out.push({
    id: 'agm',
    kind: 'agm',
    title: 'Annual General Meeting (within 2 months of fiscal year end)',
    dueAt: iso(agmDue),
    severity: 'routine',
    jurisdiction
  });

  return out.map((d) => ({ ...d, severity: severityFor(daysBetween(iso(reference), d.dueAt)) }));
}

/** Sort deadline items soonest-first, urgent severity first. */
export function sortDeadlines(items: DeadlineItem[]): DeadlineItem[] {
  const rank = { urgent: 0, soon: 1, routine: 2 } as const;
  return items.slice().sort(
    (a, b) => rank[a.severity] - rank[b.severity] || a.daysLeft - b.daysLeft
  );
}

export function withDaysLeft(
  items: StatutoryDeadline[],
  reference: Date
): DeadlineItem[] {
  return items.map((d) => ({ ...d, daysLeft: daysBetween(iso(reference), d.dueAt) }));
}
