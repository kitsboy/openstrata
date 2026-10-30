import { describe, expect, it } from 'vitest';
import {
	FORM_K_MEETING,
	formKLetters,
	issuableFormKLetters
} from './demo/form-k-letters';
import { formKLetter, type FormKLetterInput } from './form-k-letter';

const base: FormKLetterInput = {
	unitId: '209',
	owner: 'Wen Li',
	tenant: 'Mara Singh',
	since: '2026-09-01',
	closes: '2026-09-15',
	pastDays: 15,
	onFile: false,
	occupancy: 'tenant',
	asOf: '2026-09-30',
	meetingIso: '2026-10-20'
};

describe('formKLetter', () => {
	it('repeats the register’s own close date and count', () => {
		const letter = formKLetter(base);

		expect(letter.reference).toBe('OS-FK-2026-09-209');
		expect(letter.since).toBe('2026-09-01');
		expect(letter.closes).toBe('2026-09-15');
		expect(letter.pastDays).toBe(15);
		expect(letter.issuable).toBe(true);
		expect(letter.defect).toBeNull();
	});

	it('carries the council meeting it will be read at', () => {
		const letter = formKLetter(base);

		expect(letter.meetingIso).toBe('2026-10-20');
		expect(letter.daysToMeeting).toBe(20);
	});

	it('states no money, because a late Form K carries no fine in this bylaw', () => {
		const letter = formKLetter(base);

		expect(letter.fineCents).toBeNull();
		expect(JSON.stringify(letter)).not.toContain('$');
		expect(JSON.stringify(letter)).not.toContain('fineCents":2');
	});

	it('writes to no lot whose window is still open', () => {
		const open = formKLetter({ ...base, asOf: '2026-09-10', pastDays: 0 });
		const filed = formKLetter({ ...base, onFile: true, pastDays: 0 });
		const unnamed = formKLetter({ ...base, tenant: null });

		expect(open.issuable).toBe(false);
		expect(open.defect).toBe('open');
		expect(filed.issuable).toBe(false);
		expect(filed.defect).toBe('filed');
		expect(unnamed.defect).toBe('tenant');
	});

	it('writes to no short-term lot, whatever its start date', () => {
		const short = formKLetter({
			...base,
			unitId: '309',
			occupancy: 'short-term',
			since: '2026-07-01',
			closes: '2026-07-15',
			pastDays: 77
		});

		expect(short.issuable).toBe(false);
		expect(short.defect).toBe('short-term');
	});

	it('refuses a count that disagrees with its own dates', () => {
		const wrong = formKLetter({ ...base, pastDays: 14 });

		expect(wrong.issuable).toBe(false);
		expect(wrong.defect).toBe('count');
	});

	it('drops a meeting that is no longer ahead', () => {
		const late = formKLetter({ ...base, meetingIso: '2026-09-15' });
		const none = formKLetter({ ...base, meetingIso: null });

		expect(late.meetingIso).toBeNull();
		expect(late.daysToMeeting).toBeNull();
		expect(none.meetingIso).toBeNull();
	});
});

describe('the register’s mail run', () => {
	it('prints two letters for the three gaps, and holds lot 309 out', () => {
		const all = formKLetters({}, '2026-09-30');
		const issuable = issuableFormKLetters({}, '2026-09-30');

		expect(all).toHaveLength(8);
		expect(issuable.map((letter) => letter.unitId)).toEqual(['209', '407']);
		expect(all.find((letter) => letter.unitId === '309')?.defect).toBe('short-term');
		// The five lots already on file are refused as filed, not as late.
		expect(all.filter((letter) => letter.defect === 'filed')).toHaveLength(5);
		expect(issuable.every((letter) => letter.pastDays === 15)).toBe(true);
	});

	it('sends nothing while the windows are still open', () => {
		expect(issuableFormKLetters({}, '2026-09-10')).toHaveLength(0);
	});

	it('takes its meeting from the council’s own next night', () => {
		expect(FORM_K_MEETING).toBe('2026-10-20');
		const letter = issuableFormKLetters({}, '2026-09-30')[0];
		expect(letter.meetingIso).toBe(FORM_K_MEETING);
		expect(letter.daysToMeeting).toBe(20);
	});
});
