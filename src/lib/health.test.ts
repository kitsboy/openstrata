import { describe, expect, it } from 'vitest';
import {
	AR_CAP,
	DEADLINE_OVERDUE,
	DEADLINE_SOON,
	DEADLINE_URGENT,
	DEADLINE_WATCH,
	FORM_K_CAP,
	arrearsPenalty,
	biggestMove,
	deadlinePenalty,
	formKPenalty,
	healthAt,
	penalties,
	scoreOf,
	trend,
	type HealthInputs,
	type Penalties,
	type TrackedDeadline
} from './health';
import {
	arrearsAt,
	demoDeadlinesAt,
	formKGapsAt,
	healthNow,
	healthTrend,
	inputsAt,
	monthDetail,
	trendPeriods
} from './demo/health';
import { building } from './demo/building';

const AS_OF = building.asOf;
const noArrears: HealthInputs = { tracked: [], arPastDueCents: 0, formKGaps: 0 };
const terms = (partial: Partial<Penalties>): Penalties => ({
	deadlines: 0,
	arrears: 0,
	formK: 0,
	total: 0,
	...partial
});

describe('deadlinePenalty', () => {
	it('counts days from the statement date, not from a stored count', () => {
		expect(deadlinePenalty([{ dueAt: '2026-10-01', severity: 'routine' }], '2026-09-30')).toBe(
			DEADLINE_SOON
		);
		expect(deadlinePenalty([{ dueAt: '2026-10-15', severity: 'routine' }], '2026-09-30')).toBe(0);
		// Two weeks lands inside the window; a day past it does not.
		expect(deadlinePenalty([{ dueAt: '2026-10-14', severity: 'routine' }], '2026-09-30')).toBe(
			DEADLINE_SOON
		);
		expect(deadlinePenalty([{ dueAt: '2026-10-15', severity: 'urgent' }], '2026-09-30')).toBe(
			DEADLINE_URGENT
		);
	});

	it('charges an overdue item the most, whatever the council called it', () => {
		expect(deadlinePenalty([{ dueAt: '2026-09-29', severity: 'routine' }], AS_OF)).toBe(
			DEADLINE_OVERDUE
		);
		expect(deadlinePenalty([{ dueAt: '2026-09-29', severity: 'urgent' }], AS_OF)).toBe(
			DEADLINE_OVERDUE
		);
	});

	it('uses the severity for items still months out, and adds items up', () => {
		expect(deadlinePenalty([{ dueAt: '2027-05-19', severity: 'soon' }], AS_OF)).toBe(DEADLINE_WATCH);
		expect(deadlinePenalty([{ dueAt: '2027-05-19', severity: 'routine' }], AS_OF)).toBe(0);
		expect(
			deadlinePenalty(
				[
					{ dueAt: '2026-09-01', severity: 'routine' },
					{ dueAt: '2026-10-05', severity: 'routine' }
				],
				AS_OF
			)
		).toBe(DEADLINE_OVERDUE + DEADLINE_SOON);
	});

	it('scores the same item differently a month earlier', () => {
		const item: TrackedDeadline[] = [{ dueAt: '2026-10-31', severity: 'routine' }];
		expect(deadlinePenalty(item, '2026-09-30')).toBe(0);
		expect(deadlinePenalty(item, '2026-10-20')).toBe(DEADLINE_SOON);
		expect(deadlinePenalty(item, '2026-11-15')).toBe(DEADLINE_OVERDUE);
	});
});

describe('arrearsPenalty', () => {
	it('starts at the first $250 and stops at the cap', () => {
		expect(arrearsPenalty(0)).toBe(0);
		expect(arrearsPenalty(24_999)).toBe(0);
		expect(arrearsPenalty(25_000)).toBe(1);
		expect(arrearsPenalty(6_499_00)).toBe(AR_CAP);
		expect(arrearsPenalty(99_000_000)).toBe(AR_CAP);
	});

	it('ignores a negative or unusable figure rather than scoring it', () => {
		expect(arrearsPenalty(-500)).toBe(0);
		expect(arrearsPenalty(Number.NaN)).toBe(0);
	});
});

describe('formKPenalty', () => {
	it('charges five a lot and stops at fifteen', () => {
		expect(formKPenalty(0)).toBe(0);
		expect(formKPenalty(1)).toBe(5);
		expect(formKPenalty(2)).toBe(10);
		expect(formKPenalty(3)).toBe(FORM_K_CAP);
		expect(formKPenalty(9)).toBe(FORM_K_CAP);
	});
});

describe('scoreOf', () => {
	it('is 100 less the three terms, and never below zero', () => {
		expect(scoreOf(terms({}))).toBe(100);
		expect(scoreOf(terms({ deadlines: 20, arrears: 25, formK: 15, total: 60 }))).toBe(40);
		expect(scoreOf(terms({ total: 400 }))).toBe(0);
	});

	it('reads all three inputs, not just the calendar', () => {
		const only = healthAt({ tracked: [], arPastDueCents: 0, formKGaps: 2 }, AS_OF);
		expect(only.score).toBe(90);
		const both = healthAt({ tracked: [], arPastDueCents: 2_500_00, formKGaps: 1 }, AS_OF);
		expect(both.penalties).toEqual({ deadlines: 0, arrears: 10, formK: 5, total: 15 });
		expect(both.score).toBe(85);
	});
});

