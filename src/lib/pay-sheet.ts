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

// ---------------------------------------------------------------------------
// Signed bill links (`/pay?unit=305&rail=etransfer&t=ospl1…`)
// ---------------------------------------------------------------------------

/**
 * The query parameter a treasurer's bill link carries the signed token in. The
 * backend signs it (`backend/src/rails/pay-link.ts`) and nothing on this build
 * composes one: a token made here would be a token this site could not verify.
 */
export const PAY_LINK_PARAM = 't';

/**
 * The shape every signed bill link starts with. Checked before a token is sent
 * anywhere, so a stray `?t=` (an analytics parameter, a typo) is treated as "no
 * link" rather than as a broken bill. The prefix itself is the backend's.
 */
const PAY_LINK_PREFIX = 'ospl1.';

export function isPayLinkToken(value: string | null | undefined): value is string {
	return typeof value === 'string' && value.startsWith(PAY_LINK_PREFIX) && value.length > 32;
}

/** The signed token a `/pay` address carries, or null when it carries none. */
export function payLinkFromSearch(search: string): string | null {
	const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
	const token = params.get(PAY_LINK_PARAM)?.trim();
	return isPayLinkToken(token) ? token : null;
}

/**
 * The sheet's own address after a rail or lot change. The token is carried
 * through untouched: dropping it would turn a live bill into an anonymous demo
 * sheet mid-payment, and re-signing is not something a browser can do.
 */
export function sheetSearch(
	unitRef: string,
	rail: SheetRail,
	token: string | null = null
): string {
	const params = new URLSearchParams({ unit: unitRef, rail });
	if (isPayLinkToken(token)) params.set(PAY_LINK_PARAM, token);
	return params.toString();
}

/**
 * The address handed to a provider as its return URL. The bill token is removed:
 * it is a bearer credential for this owner's bill, and the bank's page has no
 * use for it. The return still carries the lot and rail, so the sheet resumes on
 * the same panel; the request id and status are the provider's own to add.
 */
export function providerReturnHref(href: string): string {
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		// Fail closed: an address we cannot parse is returned without its query at
		// all, never with the credential still attached.
		return href.split('?')[0] ?? '';
	}
	url.searchParams.delete(PAY_LINK_PARAM);
	url.searchParams.delete('etransfer');
	url.searchParams.delete('status');
	return url.toString();
}
