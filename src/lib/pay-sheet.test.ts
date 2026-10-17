import { describe, it, expect } from 'vitest';
import {
	DEFAULT_SHEET_RAIL,
	LOCK_SECONDS,
	PAY_LINK_PARAM,
	SHEET_RAILS,
	TUCKED_RAILS,
	isPayLinkToken,
	isSheetRail,
	lockClock,
	lockState,
	payLinkFromSearch,
	providerReturnHref,
	sheetRail,
	sheetSearch
} from './pay-sheet';

/** A link shaped like the backend's: `ospl1.<payload>.<signature>`. */
const LINK = `ospl1.${'p'.repeat(120)}.${'s'.repeat(43)}`;

describe('pay sheet rate lock', () => {
	it('is locked while time remains and expired at the boundary', () => {
		expect(lockState(LOCK_SECONDS)).toBe('locked');
		expect(lockState(1)).toBe('locked');
		expect(lockState(0)).toBe('expired');
	});

	it('reads hostile time as expired rather than as a live rate', () => {
		expect(lockState(-1)).toBe('expired');
		expect(lockState(-LOCK_SECONDS)).toBe('expired');
	});

	it('formats the stamp as mm:ss', () => {
		expect(lockClock(LOCK_SECONDS)).toBe('15:00');
		expect(lockClock(61)).toBe('01:01');
		expect(lockClock(9)).toBe('00:09');
		expect(lockClock(0)).toBe('00:00');
	});

	it('clamps past the end instead of printing a negative clock', () => {
		expect(lockClock(-5)).toBe('00:00');
		expect(lockClock(-LOCK_SECONDS)).toBe('00:00');
	});

	it('truncates a fractional second rather than rounding it up', () => {
		expect(lockClock(59.9)).toBe('00:59');
	});
});

describe('pay sheet rails', () => {
	it('offers exactly three large choices, e-transfer first', () => {
		expect(SHEET_RAILS).toEqual(['etransfer', 'bitcoin', 'lightning']);
	});

	it('keeps PAD and cheque out of the choices', () => {
		for (const tucked of TUCKED_RAILS) {
			expect(SHEET_RAILS as readonly string[]).not.toContain(tucked);
		}
	});

	it('accepts a deep link to a real choice', () => {
		for (const rail of SHEET_RAILS) expect(isSheetRail(rail)).toBe(true);
	});

	it('refuses a deep link that is not one of the three', () => {
		expect(isSheetRail('pad')).toBe(false);
		expect(isSheetRail('cheque')).toBe(false);
		expect(isSheetRail('')).toBe(false);
		expect(isSheetRail(null)).toBe(false);
		expect(isSheetRail(undefined)).toBe(false);
	});
});

describe('a signed bill link on the sheet', () => {
	it('is found in the address it arrives on', () => {
		expect(payLinkFromSearch(`?unit=305&rail=etransfer&${PAY_LINK_PARAM}=${LINK}`)).toBe(LINK);
		expect(payLinkFromSearch(`?${PAY_LINK_PARAM}=${LINK}`)).toBe(LINK);
	});

	it('is not invented from an ordinary visit', () => {
		expect(payLinkFromSearch('')).toBeNull();
		expect(payLinkFromSearch('?unit=305&rail=etransfer')).toBeNull();
	});

	it('refuses a ?t= that is not a signed link', () => {
		// A campaign tag, a hand-typed value, or a token from another scheme: none
		// of these may send the page looking for a bill it was never given.
		expect(payLinkFromSearch('?t=campaign')).toBeNull();
		expect(payLinkFromSearch('?t=ospl1.tooshort')).toBeNull();
		expect(payLinkFromSearch('?t=eyJhbGciOiJIUzI1NiJ9.payload.sig')).toBeNull();
		for (const value of [null, undefined, '', 'ospl1.', 42 as unknown as string]) {
			expect(isPayLinkToken(value)).toBe(false);
		}
	});

	it('survives a rail or lot change, so the payment is not interrupted', () => {
		const search = sheetSearch('305', 'bitcoin', LINK);
		const params = new URLSearchParams(search);
		expect(params.get('unit')).toBe('305');
		expect(params.get('rail')).toBe('bitcoin');
		expect(params.get(PAY_LINK_PARAM)).toBe(LINK);
	});

	it('adds no token to a sheet that has none', () => {
		const params = new URLSearchParams(sheetSearch('305', 'etransfer'));
		expect(params.has(PAY_LINK_PARAM)).toBe(false);
		expect(params.get('rail')).toBe('etransfer');
	});

	it('drops the token from the address handed to a bank', () => {
		const href = providerReturnHref(`https://openstrata.giveabit.io/pay?unit=305&rail=etransfer&t=${LINK}`);
		const url = new URL(href);
		expect(url.searchParams.has(PAY_LINK_PARAM)).toBe(false);
		expect(href).not.toContain(LINK);
		// Still the same sheet, so the payer comes back to the right panel.
		expect(url.searchParams.get('unit')).toBe('305');
		expect(url.searchParams.get('rail')).toBe('etransfer');
		// And the provider's own return parameters are not echoed back to it.
		expect(url.searchParams.has('etransfer')).toBe(false);
		expect(url.searchParams.has('status')).toBe(false);
	});
});

describe('the rail a link asks for', () => {
	it('shows the rail the link names', () => {
		for (const rail of SHEET_RAILS) expect(sheetRail(rail)).toBe(rail);
	});

	it('opens on the first choice when the link names none', () => {
		expect(sheetRail(null)).toBe(DEFAULT_SHEET_RAIL);
		expect(sheetRail(undefined)).toBe(DEFAULT_SHEET_RAIL);
		expect(sheetRail('')).toBe(DEFAULT_SHEET_RAIL);
	});

	it('never opens on a rail the sheet does not offer', () => {
		expect(sheetRail('pad')).toBe(DEFAULT_SHEET_RAIL);
		expect(sheetRail('cheque')).toBe(DEFAULT_SHEET_RAIL);
		expect(sheetRail('etransfer ')).toBe(DEFAULT_SHEET_RAIL);
		expect(sheetRail('BITCOIN')).toBe(DEFAULT_SHEET_RAIL);
	});

	it('always returns one of the three the sheet shows', () => {
		for (const requested of ['pad', 'cheque', 'nonsense', null, undefined, '', 'bitcoin']) {
			expect(SHEET_RAILS as readonly string[]).toContain(sheetRail(requested));
		}
	});
});
