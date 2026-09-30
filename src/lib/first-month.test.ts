import { describe, expect, it } from 'vitest';
import {
	EMPTY_FIRST_MONTH,
	FIRST_MONTH_KEY,
	FIRST_MONTH_STEPS,
	firstMonthFraction,
	nextFirstMonthStep,
	parseFirstMonth,
	serializeFirstMonth,
	toggleFirstMonthStep
} from './first-month';

describe('first-month walkthrough', () => {
	it('exposes the five steps in treasurer order', () => {
		expect(FIRST_MONTH_STEPS).toEqual(['bill', 'collect', 'reconcile', 'review', 'close']);
		expect(FIRST_MONTH_KEY).toBe('openstrata-first-month-done');
	});

	it('round-trips progress through serialize/parse', () => {
		const raw = serializeFirstMonth({ done: ['bill', 'collect'], hidden: false });
		expect(parseFirstMonth(raw)).toEqual({ done: ['bill', 'collect'], hidden: false });
	});

	it('degrades hostile storage to empty progress', () => {
		expect(parseFirstMonth(null)).toEqual(EMPTY_FIRST_MONTH);
		expect(parseFirstMonth('not json')).toEqual(EMPTY_FIRST_MONTH);
		expect(parseFirstMonth('42')).toEqual(EMPTY_FIRST_MONTH);
		expect(parseFirstMonth('{"done":["nope"]}')).toEqual(EMPTY_FIRST_MONTH);
		expect(parseFirstMonth('{"done":["bill","nope"]}').done).toEqual(['bill']);
	});

	it('toggles steps and keeps canonical order', () => {
		let done = toggleFirstMonthStep([], 'close');
		expect(done).toEqual(['close']);
		done = toggleFirstMonthStep(done, 'bill');
		expect(done).toEqual(['bill', 'close']);
		done = toggleFirstMonthStep(done, 'close');
		expect(done).toEqual(['bill']);
	});

	it('names the next step and detects completion', () => {
		expect(nextFirstMonthStep([])).toBe('bill');
		expect(nextFirstMonthStep(['bill', 'collect', 'reconcile', 'review'])).toBe('close');
		expect(nextFirstMonthStep(['bill', 'collect', 'reconcile', 'review', 'close'])).toBeNull();
	});

	it('computes the completion fraction', () => {
		expect(firstMonthFraction([])).toBe(0);
		expect(firstMonthFraction(['bill', 'collect'])).toBe(0.4);
		expect(firstMonthFraction(FIRST_MONTH_STEPS.slice())).toBe(1);
	});
});
