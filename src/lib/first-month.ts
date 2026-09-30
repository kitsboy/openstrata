/**
 * First-month walkthrough — the guided tour of a council's first billing cycle.
 *
 * The setup checklist (`./setup.ts`) gets a workspace *created*. This is the
 * next milestone: the first month actually *run* — fees billed, an owner paid,
 * the payment reconciled, the month closed. That loop is the moment a demo
 * becomes a product, so it deserves its own guided path with honest demo data
 * a person can reset and re-run.
 *
 * Five steps, in the order a treasurer actually does them:
 *
 *   1. bill       — run the monthly billing cycle (CheckoutFlow / MonthlyClose)
 *   2. collect    — take one owner's payment (the quote → receipt loop)
 *   3. reconcile  — match an inbound e-transfer to its unit (ETransferReconciler)
 *   4. review     — read the deadline calendar and the health score
 *   5. close      — run the month-end close and see the ledger verify
 *
 * Progress is local-only (localStorage, no account, no server call) — the same
 * posture as the setup checklist, the wizard draft and the search pins: the
 * workspace is the record of truth; this is a nudge with a reset button.
 */

export const FIRST_MONTH_KEY = 'openstrata-first-month-done';
export const FIRST_MONTH_HIDE_KEY = 'openstrata-first-month-hidden';

export type FirstMonthStepId = 'bill' | 'collect' | 'reconcile' | 'review' | 'close';

export const FIRST_MONTH_STEPS: readonly FirstMonthStepId[] = [
  'bill',
  'collect',
  'reconcile',
  'review',
  'close'
];

export type FirstMonthProgress = {
  /** Steps the user has ticked, in canonical order. */
  done: FirstMonthStepId[];
  /** Whether the panel has been dismissed. */
  hidden: boolean;
};

export const EMPTY_FIRST_MONTH: FirstMonthProgress = { done: [], hidden: false };

function isStepId(value: unknown): value is FirstMonthStepId {
  return typeof value === 'string' && (FIRST_MONTH_STEPS as readonly string[]).includes(value);
}

/**
 * Parse persisted progress. Anything malformed, partial or hostile degrades to
 * "nothing done, not hidden" rather than throwing — a corrupt localStorage
 * entry must never break the dashboard it is decorating.
 */
export function parseFirstMonth(raw: string | null | undefined): FirstMonthProgress {
  if (!raw) return { ...EMPTY_FIRST_MONTH };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...EMPTY_FIRST_MONTH };
  }
  if (!parsed || typeof parsed !== 'object') return { ...EMPTY_FIRST_MONTH };
  const record = parsed as Record<string, unknown>;
  const done = Array.isArray(record.done)
    ? FIRST_MONTH_STEPS.filter((step) => (record.done as unknown[]).some((value) => value === step))
    : [];
  return { done, hidden: record.hidden === true };
}

/** Serialize progress for storage. Kept here so read and write cannot drift. */
export function serializeFirstMonth(progress: FirstMonthProgress): string {
  return JSON.stringify({ done: progress.done, hidden: progress.hidden });
}

/** Tick or untick a step, keeping the canonical order and never duplicating. */
export function toggleFirstMonthStep(
  done: readonly FirstMonthStepId[],
  step: FirstMonthStepId
): FirstMonthStepId[] {
  const next = done.includes(step)
    ? done.filter((candidate) => candidate !== step)
    : [...done, step];
  return FIRST_MONTH_STEPS.filter((candidate) => next.includes(candidate));
}

/**
 * The next thing to do: the first unticked step, or `null` when the month is
 * closed and the walkthrough is complete.
 */
export function nextFirstMonthStep(done: readonly FirstMonthStepId[]): FirstMonthStepId | null {
  return FIRST_MONTH_STEPS.find((step) => !done.includes(step)) ?? null;
}

/** Fraction complete, 0..1 — drives the progress meter. */
export function firstMonthFraction(done: readonly FirstMonthStepId[]): number {
  return done.length / FIRST_MONTH_STEPS.length;
}

/**
 * Where each step happens: the real page + anchor a person lands on. The tools
 * page's interactive panels are the destinations — the walkthrough links, the
 * tools page teaches.
 */
export function firstMonthHref(step: FirstMonthStepId): string {
  switch (step) {
    case 'bill':
      return '/tools#live-demos';
    case 'collect':
      return '/tools#live-demos';
    case 'reconcile':
      return '/tools#live-demos';
    case 'review':
      return '/compliance';
    case 'close':
      return '/tools#live-demos';
  }
}
