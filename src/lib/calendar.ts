/**
 * Statutory deadline calendar — a month grid of what's due.
 *
 * The dashboard's "Upcoming" list made a council do date math in their head:
 * "the Form B window is 7 days, requested on the 18th, so…". A calendar shows
 * that at a glance — the due date as a marked day, the statutory window shaded
 * across the days leading to it, overdue items in red.
 *
 * Pure and label-free: the caller supplies the deadlines (live from
 * `/api/v1/deadlines` when signed in, the honest demo set otherwise) and this
 * module answers geometry questions. Window lengths are read from the
 * deadline's own title ("7-day statutory delivery window" → 7 days), so the
 * calendar stays data-driven — a new statutory item shades its window by
 * saying so, not by editing this file.
 */

import type { TaskDeadline } from './tasks';

export interface CalendarDay {
  /** ISO date, 'YYYY-MM-DD'. */
  iso: string;
  dayOfMonth: number;
  /** 0 = Sunday … 6 = Saturday (North American week). */
  weekday: number;
  inMonth: boolean;
  isToday: boolean;
  /** Deadlines due on this day. */
  items: TaskDeadline[];
  /** Inside a statutory window that closes on a due date. */
  inWindow: boolean;
  /** At least one item due here is already past due. */
  hasOverdue: boolean;
}

/** Read a statutory window length from the deadline's own wording. */
export function windowDaysFor(title: string): number {
  const match = /(\d+)\s*-?\s*day/i.exec(title);
  return match ? Number(match[1]) : 0;
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Build a 6×7 (42-cell) Sunday-first grid covering `monthIndex0`.
 * Leading and trailing cells belong to neighbouring months so every week is
 * whole — the layout stays stable across months.
 */
export function buildCalendarMonth(
  deadlines: readonly TaskDeadline[],
  year: number,
  monthIndex0: number,
  today: Date = new Date()
): CalendarDay[] {
  const byDate = new Map<string, TaskDeadline[]>();
  for (const item of deadlines) {
    const key = item.dueAt.slice(0, 10);
    const list = byDate.get(key);
    if (list) list.push(item);
    else byDate.set(key, [item]);
  }

  const firstOfWeek = new Date(year, monthIndex0, 1).getDay();
  const start = new Date(year, monthIndex0, 1 - firstOfWeek);
  const todayIso = isoDate(today);

  const cells: CalendarDay[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = isoDate(day);
    const items = byDate.get(iso) ?? [];

    const inWindow = deadlines.some((item) => {
      const windowDays = windowDaysFor(item.title);
      if (!windowDays) return false;
      const due = new Date(`${item.dueAt.slice(0, 10)}T00:00:00`);
      const windowStart = new Date(due);
      windowStart.setDate(due.getDate() - windowDays);
      return day >= windowStart && day <= due;
    });

    cells.push({
      iso,
      dayOfMonth: day.getDate(),
      weekday: day.getDay(),
      inMonth: day.getMonth() === monthIndex0,
      isToday: iso === todayIso,
      items,
      inWindow,
      hasOverdue: items.some((item) => item.dueAt.slice(0, 10) < todayIso)
    });
  }
  return cells;
}
