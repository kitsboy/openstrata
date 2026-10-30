import { describe, expect, it } from 'vitest';
import { hearingNotice, type BylawComplaint } from './hearing-notice';
import { bylawComplaint, bylawFines, bylawHearing } from './demo/fines';

const fine = bylawFines[0];

/** The notice served on the fine's own date, so the fixture cannot drift. */
const base = {
	complaint: bylawComplaint,
	noticeIso: fine.noticeIso,
	hearingIso: fine.hearingIso,
	hearingTime: bylawHearing.time,
	hearingPlace: bylawHearing.place,
	days: fine.days,
	ceilingPerDayCents: fine.ceilingPerDayCents
};

describe('hearingNotice', () => {
	it('takes its window and its hearing from the register’s own dates', () => {
		const notice = hearingNotice(base);

		expect(notice.windowCloses).toBe('2026-09-12');
		expect(notice.windowDays).toBe(14);
		expect(notice.hearingIso).toBe('2026-09-15');
		expect(notice.inOrder).toBe(true);
		expect(notice.reference).toBe('OS-BHN-2026-08');
	});

	it('states the bylaw’s maximum, not a fine nobody has decided', () => {
		const notice = hearingNotice(base);

		expect(notice.amount).toEqual({ kind: 'maximum', cents: 20_000 });
		expect(notice.days).toBe(1);
		expect(notice.ceilingPerDayCents).toBe(20_000);
	});

	it('scales the maximum by the days the notice covers', () => {
		const notice = hearingNotice({ ...base, days: 3 });

		expect(notice.amount).toEqual({ kind: 'maximum', cents: 60_000 });
	});

	it('prints a decided fine as levied, with its date', () => {
		const notice = hearingNotice({
			...base,
			noticeIso: '2026-09-16',
			leviedCents: 20_000,
			leviedIso: '2026-09-15'
		});

		expect(notice.amount).toEqual({ kind: 'levied', cents: 20_000, date: '2026-09-15' });
	});

	it('does not print a fine decided after the letter was served', () => {
		const notice = hearingNotice({ ...base, leviedCents: 20_000, leviedIso: '2026-09-15' });

		expect(notice.amount.kind).toBe('maximum');
	});

	it('keeps the complainant’s name off the notice', () => {
		const named = {
			...bylawComplaint,
			complainant: 'Ingrid Solberg',
			name: 'Ingrid Solberg'
		} as BylawComplaint;
		const notice = hearingNotice({ ...base, complaint: named });

		expect(notice.complainantRole).toBe('another owner in the building');
		expect(JSON.stringify(notice)).not.toContain('Ingrid');
		expect(JSON.stringify(notice)).not.toContain('Solberg');
	});

	it('keeps a hearing set before the window closes on the paper', () => {
		const notice = hearingNotice({ ...base, hearingIso: '2026-09-08' });

		expect(notice.inOrder).toBe(false);
		expect(notice.hearingIso).toBe('2026-09-08');
		expect(notice.windowCloses).toBe('2026-09-12');
	});

	it('withholds a notice the complaint cannot support', () => {
		const nothing = hearingNotice({
			...base,
			complaint: { ...bylawComplaint, evidence: [] }
		});
		const noDays = hearingNotice({ ...base, days: 0 });
		const early = hearingNotice({
			...base,
			complaint: { ...bylawComplaint, receivedIso: '2026-09-01' }
		});

		expect(nothing.issuable).toBe(false);
		expect(nothing.defect).toBe('evidence');
		expect(noDays.issuable).toBe(false);
		expect(early.issuable).toBe(false);
		expect(early.defect).toBe('sequence');
		expect(hearingNotice(base).issuable).toBe(true);
	});
});