describe('biggestMove', () => {
	it('names the term that grew most, and nothing when nothing grew', () => {
		expect(biggestMove(terms({}), terms({ arrears: 3, total: 3 }))).toEqual({
			key: 'arrears',
			points: 3
		});
		expect(
			biggestMove(terms({ arrears: 17, formK: 5, total: 22 }), terms({ arrears: 25, formK: 15, total: 40 }))
		).toEqual({ key: 'formK', points: 10 });
		expect(biggestMove(terms({ arrears: 5, total: 5 }), terms({ arrears: 5, total: 5 }))).toBeNull();
		// A month that got better does not blame an input.
		expect(biggestMove(terms({ arrears: 5, total: 5 }), terms({ total: 0 }))).toBeNull();
	});
});

describe('trend', () => {
	it('orders the points and chains each mover to the point before it', () => {
		const rows = trend([
			{ period: '2026-09', asOf: '2026-09-30', inputs: { tracked: [], arPastDueCents: 5_000_00, formKGaps: 1 } },
			{ period: '2026-08', asOf: '2026-08-31', inputs: { tracked: [], arPastDueCents: 2_500_00, formKGaps: 0 } }
		]);
		expect(rows.map((row) => row.period)).toEqual(['2026-08', '2026-09']);
		expect(rows[0].score).toBe(90);
		expect(rows[1].score).toBe(75);
		expect(rows[0].moved).toBeNull();
		expect(rows[1].moved).toEqual({ key: 'arrears', points: 10 });
	});
});

