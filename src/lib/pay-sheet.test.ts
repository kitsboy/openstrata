import { describe, it, expect } from 'vitest';
import {
	DEFAULT_SHEET_RAIL,
	LOCK_SECONDS,
	SHEET_RAILS,
	TUCKED_RAILS,
	isSheetRail,
	lockClock,
	lockState,
	sheetRail
} from './pay-sheet';

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
