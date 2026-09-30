// Setup checklist — the small state machine behind the dashboard's
// "finish setting up" panel.
//
// The public site has the "start here" journey strip (see ./journey.ts) for
// someone deciding whether to sign up. This is the other half: once a workspace
// exists, what does a council have to do before the building is genuinely
// running? Four things, in order:
//
//   1. units   — add every unit, so fees, ballots and Form K track correctly
//   2. funds   — open operating + reserve as separate funds, because the SPA
//                does not allow co-mingling trust money
//   3. bylaws  — load the standard bylaw set or the filed set, so enforcement
//                has a basis
//   4. month   — bill, reconcile and close one real month
//
// Progress is local-only (localStorage, no account, no server call). The
// checklist is a nudge, not a record of truth: the workspace itself is the
// record, and if storage is cleared the worst case is a few extra clicks.

export const SETUP_KEY = 'openstrata-setup-done';
export const SETUP_HIDE_KEY = 'openstrata-setup-hidden';

export type SetupStepId = 'units' | 'funds' | 'bylaws' | 'month';

export const SETUP_STEPS: readonly SetupStepId[] = ['units', 'funds', 'bylaws', 'month'];

export type SetupProgress = {
  /** Steps the user has ticked, in canonical order. */
  done: SetupStepId[];
  /** Whether the panel has been dismissed. */
  hidden: boolean;
};

export const EMPTY_PROGRESS: SetupProgress = { done: [], hidden: false };

function isStepId(value: unknown): value is SetupStepId {
  return typeof value === 'string' && (SETUP_STEPS as readonly string[]).includes(value);
}

/**
 * Parse persisted progress. Anything malformed, partial or hostile degrades to
 * "nothing done, not hidden" rather than throwing — a corrupt localStorage
 * entry must never break the dashboard it is decorating.
 */
export function parseProgress(raw: string | null | undefined): SetupProgress {
  if (!raw) return { ...EMPTY_PROGRESS };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...EMPTY_PROGRESS };
  }
  if (!parsed || typeof parsed !== 'object') return { ...EMPTY_PROGRESS };
  const record = parsed as Record<string, unknown>;
  const done = Array.isArray(record.done)
    ? SETUP_STEPS.filter((step) => (record.done as unknown[]).some((value) => value === step))
    : [];
  return { done, hidden: record.hidden === true };
}

/** Serialize progress for storage. Kept here so read and write cannot drift. */
export function serializeProgress(progress: SetupProgress): string {
  return JSON.stringify({ done: progress.done, hidden: progress.hidden });
}

/** Tick or untick a step, keeping the canonical order and never duplicating. */
export function toggleStep(done: readonly SetupStepId[], step: SetupStepId): SetupStepId[] {
  const next = done.includes(step)
    ? done.filter((candidate) => candidate !== step)
    : [...done, step];
  return SETUP_STEPS.filter((candidate) => next.includes(candidate));
}

/**
 * The next thing to do: the first unticked step, or `null` when the setup is
 * finished. The panel then reads as complete instead of pushing a done user.
 */
export function nextStep(done: readonly SetupStepId[]): SetupStepId | null {
  return SETUP_STEPS.find((step) => !done.includes(step)) ?? null;
}

/** 0–100, for the progress meter. */
export function setupPercent(done: readonly SetupStepId[]): number {
  return Math.round((done.length / SETUP_STEPS.length) * 100);
}

/** True only when every step is ticked — used to swap the panel's closing copy. */
export function isComplete(done: readonly SetupStepId[]): boolean {
  return done.length === SETUP_STEPS.length;
}
