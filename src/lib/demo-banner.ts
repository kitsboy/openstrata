/**
 * The demo banner's visibility rule — pure and tested.
 *
 * Most of OpenStrata runs on sample data until a council connects a host and
 * signs in. The dashboard already labels its pieces honestly (a Live/Demo pill,
 * demo-labelled task rows), but the fact "changes here are not saved anywhere"
 * only lived in the fine print. The banner says it up top, once, with the two
 * ways out: connect a host, or save the building you are setting up.
 *
 * Why a rule function and not an `if` in the component: the failure mode this
 * guards against is a signed-in council on their own host reading "nothing you
 * type here is saved" about their *real* books — which would be a lie. That is
 * a one-line decision, so it gets a test that runs on every push rather than a
 * comment that rotts.
 *
 * The dismissal is device-local like every other nudge on this dashboard, and
 * it decays: a visitor who closed it yesterday may reasonably be reminded
 * today, so the banner reads a day-stamp rather than a forever flag.
 */

import { browser } from '$app/environment';

/** localStorage key holding the day the banner was dismissed. */
export const DEMO_BANNER_KEY = 'openstrata-demo-banner-dismissed';

/** A dismissed banner comes back after this many days. */
export const DEMO_BANNER_TTL_DAYS = 7;

export type DemoBannerInput = {
  /** True once the auth store has settled (`status !== 'booting'`). */
  settled: boolean;
  /** True when a real session exists on a configured host. */
  signedIn: boolean;
  /** True when no API base URL is configured anywhere (sample data by definition). */
  apiModeDemo: boolean;
  /** localStorage value, already read by the caller (so this stays pure). */
  dismissedRaw: string | null;
  /** Today, as a UTC day number. Defaults to the real clock. */
  nowDays?: number;
};

/** A UTC day number: dismissals compare days, not milliseconds. */
export function utcDay(date = new Date()): number {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
}

/**
 * The one rule: show the banner only when the visitor is on sample data with
 * no session — never to a signed-in council — and only when no recent
 * dismissal is stored.
 */
export function shouldShowDemoBanner({
  settled,
  signedIn,
  apiModeDemo,
  dismissedRaw,
  nowDays = utcDay()
}: DemoBannerInput): boolean {
  if (!settled || signedIn) return false;
  if (!apiModeDemo) return false;
  const dismissed = parseDismissal(dismissedRaw);
  return dismissed === null || nowDays - dismissed >= DEMO_BANNER_TTL_DAYS;
}

/** Parse the stored day-stamp; anything hostile reads as "never dismissed". */
export function parseDismissal(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function persistDismissal(now: Date = new Date()): void {
  if (!browser) return;
  try {
    localStorage.setItem(DEMO_BANNER_KEY, String(utcDay(now)));
  } catch {
    /* storage unavailable — the banner simply cannot remember the dismissal */
  }
}

export function readDismissal(): string | null {
  if (!browser) return null;
  try {
    return localStorage.getItem(DEMO_BANNER_KEY);
  } catch {
    return null;
  }
}
