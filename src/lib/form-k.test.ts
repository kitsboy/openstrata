import { beforeEach, describe, expect, it } from 'vitest';
import {
	FORM_K_KEY,
	clearFormK,
	filedOn,
	isFiled,
	parseFiledForms,
	readFiledForms,
	recordFormK,
	serializeFiledForms,
	writeFiledForms
} from './form-k';

describe('a Form K recorded on this device', () => {
	beforeEach(() => localStorage.clear());

	it('records a lot against the day the form arrived', () => {
		const forms = recordFormK({}, '309', '2026-09-30');
		expect(filedOn(forms, '309')).toBe('2026-09-30');
		expect(filedOn(forms, '209')).toBeNull();
	});

	it('counts a filing from its own day, so a closed month keeps its gap', () => {
		const forms = recordFormK({}, '309', '2026-09-30');
		expect(isFiled(forms, '309', '2026-09-30')).toBe(true);
		// August closed before the form arrived, and the score for it does not move.
		expect(isFiled(forms, '309', '2026-08-31')).toBe(false);
		expect(isFiled(forms, '209', '2026-09-30')).toBe(false);
	});

	it('refuses a lot id or a day that is not one', () => {
		expect(recordFormK({}, '30', '2026-09-30')).toEqual({});
		expect(recordFormK({}, '309', '2026-02-30')).toEqual({});
		expect(recordFormK({}, '309', '30/09/2026')).toEqual({});
		// A real leap day is a real day.
		expect(filedOn(recordFormK({}, '309', '2028-02-29'), '309')).toBe('2028-02-29');
	});

	it('removes a record, and leaves the rest alone', () => {
		const both = recordFormK(recordFormK({}, '309', '2026-09-30'), '407', '2026-09-20');
		const one = clearFormK(both, '309');
		expect(filedOn(one, '309')).toBeNull();
		expect(filedOn(one, '407')).toBe('2026-09-20');
		expect(clearFormK(one, '209')).toBe(one);
	});

	it('reads corrupt, partial and hostile storage as nothing filed', () => {
		expect(parseFiledForms(null)).toEqual({});
		expect(parseFiledForms('not json')).toEqual({});
		expect(parseFiledForms('[]')).toEqual({});
		expect(parseFiledForms('{"309":{"filedOn":"yesterday"}}')).toEqual({});
		expect(parseFiledForms('{"../etc/passwd":{"filedOn":"2026-09-30"}}')).toEqual({});
		expect(parseFiledForms('{"309":{"filedOn":"2026-09-30"}}')).toEqual({
			'309': { filedOn: '2026-09-30', by: 'Recorded on this device' }
		});
	});

	it('survives a round trip through storage', () => {
		const forms = recordFormK({}, '309', '2026-09-30', 'Cam Taylor — treasurer');
		writeFiledForms(forms);
		expect(localStorage.getItem(FORM_K_KEY)).toBe(serializeFiledForms(forms));
		expect(readFiledForms()).toEqual(forms);
		// Nothing stored yet is no filings, not an error.
		localStorage.clear();
		expect(readFiledForms()).toEqual({});
	});
});
