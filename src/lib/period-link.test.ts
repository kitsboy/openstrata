import { describe, expect, it } from 'vitest';
import { PERIOD_PARAM, accountingHref, parsePeriod } from './period-link';
import { monthDetail } from './demo/health';

describe('parsePeriod', () => {
	it('turns a month into the statement date at its end', () => {
		expect(parsePeriod('2026-09')).toEqual({ period: '2026-09', asOf: '2026-09-30' });
		expect(parsePeriod('2026-04')).toEqual({ period: '2026-04', asOf: '2026-04-30' });
		// February in a leap year, and one that is not.
		expect(parsePeriod('2028-02')?.asOf).toBe('2028-02-29');
		expect(parsePeriod('2026-02')?.asOf).toBe('2026-02-28');
		expect(parsePeriod('2026-12')?.asOf).toBe('2026-12-31');
	});

	it('rejects anything that is not a month, rather than guessing', () => {
		expect(parsePeriod(null)).toBeNull();
		expect(parsePeriod(undefined)).toBeNull();
		expect(parsePeriod('')).toBeNull();
		expect(parsePeriod('2026-13')).toBeNull();
		expect(parsePeriod('2026-00')).toBeNull();
		expect(parsePeriod('2026-9')).toBeNull();
		expect(parsePeriod('September')).toBeNull();
		expect(parsePeriod('2026-09-30')).toBeNull();
	});

	it('agrees with the month the trend panel measured', () => {
		// The link must carry the same statement date the point was aged at, or the
		// ladder lands one day either side of the number the reader clicked.
		const period = '2026-09';
		expect(parsePeriod(period)?.asOf).toBe(monthDetail('2026-09-30').asOf);
	});
});

describe('accountingHref', () => {
	it('carries the month in the one parameter the books read', () => {
		expect(accountingHref('2026-09')).toBe(`/accounting?${PERIOD_PARAM}=2026-09`);
		expect(accountingHref('2026-09')).toContain('period=');
		expect(parsePeriod(accountingHref('2026-04').split('period=')[1])?.period).toBe('2026-04');
	});
});
