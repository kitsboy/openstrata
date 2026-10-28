import { describe, expect, it } from 'vitest';
import { events } from './demo/schedule';
import {
  NEXT30_DAYS,
  NEXT30_TODAY,
  TAX_CATEGORIES,
  bucketFor,
  daysBetween,
  next30,
  next30Buckets
} from './next30';

describe('daysBetween', () => {
  it('counts whole days and crosses a month boundary', () => {
    expect(daysBetween('2026-09-30', '2026-09-30')).toBe(0);
    expect(daysBetween('2026-09-30', '2026-10-01')).toBe(1);
    expect(daysBetween('2026-09-30', '2026-10-30')).toBe(30);
    expect(daysBetween('2026-09-30', '2026-09-29')).toBe(-1);
  });

  it('does not lose or gain a day across a DST change', () => {
    // November 1, 2026 is the fall-back Sunday in BC; a naive local-time
    // subtraction returns 31.958 days and rounds to the wrong bucket.
    expect(daysBetween('2026-10-25', '2026-11-08')).toBe(14);
    expect(daysBetween('2026-03-01', '2026-03-15')).toBe(14);
  });
});

describe('bucketFor', () => {
  it('puts today in its own bucket, then the rest of the week, then the month', () => {
    expect(bucketFor(0)).toBe('today');
    expect(bucketFor(-3)).toBe('today');
    expect(bucketFor(1)).toBe('week');
    expect(bucketFor(7)).toBe('week');
    expect(bucketFor(8)).toBe('later');
    expect(bucketFor(30)).toBe('later');
  });
});

describe('next30', () => {
  it('starts at the sample today and never runs past 30 days', () => {
    const items = next30();
    expect(items[0].date).toBe(NEXT30_TODAY);
    expect(items.every((item) => item.daysLeft >= 0 && item.daysLeft <= NEXT30_DAYS)).toBe(true);
    // The window ends on the last business day of October, not beyond it.
    expect(items.at(-1)?.date).toBe('2026-10-30');
  });

  it('is sorted by date, and every item is a real calendar entry', () => {
    const items = next30();
    const dates = items.map((item) => item.date);
    expect(dates).toEqual([...dates].sort());
    const known = new Set(events.map((event) => `${event.date}|${event.title}`));
    for (const item of items) expect(known.has(`${item.date}|${item.title}`)).toBe(true);
  });

  it('keeps the two returns due today in the today bucket', () => {
    const items = next30();
    const titles = next30Buckets(items).today.map((item) => item.title);
    expect(titles).toContain('T2 and T1044 due');
    // The bucket split is exhaustive: every item lands in exactly one bucket.
    const buckets = next30Buckets(items);
    expect(buckets.today.length + buckets.week.length + buckets.later.length).toBe(items.length);
  });

  it('narrows to the tax page categories without inventing dates', () => {
    const items = next30({ categories: TAX_CATEGORIES });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => TAX_CATEGORIES.includes(item.category))).toBe(true);
    expect(items.map((item) => item.title)).toContain('Payroll remittance checkpoint');
    expect(items.some((item) => item.title === 'Fire inspection')).toBe(false);
  });

  it('moves with the date it is given instead of the machine clock', () => {
    const later = next30({ today: '2026-10-16' });
    expect(later[0].date).toBe('2026-10-20');
    expect(later.every((item) => item.daysLeft >= 0 && item.daysLeft <= 30)).toBe(true);
    expect(later.some((item) => item.title === 'T2 and T1044 due')).toBe(false);
  });

  it('applies the limit after sorting', () => {
    const items = next30({ limit: 3 });
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.date)).toEqual(next30().slice(0, 3).map((item) => item.date));
  });
});
