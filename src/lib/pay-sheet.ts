/**
 * Rules for the one-lot pay sheet (`/pay`), kept out of the component so they
 * can be tested without a browser — same shape as `calendar.ts`, `tasks.ts` and
 * `first-month.ts`.
 *
 * Three things on that sheet are rules rather than styling: which rails are the
 * sheet's three large choices (PAD and cheque are deliberately not among them),
 * what the 15-minute rate lock reads, and when that lock has expired — the
 * moment the Bitcoin and Lightning numbers stop being true. A stale rate that
 * still looks live is the one dishonesty this page could tell, so the state is
 * a value here rather than a colour in the template.
 */

/** The sheet's rate lock: 15 minutes, then the fiat amounts are stale. */
export const LOCK_SECONDS = 15 * 60;

/**
 * A stamp, not a control: the lock only has two states. Kept beside `SHEET_RAILS`
 * rather than in the component, because "the shown rail and the shown rate are the
 * same value" is a rule, not a style.
 */
export type LockState = 'locked' | 'expired';

export function lockState(seconds: number): LockState {
	return seconds > 0 ? 'locked' : 'expired';
}

/** `mm:ss`, clamped at 00:00 — a negative remainder must never render. */
export function lockClock(seconds: number): string {
	const whole = Math.max(0, Math.floor(seconds));
	const minutes = Math.floor(whole / 60);
	return `${String(minutes).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

/** The three large choices, in the order they are offered. */
export const SHEET_RAILS = ['etransfer', 'bitcoin', 'lightning'] as const;
export type SheetRail = (typeof SHEET_RAILS)[number];

/** What the sheet shows when nothing has been asked for. */
export const DEFAULT_SHEET_RAIL: SheetRail = 'etransfer';

/** PAD and cheque stay tucked under the sheet rather than offered beside it. */
export const TUCKED_RAILS = ['pad', 'cheque'] as const;

/**
 * `?rail=` arrives from a URL, so it is checked rather than trusted: a deep link
 * to `pad` selects nothing rather than rendering an empty artifact panel.
 */
export function isSheetRail(value: string | null | undefined): value is SheetRail {
	return typeof value === 'string' && (SHEET_RAILS as readonly string[]).includes(value);
}

/**
 * The rail a `?rail=` link asks for, or the default when it asks for a rail the
 * sheet does not offer — `pad` and `cheque` are tucked under it, so a link to
 * either lands on the sheet's first choice rather than on nothing.
 */
export function sheetRail(requested: string | null | undefined): SheetRail {
	return isSheetRail(requested) ? requested : DEFAULT_SHEET_RAIL;
}
