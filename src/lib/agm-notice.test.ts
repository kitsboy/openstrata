import { describe, expect, it } from 'vitest';
import { budgetYearEndFor, agmNotice } from './agm-notice';
import { building } from './demo/building';

const letter = (issuedIso: string, meetingIso = '2027-05-19') =>
	agmNotice({
		meetingIso,
		time: '7:00 pm',
		place: 'Amenity room',
		issuedIso,
		agenda: ['Call to order', 'Budget'],
		resolutions: [
			{ vote: 'Majority', text: 'That the budget for the year ending {yearEnd} be approved.' },
			{ vote: 'Majority', text: 'That the insurance renewal be adopted.' }
		],
		quorumNeed: 14,
		lots: 40,
		fiscalYearEnd: building.fiscalEnd
	});

describe('the AGM notice letter', () => {
	it('takes the fourteen-day window from the meeting arithmetic', () => {
		const notice = letter('2027-04-28');
		expect(notice.noticeBy).toBe('2027-05-05');
		expect(notice.days).toBe(21);
		expect(notice.met).toBe(true);
		expect(notice.reference).toBe('OS-AGM-2027-04');
	});

	it('says a notice issued inside the window is late, and still prints it', () => {
		const notice = letter('2027-05-10');
		expect(notice.days).toBe(9);
		expect(notice.met).toBe(false);
		// The letter is not emptied: the agenda and the motions still go out.
		expect(notice.agenda).toHaveLength(2);
		expect(notice.resolutions).toHaveLength(2);
	});

	it('advances the budget year past the meeting, never to a closed year', () => {
		expect(budgetYearEndFor('2027-03-31', '2027-05-19')).toBe('2028-03-31');
		// A meeting before the current year end still approves the year now running.
		expect(budgetYearEndFor('2027-03-31', '2027-02-01')).toBe('2027-03-31');
	});

	it('drops a motion with no wording or no vote, rather than printing a blank', () => {
		const notice = agmNotice({
			meetingIso: '2027-05-19',
			time: '7:00 pm',
			place: 'Amenity room',
			issuedIso: '2027-04-28',
			agenda: ['Call to order'],
			resolutions: [
				{ vote: 'Majority', text: '  ' },
				{ vote: '', text: 'That the budget be approved.' },
				{ vote: '3/4', text: 'That bylaw 9.2 be amended.' }
			],
			quorumNeed: 14,
			lots: 40,
			fiscalYearEnd: building.fiscalEnd
		});
		expect(notice.resolutions).toEqual([
			{ vote: '3/4', text: 'That bylaw 9.2 be amended.' }
		]);
	});

	it('keeps the meeting’s own quorum, which is a third of the lots', () => {
		const notice = letter('2027-04-28');
		expect(notice.quorumNeed).toBe(14);
		expect(notice.lots).toBe(40);
	});
});
