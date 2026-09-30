// Journey progress — the small state machine behind the "start here" strip.
//
// The strip answers the question a first-time visitor actually has: "what do I
// do next?" There are three legs to the OpenStrata funnel, in order:
//
//   1. Explore the modules        /tools
//   2. Configure your building    /tools/wizard
//   3. Register and go live       /docs/manual/getting-started
//
// Progress is intentionally local-only (localStorage, no account, no server
// call) — the product's whole pitch is "your data is yours", and a marketing
// funnel nudge should not be the one thing that phones home. Losing it when the
// user clears storage is fine; it costs one extra click, not data.

export const JOURNEY_KEY = 'openstrata-journey';
export const JOURNEY_HIDE_KEY = 'openstrata-journey-hidden';

export type JourneyStep = 1 | 2 | 3;

export const JOURNEY_STEPS: readonly JourneyStep[] = [1, 2, 3];

function isStep(value: unknown): value is JourneyStep {
  return value === 1 || value === 2 || value === 3;
}

/**
 * Parse the persisted progress blob. Anything malformed, partial or hostile
 * degrades to "nothing reached yet" rather than throwing — a corrupt
 * localStorage entry must never break the page it is decorating.
 */
export function parseReached(raw: string | null | undefined): JourneyStep[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return JOURNEY_STEPS.filter((step) => parsed.some((value) => value === step));
}

/** Add a step to the reached set, keeping the canonical order and no dupes. */
export function withStep(reached: readonly JourneyStep[], step: JourneyStep): JourneyStep[] {
  return JOURNEY_STEPS.filter((candidate) => candidate === step || reached.includes(candidate));
}

/**
 * The step to nudge the user toward: the first leg they have not reached yet,
 * or `null` once all three are done (the strip then reads as complete instead
 * of pushing them somewhere they have already been).
 */
export function nextStep(reached: readonly JourneyStep[]): JourneyStep | null {
  return JOURNEY_STEPS.find((step) => !reached.includes(step)) ?? null;
}

/** 0–100, for the progress meter. */
export function journeyPercent(reached: readonly JourneyStep[]): number {
  return Math.round((reached.length / JOURNEY_STEPS.length) * 100);
}
