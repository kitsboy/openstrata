/**
 * The renewals the building is already carrying dates for, on one page.
 *
 * The contracts register names a renewal for every vendor, the insurance record
 * names the appraisal and the policy's term end, and the calendar lists none of
 * them as a renewal — so a council reading the register sees eleven prose lines
 * and no answer to "what falls due next, and what pays for it". This module is
 * that answer, and five rules keep it honest:
 *
 * 1. **The window is twelve months from the statement date.** Both ends count, so
 *    a policy ending on the window's last day is inside it. Anything later is
 *    carried in `later` rather than dropped, because a register that quietly lost
 *    a renewal would be worse than one that printed nothing.
 *
 * 2. **A date that has passed is not a countdown.** It goes to `passed` with the
 *    days since, never to the table as "-5 days". A register nobody updated is a
 *    defect to show, not a negative number to read past.
 *
 * 3. **No date is invented.** A contract that says "month to month", "each fiscal
 *    year" or "open" has no renewal day, so it is listed apart as continuing. A
 *    guessed date is a deadline somebody would miss.
 *
 * 4. **Every row names the account that pays it, or says it names nothing.** The
 *    line is the register's own code, so the renewal and the budget put the same
 *    number on the same page. A row with no code is counted as `unfunded` and
 *    still printed, so the gap is on the paper instead of being filled with a
 *    plausible code.
 *
 * 5. **A step is not a renewal.** The appraisal and the broker's marketing start
 *    are dated work the April renewal depends on; they print in the same year at
 *    their own date, tagged as steps, so a reader cannot mistake one for a
 *    contract that renews.
 *
 * Label-free: the caller supplies the wording that appears on the page.
 */

import { daysBetween } from './arrears';

export type RenewalKind = 'renewal' | 'step';

export interface RenewalItem {
  /** Stable key — the vendor name plus the date, in the demo. */
  id: string;
  vendor: string;
  service: string;
  /** The day it falls due, or null when the register names no day at all. */
  dateIso: string | null;
  kind: RenewalKind;	/** The account code that pays it, or null when the register names none. */
	line: string | null;
}

export interface RenewalRow extends RenewalItem {
  dateIso: string;
  /** Whole days from the statement date. Zero means it falls due that day. */
  daysLeft: number;
}

export interface PassedRenewal extends RenewalItem {
  dateIso: string;
  /** Whole days since the date went by. Always positive. */
  daysAgo: number;
}

export interface RenewalCalendar {
  asOf: string;
  /** The last day inside the window, both ends counted. */
  windowEnd: string;
  windowDays: number;
  /** Dated renewals and steps inside the window, soonest first. */
  rows: RenewalRow[];
  /** Renewals with no day in the register. They are not counted down. */
  continuing: RenewalItem[];
  /** Days that went by before the statement date — a stale register. */
  passed: PassedRenewal[];
  /** Dated items beyond the window, carried rather than dropped. */
  later: RenewalItem[];
  renewals: number;
  steps: number;
  /** Rows that name no account and no fund. */
  unfunded: number;
  next: RenewalRow | null;
}

/** The same calendar day `months` later, clamped to the length of that month. */
function addMonths(day: string, months: number): string {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7)) - 1 + months;
  const date = Number(day.slice(8, 10));
  const target = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(date, lastDay));
  return target.toISOString().slice(0, 10);
}

/**
 * The next twelve months of renewals at `asOf`.
 *
 * The order is the calendar's: soonest first, then the renewal before a step that
 * shares its day, then vendor name, so two runs over the same register produce the
 * same page.
 */
export function renewalCalendar(
  items: readonly RenewalItem[],
  asOf: string,
  months = 12
): RenewalCalendar {
  const windowEnd = addMonths(asOf, months);
  const rows: RenewalRow[] = [];
  const continuing: RenewalItem[] = [];
  const passed: PassedRenewal[] = [];
  const later: RenewalItem[] = [];

  for (const item of items) {
    if (item.dateIso === null) {
      continuing.push(item);
      continue;
    }
    const daysLeft = daysBetween(asOf, item.dateIso);
    if (daysLeft < 0) {
      passed.push({ ...item, dateIso: item.dateIso, daysAgo: -daysLeft });
      continue;
    }
    if (daysLeft > daysBetween(asOf, windowEnd)) {
      later.push(item);
      continue;
    }
    rows.push({
      ...item,
      dateIso: item.dateIso,
      // A renewal due on the statement date is due today, not late.
      daysLeft
    });
  }

  rows.sort(
    (a, b) =>
      a.dateIso.localeCompare(b.dateIso) ||
      (a.kind === b.kind ? 0 : a.kind === 'renewal' ? -1 : 1) ||
      a.vendor.localeCompare(b.vendor)
  );
  passed.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  continuing.sort((a, b) => a.vendor.localeCompare(b.vendor));

  return {
    asOf,
    windowEnd,
    windowDays: daysBetween(asOf, windowEnd),
    rows,
    continuing,
    passed,
    later,
    renewals: rows.filter((row) => row.kind === 'renewal').length,
    steps: rows.filter((row) => row.kind === 'step').length,
    unfunded: rows.filter((row) => row.line === null).length,
    next: rows[0] ?? null
  };
}