describe('the sample book', () => {
	it('computes days left instead of trusting a stored count', () => {
		expect(demoDeadlinesAt(AS_OF).map((item) => item.daysLeft)).toEqual([92, 31, 457]);
		// Nothing is overdue, but council marks the EPR "soon" at 92 days, which is
		// the 4-point watch band — so the calendar costs 4 in every month.
		expect(deadlinePenalty(demoDeadlinesAt(AS_OF), AS_OF)).toBe(4);
	});

	it('counts a Form K only once its two-week window has closed', () => {
		expect(formKGapsAt('2026-06-30')).toBe(0);
		expect(formKGapsAt('2026-07-31')).toBe(1);
		expect(formKGapsAt('2026-08-31')).toBe(1);
		expect(formKGapsAt('2026-09-14')).toBe(1);
		expect(formKGapsAt('2026-09-15')).toBe(3);
	});

	it('ages the standing charges at each month end, without plan balances', () => {
		expect(arrearsAt('2026-04-30')).toBe(355_200);
		expect(arrearsAt('2026-06-30')).toBe(355_200);
		expect(arrearsAt('2026-07-31')).toBe(426_800);
		expect(arrearsAt('2026-09-30')).toBe(649_900);
	});

	it('gives the six fiscal months ending at the statement date', () => {
		expect(trendPeriods(AS_OF)).toEqual([
			'2026-04',
			'2026-05',
			'2026-06',
			'2026-07',
			'2026-08',
			'2026-09'
		]);
	});

	it('scores the book 82 through June, then 74, 72 and 56', () => {
		const rows = healthTrend(AS_OF);
		// The tracked calendar never changes: the EPR is marked soon by council and
		// costs 4 points in every month, so every move in the series is arrears or
		// Form K.
		expect(rows.map((row) => row.penalties.deadlines)).toEqual([4, 4, 4, 4, 4, 4]);
		expect(rows.map((row) => row.score)).toEqual([82, 82, 82, 74, 72, 56]);
		expect(rows.map((row) => row.asOf)).toEqual([
			'2026-04-30',
			'2026-05-31',
			'2026-06-30',
			'2026-07-31',
			'2026-08-31',
			'2026-09-30'
		]);
	});

	it('names what moved it each month, and nothing for the quiet ones', () => {
		const rows = healthTrend(AS_OF);
		expect(rows.slice(0, 3).every((row) => row.moved === null)).toBe(true);
		expect(rows[3].moved).toEqual({ key: 'formK', points: 5 });
		expect(rows[4].moved).toEqual({ key: 'arrears', points: 2 });
		expect(rows[5].moved).toEqual({ key: 'formK', points: 10 });
	});

	it('agrees with the gauge, because it is the same function', () => {
		const now = healthNow(AS_OF);
		const last = healthTrend(AS_OF).at(-1)!;
		expect(now.score).toBe(last.score);
		expect(now.penalties).toEqual(last.penalties);
		expect(now.penalties.arrears).toBe(AR_CAP);
		expect(now.penalties.formK).toBe(FORM_K_CAP);
		expect(now.penalties.deadlines).toBe(4);
	});

	it('opens a month to the charges the score was reading', () => {
		// The detail's own total has to be the arrears term, or the panel is
		// explaining a different number than the one it prints above.
		expect(monthDetail('2026-04-30').pastDueCents).toBe(arrearsAt('2026-04-30'));
		expect(monthDetail('2026-09-30').pastDueCents).toBe(arrearsAt('2026-09-30'));

		const sept = monthDetail('2026-09-30');
		expect(sept.charges.every((charge) => charge.daysLate > 0)).toBe(true);
		// Oldest money first, the way the aging ladder reads.
		const lates = sept.charges.map((charge) => charge.daysLate);
		expect([...lates].sort((a, b) => b - a)).toEqual(lates);
		// The levy lot's November 2025 charge is in every month of the window.
		expect(monthDetail('2026-04-30').charges.some((charge) => charge.unitId === '207' && charge.kind === 'levy')).toBe(true);
	});

	it('lists only the charges dated in the month, as a cut of the same list', () => {
		const sept = monthDetail('2026-09-30');
		// Five of September's ten: the two September fees, the two late fees that
		// followed them, and the fine posted on the 16th.
		expect(sept.datedInMonth).toHaveLength(5);
		expect(sept.datedInMonthCents).toBe(151_500);
		expect(sept.datedInMonth.every((charge) => sept.charges.includes(charge))).toBe(true);
		expect(sept.datedInMonth.every((charge) => charge.due.startsWith('2026-09'))).toBe(true);

		// April's balance was all owing before April opened — the November levy — so
		// the cut is empty and that is the answer, not a missing month.
		const april = monthDetail('2026-04-30');
		expect(april.datedInMonth).toEqual([]);
		expect(april.datedInMonthCents).toBe(0);
		expect(april.pastDueCents).toBe(355_200);
	});

	it('leaves a plan out of the month, as it leaves it out of the score', () => {
		const ids = monthDetail('2026-09-30').charges.map((charge) => charge.unitId);
		expect(ids).not.toContain('108');
		expect(ids).not.toContain('403');
	});

	it('lists a Form K only once its window has closed', () => {
		expect(monthDetail('2026-06-30').formK).toEqual([]);
		expect(monthDetail('2026-07-31').formK.map((row) => row.unitId)).toEqual(['309']);
		expect(monthDetail('2026-09-14').formK.map((row) => row.unitId)).toEqual(['309']);
		const sept = monthDetail('2026-09-30');
		expect(sept.formK.map((row) => row.unitId).sort()).toEqual(['209', '309', '407']);
		// Two weeks from the move-in, then the days since.
		expect(sept.formK.find((row) => row.unitId === '209')?.daysPastWindow).toBe(15);
		expect(sept.formK.find((row) => row.unitId === '309')?.daysPastWindow).toBe(77);
	});

	it('reads the same three inputs the other surfaces report', () => {
		const inputs = inputsAt(AS_OF);
		expect(inputs.arPastDueCents).toBe(649_900);
		expect(inputs.formKGaps).toBe(3);
		expect(inputs.tracked).toHaveLength(3);
		expect(healthAt(noArrears, AS_OF).score).toBe(100);
	});
});

describe('a Form K the council recorded', () => {
	// Lot 309's form arrives on the statement date: the gap closes for September
	// and every month that closed before it keeps the gap it had. This is the one
	// thing a filing must not do — rewrite a month it was not there for.
	const filed = { '309': { filedOn: '2026-09-30', by: 'Recorded on this device' } };

	it('closes the gap from the day it was filed', () => {
		expect(formKGapsAt('2026-09-30', filed)).toBe(2);
		expect(formKGapsAt('2026-08-31', filed)).toBe(1);
		expect(formKGapsAt('2026-09-14', filed)).toBe(1);
	});

	it('takes five points off the month it closed in, and no earlier one', () => {
		const rows = healthTrend(AS_OF, 6, filed);
		expect(rows.map((row) => row.score)).toEqual([82, 82, 82, 74, 72, 61]);
		expect(rows.map((row) => row.penalties.formK)).toEqual([0, 0, 0, 5, 5, 10]);
	});

	it('drops the lot from the month it is filed in, and only that month', () => {
		expect(monthDetail('2026-09-30', filed).formK.map((row) => row.unitId)).toEqual(['209', '407']);
		expect(monthDetail('2026-08-31', filed).formK.map((row) => row.unitId)).toEqual(['309']);
	});

	it('leaves the money alone', () => {
		expect(arrearsAt(AS_OF)).toBe(649_900);
		expect(monthDetail('2026-09-30', filed).pastDueCents).toBe(649_900);
	});

	it('reaches back when the form was dated earlier than it was recorded', () => {
		const early = { '309': { filedOn: '2026-07-20', by: 'Recorded on this device' } };
		expect(formKGapsAt('2026-07-31', early)).toBe(0);
		expect(formKGapsAt('2026-09-30', early)).toBe(2);
	});
});
