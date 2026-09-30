/**
 * The first-visit question.
 *
 * A brand-new visitor used to land on a full dashboard: four metric cards, a
 * building list, an activity feed and four panels of things to do — for a
 * building that is not theirs, with numbers that are not real. Everything on the
 * page was honest and labelled, and it was still a wall.
 *
 * This replaces that first impression with one plain question and three ways in:
 * look around, set a building up, or sign in. The dashboard only appears once
 * the visitor has said which of those they want.
 *
 * **How it decides, before the first paint.** The home page is prerendered, so
 * the markup has to contain both the question and the dashboard. An inline
 * script in `src/app.html` adds `start-pending` to `<html>` when there is no
 * recorded choice and no stored token — the same technique the theme switch
 * already uses to avoid a flash — and two CSS rules in `src/app.css` swap which
 * one is visible. A crawler still sees the real dashboard content; a person sees
 * the question.
 *
 * Storage is local and the choice is a single word. A visitor who clears it just
 * sees the question once more.
 */

import { browser } from '$app/environment';

/** localStorage key holding the visitor's answer. Mirrored in `src/app.html`. */
export const START_KEY = 'openstrata-start';

/** The token key the inline script also checks. Mirrored in `src/lib/api/token.ts`. */
export const TOKEN_KEY = 'openstrata-token';

export type StartChoiceId = 'exploring' | 'setup';

export const START_CHOICES: readonly StartChoiceId[] = ['exploring', 'setup'];

const isChoice = (value: unknown): value is StartChoiceId =>
  typeof value === 'string' && (START_CHOICES as readonly string[]).includes(value);

/**
 * Read a stored answer. Anything else — absent, malformed, hand-edited, a value
 * from a future build — reads as "not asked yet", which is the safe direction:
 * the question is skippable in one click and never blocks anything.
 */
export function parseStartChoice(raw: string | null | undefined): StartChoiceId | null {
  return isChoice(raw) ? raw : null;
}

export function serializeStartChoice(choice: StartChoiceId): string {
  return choice;
}

/** Should the question be asked in the first place? */
export function shouldShowStart(input: { signedIn: boolean; choice: StartChoiceId | null }): boolean {
  return !input.signedIn && input.choice === null;
}

/** Persist an answer, tolerating storage being unavailable or full. */
export function rememberStartChoice(choice: StartChoiceId): void {
  if (!browser) return;
  try {
    localStorage.setItem(START_KEY, serializeStartChoice(choice));
  } catch {
    /* private mode / storage disabled — the choice simply is not remembered */
  }
}

export function readStartChoice(): StartChoiceId | null {
  if (!browser) return null;
  try {
    return parseStartChoice(localStorage.getItem(START_KEY));
  } catch {
    return null;
  }
}

/**
 * The class the inline script sets. Cleared when the visitor answers so the
 * dashboard appears immediately, with no navigation and no re-render flash.
 */
export const START_PENDING_CLASS = 'start-pending';

export function clearStartPending(): void {
  if (browser) document.documentElement.classList.remove(START_PENDING_CLASS);
}

export function isStartPending(): boolean {
  return browser && document.documentElement.classList.contains(START_PENDING_CLASS);
}
