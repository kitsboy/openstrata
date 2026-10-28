/**
 * The next 30 days, read from the one calendar the rest of the app uses.
 *
 * The dashboard, `/calendar` and `/tax` all describe the same dated items, and
 * the three used to describe them in different words: a strip on the accounting
 * page, a month grid on the calendar, and prose deadlines inside the tax
 * sections. This module is the shared answer — one window, one sort, one
 * definition of "today" — so a strip cannot claim something is due when the
 * calendar says otherwise.
 *
 * **Today is the sample date, not the machine clock.** Every figure in the demo
 * is Evergreen House at September 30, 2026, and `/calendar` already says so in
 * its own lede. Reading `new Date()` here would make the strip drift away from
 * the books the moment the wall clock moved past the sample — the entries on
 * page would be "due today" against a September balance sheet. When a real
 * council's data arrives from the API, the caller passes its own date.
 */

import { events, type CalCategory, type CalEvent } from './demo/schedule';

/** The demo building's "today". Mirrored by `/calendar`'s lede and the close panel. */
export const NEXT30_TODAY = '2026-09-30';

/** Inclusive window: today through 30 days out. */
export const NEXT30_DAYS = 30;

export type Next30Bucket = 'today' | 'week' | 'later';

export interface Next30Item extends CalEvent {
  /** Whole days from `today` to `date`. 0 is today. */
  daysLeft: number;
  bucket: Next30Bucket;
}

const DAY_MS = 86_400_000;

/** Whole days between two `YYYY-MM-DD` dates, counted in UTC so DST cannot shift it. */
export function daysBetween(from: string, to: string): number {
  const parse = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((parse(to) - parse(from)) / DAY_MS);
}

/** Today is its own bucket; the rest of the week is 1–7; the remainder is 8–30. */
export function bucketFor(daysLeft: number): Next30Bucket {
  if (daysLeft <= 0) return 'today';
  return daysLeft <= 7 ? 'week' : 'later';
}

export interface Next30Options {
  today?: string;
  /** Narrows the window to these calendar categories. */
  categories?: CalCategory[];
  /** Cap the whole window, applied after sorting. */
  limit?: number;
}

/**
 * Dated items from `today` through `today + 30`, sorted by date. Items that have
 * already passed are excluded rather than shown as overdue: this is a forward
 * look, and `/calendar` is where history lives.
 */
export function next30(options: Next30Options = {}): Next30Item[] {
  const today = options.today ?? NEXT30_TODAY;
  const wanted = options.categories ? new Set(options.categories) : null;
  const items = events
    .filter((event) => (wanted ? wanted.has(event.category) : true))
    .map((event) => {
      const daysLeft = daysBetween(today, event.date);
      return { ...event, daysLeft, bucket: bucketFor(daysLeft) };
    })
    .filter((item) => item.daysLeft >= 0 && item.daysLeft <= NEXT30_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  return options.limit ? items.slice(0, options.limit) : items;
}

/** Split a window into its three buckets, preserving the order they arrived in. */
export function next30Buckets(items: Next30Item[]): Record<Next30Bucket, Next30Item[]> {
  return {
    today: items.filter((item) => item.bucket === 'today'),
    week: items.filter((item) => item.bucket === 'week'),
    later: items.filter((item) => item.bucket === 'later')
  };
}

/** The categories that belong on the tax page: filings, remittances and compliance dates. */
export const TAX_CATEGORIES: CalCategory[] = ['cra', 'payroll', 'compliance'];
