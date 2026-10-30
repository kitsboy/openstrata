import { describe, expect, it } from 'vitest';
import { levyLetter } from './levy-letter';
import { lotLevyLetter, levyLetters } from './demo/levy-letter';
import { books } from './demo/books';
import { units } from './demo/building';

/**
 * The special levy, as a demand to one owner.
 *
 * The statement on `/accounting` is the council's page; this is the page that
 * goes to lot 207. Its share has to be the resolution's own arithmetic, the ask
 * has to respect a schedule, and the trust it quotes has to be the trust the
 * books carry.
 */
describe('lotLevyLetter', () => {
	it('rebuilds the lot’s share from its entitlement, not from its record', () => {
		const letter = lotLevyLetter('207')!;

		// 148 points at $36: the record's $3,552 is two thirds of the share, and
		// the third it paid on the day the levy passed is the rest.
		expect(letter.points).toBe(148);
		expect(letter.pointCents).toBe(3600);
		expect(letter.assessedCents).toBe(532_800);
		expect(letter.owingCents).toBe(355_200);
		expect(letter.paidCents).toBe(177_600);
		expect(letter.askCents).toBe(355_200);
		expect(letter.planCents).toBeNull();
		expect(letter.reference).toBe('OS-LV-2026-09-207');
	});

	it('dates the levy from the meeting that passed it', () => {
		const letter = lotLevyLetter('207')!;

		expect(letter.dueIso).toBe('2025-11-12');
		expect(letter.daysLate).toBe(322);
	});

	it('asks a plan lot for its instalment, and does not age it', () => {
		const letter = lotLevyLetter('108')!;

		expect(letter.owingCents).toBe(180_000);
		expect(letter.planCents).toBe(30_000);
		expect(letter.askCents).toBe(30_000);
		expect(letter.daysLate).toBeNull();
		expect(letter.paidCents).toBe(letter.assessedCents - letter.owingCents);
	});

	it('prints the trust from the books and checks its two routes', () => {
		const letter = lotLevyLetter('207')!;

		expect(letter.trust.assessedCents).toBe(books.levy.assessed);
		expect(letter.trust.cashCents).toBe(books.levy.cash);
		expect(letter.trust.remainingCents).toBe(books.levy.remaining);
		expect(letter.differenceCents).toBe(0);
		expect(letter.trustBalanced).toBe(true);
	});

	it('names the council meeting a plan would be agreed at, while it is ahead', () => {
		expect(lotLevyLetter('207')!.deadline).toBe('2026-10-20');
		expect(lotLevyLetter('207', '2026-09-30', '2026-09-15')!.deadline).toBeNull();
		expect(lotLevyLetter('207', '2026-09-30', null)!.deadline).toBeNull();
	});

	it('refuses a demand on a settled lot, and offers none in the list', () => {
		const settled = lotLevyLetter('305')!;

		expect(settled.owingCents).toBe(0);
		expect(settled.issuable).toBe(false);
		expect(settled.defect).toBe('settled');
		expect(levyLetters().every((letter) => letter.owingCents > 0)).toBe(true);
		// The three lots that owe: 108 on a plan, 207, and 403 on a plan.
		expect(levyLetters().map((letter) => letter.unitId).sort()).toEqual(['108', '207', '403']);
	});

	it('caps a bad record at the share the resolution charged', () => {
		const unit = units[0];
		const over = levyLetter({
			unitId: unit.id,
			owner: unit.owner,
			points: 10,
			pointCents: 3600,
			owingCents: 99_999_99,
			planCents: null,
			dueIso: '2025-11-12',
			asOf: '2026-09-30',
			approved: books.levy.approved,
			project: books.levy.project,
			trust: {
				assessedCents: books.levy.assessed,
				collectedCents: books.levy.collected,
				paidCents: books.levy.spent,
				cashCents: books.levy.cash,
				remainingCents: books.levy.remaining
			},
			meetingIso: '2026-10-20'
		});

		expect(over.assessedCents).toBe(36_000);
		expect(over.owingCents).toBe(36_000);
		expect(over.defect).toBe('exceeds');
		expect(over.issuable).toBe(false);
	});

	it('returns nothing for a lot that is not on the register', () => {
		expect(lotLevyLetter('999')).toBeNull();
	});
});
