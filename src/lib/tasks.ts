/**
 * One prioritised list of what needs doing.
 *
 * The dashboard used to answer this question in four separate boxes: a setup
 * checklist, live statutory deadlines, the forms tracker and the month-end
 * close. Each was reasonable on its own and together they were a scavenger hunt
 * — "which box do I look at?" is a question software should not ask.
 *
 * This module merges them into **one ordered list**, where the order is the
 * answer to that question:
 *
 *   1. overdue        — statutory or financial, already late
 *   2. urgent         — inside two weeks
 *   3. soon           — inside about six weeks
 *   4. open           — routine, in the calendar
 *   5. setup          — the onboarding steps, LAST, because real work outranks
 *                       finishing your profile
 *
 * Two rules keep it honest. A deadline inside two weeks is urgent **whatever the
 * API called it**, because the date is the fact and the label is an opinion. And
 * setup steps are never interleaved with real deadlines — a council with an
 * overdue filing should not have to scroll past "add your units" to find it.
 *
 * Pure and label-free: the caller supplies every string (they come from the
 * i18n catalog), so this module can be tested without a translation layer.
 */

import { nextStep, SETUP_STEPS, type SetupStepId } from './setup';

export type TaskUrgency = 'overdue' | 'urgent' | 'soon' | 'open' | 'setup';

export interface TaskDeadline {
  id: string;
  title: string;
  dueAt: string;
  daysLeft: number;
  severity: 'urgent' | 'soon' | 'routine';
}

export interface TaskSetupStep {
  id: SetupStepId;
  title: string;
  hint: string;
  href: string;
}

export interface Task {
  id: string;
  title: string;
  /** A due date, or the setup step's explanation. */
  detail: string;
  href: string;
  urgency: TaskUrgency;
  daysLeft?: number;
  /** Present when this row can be ticked off on the spot. */
  setup?: SetupStepId;
}

export interface TaskInput {
  deadlines?: readonly TaskDeadline[];
  setupSteps?: readonly TaskSetupStep[];
  /** Steps the council has already ticked. */
  setupDone?: readonly SetupStepId[];
  /** Rows to show before the list starts collapsing. Default 6. */
  limit?: number;
}

export const DEFAULT_TASK_LIMIT = 6;

/** Where the list was left: collapsed or open. Local only, like the steps. */
export const TASKS_HIDE_KEY = 'openstrata-tasks-hidden';

const RANK: Record<TaskUrgency, number> = { overdue: 0, urgent: 1, soon: 2, open: 3, setup: 4 };

/** Two weeks is the line between "in the calendar" and "this week's problem". */
const URGENT_DAYS = 14;
/** About six weeks: the point a routine item starts being worth planning for. */
const SOON_DAYS = 45;

/**
 * The urgency of one deadline. The date decides, then the API's severity can
 * only ever make it *more* urgent, never less.
 */
export function urgencyFor(deadline: Pick<TaskDeadline, 'daysLeft' | 'severity'>): TaskUrgency {
  const { daysLeft, severity } = deadline;
  if (!Number.isFinite(daysLeft)) return 'open';
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= URGENT_DAYS || severity === 'urgent') return 'urgent';
  if (daysLeft <= SOON_DAYS || severity === 'soon') return 'soon';
  return 'open';
}

/** Display order for one urgency step. */
export function urgencyRank(urgency: TaskUrgency): number {
  return RANK[urgency] ?? RANK.open;
}

/**
 * Build the ordered list. Stable: within one urgency step, the soonest date
 * wins and ties keep the order they arrived in.
 */
export function buildTaskList({
  deadlines = [],
  setupSteps = [],
  setupDone = [],
  limit = DEFAULT_TASK_LIMIT
}: TaskInput = {}): { tasks: Task[]; more: number; total: number } {
  const rows: Array<{ task: Task; index: number }> = [];

  deadlines.forEach((deadline, index) => {
    rows.push({
      index,
      task: {
        id: deadline.id,
        title: deadline.title,
        detail: deadline.dueAt,
        href: '/tools',
        urgency: urgencyFor(deadline),
        daysLeft: deadline.daysLeft
      }
    });
  });

  // Only what is left to do, in the canonical setup order. A finished setup
  // contributes nothing at all, rather than a row that says "done".
  const outstanding = new Set<SetupStepId>(SETUP_STEPS.filter((step) => !setupDone.includes(step)));
  setupSteps
    .filter((step) => outstanding.has(step.id))
    .forEach((step, index) => {
      rows.push({
        index: deadlines.length + index,
        task: {
          id: `setup-${step.id}`,
          title: step.title,
          detail: step.hint,
          href: step.href,
          urgency: 'setup',
          setup: step.id
        }
      });
    });

  rows.sort((a, b) => {
    const byUrgency = urgencyRank(a.task.urgency) - urgencyRank(b.task.urgency);
    if (byUrgency !== 0) return byUrgency;
    const aDays = a.task.daysLeft ?? Number.POSITIVE_INFINITY;
    const bDays = b.task.daysLeft ?? Number.POSITIVE_INFINITY;
    if (aDays !== bDays) return aDays - bDays;
    return a.index - b.index;
  });

  const capped = limit > 0 ? rows.slice(0, limit) : rows;
  return {
    tasks: capped.map((row) => row.task),
    more: Math.max(0, rows.length - capped.length),
    total: rows.length
  };
}

/** Headline counts — what the panel says before the council reads a single row. */
export function taskCounts(tasks: readonly Task[]): { overdue: number; dueSoon: number; total: number } {
  return {
    overdue: tasks.filter((task) => task.urgency === 'overdue').length,
    dueSoon: tasks.filter((task) => task.urgency === 'urgent' || task.urgency === 'soon').length,
    total: tasks.length
  };
}

/** The one thing to do next, for a greeting or a badge. */
export function firstTask(tasks: readonly Task[]): Task | null {
  return tasks.length ? tasks[0]! : null;
}

/** Honest demo rows for a signed-out visitor: real statutory items, fake dates. */
export const demoTaskDeadlines: TaskDeadline[] = [
  {
    id: 'demo-epr',
    title: 'Energy Performance Report (EPR) filing',
    dueAt: '2026-12-31',
    daysLeft: 127,
    severity: 'soon'
  },
  {
    id: 'demo-agm',
    title: 'Annual General Meeting (within 2 months of fiscal year end)',
    dueAt: '2026-10-31',
    daysLeft: 66,
    severity: 'routine'
  },
  {
    id: 'demo-formb',
    title: 'Form B request — 7-day statutory delivery window',
    dueAt: '2026-09-25',
    daysLeft: 7,
    severity: 'urgent'
  }
];

/** Re-exported so a caller can ask "what is the next setup step?" in one import. */
export { nextStep };
