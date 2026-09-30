import { describe, expect, it } from 'vitest';
import type { SetupStepId } from './setup';
import {
  DEFAULT_TASK_LIMIT,
  buildTaskList,
  firstTask,
  taskCounts,
  urgencyFor,
  type TaskDeadline,
  type TaskSetupStep
} from './tasks';

const deadline = (over: Partial<TaskDeadline> = {}): TaskDeadline => ({
  id: 'd',
  title: 'A filing',
  dueAt: '2026-10-01',
  daysLeft: 30,
  severity: 'routine',
  ...over
});

const steps: TaskSetupStep[] = [
  { id: 'units', title: 'Add your units', hint: 'so fees track', href: '/tools' },
  { id: 'funds', title: 'Open the two funds', hint: 'trust rules', href: '/tools/wizard' },
  { id: 'bylaws', title: 'Load your bylaws', hint: 'basis for enforcement', href: '/templates' },
  { id: 'month', title: 'Close a month', hint: 'bill and reconcile', href: '/tools' }
];

describe('urgencyFor', () => {
  it('puts a passed date first, whatever the API called it', () => {
    expect(urgencyFor({ daysLeft: -1, severity: 'routine' })).toBe('overdue');
    expect(urgencyFor({ daysLeft: -40, severity: 'soon' })).toBe('overdue');
  });

  it('treats two weeks as urgent regardless of the label', () => {
    expect(urgencyFor({ daysLeft: 7, severity: 'routine' })).toBe('urgent');
    expect(urgencyFor({ daysLeft: 14, severity: 'routine' })).toBe('urgent');
    expect(urgencyFor({ daysLeft: 15, severity: 'urgent' })).toBe('urgent');
  });

  it('then soon, then open', () => {
    expect(urgencyFor({ daysLeft: 20, severity: 'routine' })).toBe('soon');
    expect(urgencyFor({ daysLeft: 45, severity: 'routine' })).toBe('soon');
    expect(urgencyFor({ daysLeft: 400, severity: 'routine' })).toBe('open');
  });

  it('never lets a missing number become a panic', () => {
    expect(urgencyFor({ daysLeft: Number.NaN, severity: 'urgent' })).toBe('open');
  });
});

describe('buildTaskList', () => {
  it('orders by urgency and then by the soonest date', () => {
    const { tasks } = buildTaskList({
      deadlines: [
        deadline({ id: 'later', daysLeft: 90 }),
        deadline({ id: 'late', daysLeft: -3 }),
        deadline({ id: 'soon', daysLeft: 20 }),
        deadline({ id: 'thisWeek', daysLeft: 5 })
      ]
    });
    expect(tasks.map((task) => task.id)).toEqual(['late', 'thisWeek', 'soon', 'later']);
  });

  it('keeps ties in the order they arrived', () => {
    const { tasks } = buildTaskList({
      deadlines: [deadline({ id: 'first', daysLeft: 3 }), deadline({ id: 'second', daysLeft: 3 })]
    });
    expect(tasks.map((task) => task.id)).toEqual(['first', 'second']);
  });

  it('puts real work before onboarding, always', () => {
    const { tasks } = buildTaskList({
      deadlines: [deadline({ id: 'routine', daysLeft: 200 })],
      setupSteps: steps
    });
    expect(tasks[0]!.id).toBe('routine');
    expect(tasks.slice(1).every((task) => task.urgency === 'setup')).toBe(true);
  });

  it('only lists the setup steps that are left', () => {
    const done: SetupStepId[] = ['units', 'funds'];
    const { tasks } = buildTaskList({ setupSteps: steps, setupDone: done });
    expect(tasks.map((task) => task.id)).toEqual(['setup-bylaws', 'setup-month']);
    expect(tasks.every((task) => task.setup)).toBe(true);
  });

  it('contributes nothing at all once the setup is finished', () => {
    const { tasks, total } = buildTaskList({
      setupSteps: steps,
      setupDone: ['units', 'funds', 'bylaws', 'month']
    });
    expect(tasks).toEqual([]);
    expect(total).toBe(0);
  });

  it('caps the list and says how many are hidden', () => {
    const many = Array.from({ length: 9 }, (_, i) => deadline({ id: `d${i}`, daysLeft: i }));
    const { tasks, more, total } = buildTaskList({ deadlines: many });
    expect(tasks).toHaveLength(DEFAULT_TASK_LIMIT);
    expect(total).toBe(9);
    expect(more).toBe(3);
  });

  it('can be asked for everything', () => {
    const many = Array.from({ length: 9 }, (_, i) => deadline({ id: `d${i}`, daysLeft: i }));
    const { tasks, more } = buildTaskList({ deadlines: many, limit: 0 });
    expect(tasks).toHaveLength(9);
    expect(more).toBe(0);
  });

  it('is empty, not broken, with nothing to show', () => {
    const { tasks, more, total } = buildTaskList();
    expect(tasks).toEqual([]);
    expect(more).toBe(0);
    expect(total).toBe(0);
  });

  it('carries the due date through as the row detail', () => {
    const { tasks } = buildTaskList({ deadlines: [deadline({ dueAt: '2026-11-30' })] });
    expect(tasks[0]!.detail).toBe('2026-11-30');
  });

  it('routes deadlines and setup rows somewhere real', () => {
    const { tasks } = buildTaskList({ deadlines: [deadline()], setupSteps: steps.slice(0, 1) });
    for (const task of tasks) expect(task.href.startsWith('/')).toBe(true);
  });
});

describe('taskCounts', () => {
  it('counts what is late and what is close', () => {
    const { tasks } = buildTaskList({
      deadlines: [
        deadline({ id: 'late', daysLeft: -2 }),
        deadline({ id: 'thisWeek', daysLeft: 6 }),
        deadline({ id: 'soon', daysLeft: 30 }),
        deadline({ id: 'later', daysLeft: 300 })
      ]
    });
    expect(taskCounts(tasks)).toEqual({ overdue: 1, dueSoon: 2, total: 4 });
  });

  it('reports the first task, or nothing', () => {
    const { tasks } = buildTaskList({ deadlines: [deadline({ id: 'only', daysLeft: -1 })] });
    expect(firstTask(tasks)?.id).toBe('only');
    expect(firstTask([])).toBeNull();
  });
});
