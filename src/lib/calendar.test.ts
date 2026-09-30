import { describe, expect, it } from 'vitest';
import { buildCalendarMonth, windowDaysFor } from './calendar';
import type { TaskDeadline } from './tasks';

const TODAY = new Date('2026-09-20T12:00:00');

const deadline = (over: Partial<TaskDeadline>): TaskDeadline => ({
  id: 't1',
  title: 'Form B request — 7-day statutory delivery window',
  dueAt: '2026-09-25',
  daysLeft: 5,
  severity: 'urgent',
  ...over
});

describe('calendar geometry', () => {
  it('reads the statutory window from the deadline title', () => {
    expect(windowDaysFor('Form B request — 7-day statutory delivery window')).toBe(7);
    expect(windowDaysFor('AGM notice — 14 day window')).toBe(14);
    expect(windowDaysFor('No window mentioned here')).toBe(0);
  });

  it('builds a 42-cell Sunday-first grid', () => {
    const cells = buildCalendarMonth([], 2026, 8, TODAY); // September 2026
    expect(cells.length).toBe(42);
    expect(cells[0].weekday).toBe(0); // every first cell is a Sunday
    // September 1 2026 is a Tuesday.
    const first = cells.find((c) => c.iso === '2026-09-01');
    expect(first?.weekday).toBe(2);
    expect(first?.inMonth).toBe(true);
  });

  it('marks due dates, windows, today and overdue', () => {
    const cells = buildCalendarMonth(
      [
        deadline({}), // due Sep 25, 7-day window shades Sep 18–25
        deadline({ id: 't2', title: 'Plain deadline', dueAt: '2026-09-15', daysLeft: -5 })
      ],
      2026,
      8,
      TODAY
    );
    const due = cells.find((c) => c.iso === '2026-09-25');
    expect(due?.items.length).toBe(1);
    expect(due?.inWindow).toBe(true);

    const windowStart = cells.find((c) => c.iso === '2026-09-18');
    expect(windowStart?.inWindow).toBe(true);
    const outside = cells.find((c) => c.iso === '2026-09-10');
    expect(outside?.inWindow).toBe(false);

    const today = cells.find((c) => c.iso === '2026-09-20');
    expect(today?.isToday).toBe(true);

    const past = cells.find((c) => c.iso === '2026-09-15');
    expect(past?.hasOverdue).toBe(true);
    expect(past?.items.length).toBe(1);
  });

  it('pads neighbouring months so weeks stay whole', () => {
    const cells = buildCalendarMonth([], 2026, 8, TODAY);
    const leading = cells.filter((c) => !c.inMonth && c.iso < '2026-09-01');
    const trailing = cells.filter((c) => !c.inMonth && c.iso > '2026-09-30');
    expect(leading.length).toBeGreaterThan(0);
    expect(trailing.length).toBeGreaterThan(0);
    expect(leading.every((c) => c.items.length === 0)).toBe(true);
  });
});
