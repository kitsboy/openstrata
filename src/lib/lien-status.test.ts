import { describe, expect, it } from 'vitest';
import { lotLienStatus } from './demo/lien';
import { formF, units } from './demo/building';
import { lienStatus, type LienInput } from './lien-status';

/** Lot 207's file at the close, built from the same records the sheet reads. */
const file = lotLienStatus('207');

if (!file) throw new Error('lot 207 should have a lien file');

const base: LienInput = {
	unitId: '207',
	owner: 'Ruth Adelakun',
	asOf: '2026-09-30',
	demandIso: '2026-08-20',
	opinionIso: '2026-09-15',
	voteIso: '2026-10-20',
	voteOutcome: null,
	registrationIso: null,
	parts: {
		feesCents: 199_800,
		lateCents: 15_000,
		levyCents: 355_200,
		fineCents: 0,
		notYetDueCents: 66_600,
		notYetDueIso: '2026-10-01'
	},
	legal: { spentCents: 185_000, budgetCents: 540_000 },
	formFWithheld: true,
	seats: 5,
	quorum: 3
};

describe('lienStatus', () => {
	it('takes the file from the records that already carry the dates', () => {
		expect(file.reference).toBe('OS-LN-2026-09-207');
		expect(file.asOf).toBe('2026-09-30');
		expect(file.owner).toBe('Ruth Adelakun');
		expect(file.daysSinceDemand).toBe(41);
	});

	it('secures money that has fallen due and prints the next fee apart', () => {
		expect(file.securedCents).toBe(570_000);
		expect(file.notYetDueCents).toBe(66_600);
		expect(file.parts.feesCents).toBe(199_800);
		expect(file.parts.levyCents).toBe(355_200);
		// The next fee's own day, so the sentence cannot date it with the wrong month.
		expect(file.notYetDueIso).toBe('2026-10-01');
		// The lot's whole balance is the debt plus the fee that is not due yet.
		const unit = units.find((row) => row.id === '207');
		expect(unit).toBeTruthy();
	});

	it('does not call a vote a lien', () => {
		expect(file.registered).toBe(false);
		expect(file.registrationIso).toBeNull();
		expect(file.voteHeld).toBe(false);
		expect(file.voteAheadDays).toBe(20);
		expect(file.nextStep).toBe('vote');
	});

	it('registers only after a vote to file and a recorded registration', () => {
		const voted = lienStatus({
			...base,
			voteOutcome: 'file',
			registrationIso: '2026-11-04'
		});
		const refused = lienStatus({
			...base,
			voteOutcome: 'decline',
			registrationIso: '2026-11-04'
		});

		expect(voted.registered).toBe(true);
		expect(voted.registrationIso).toBe('2026-11-04');
		expect(voted.steps.at(-1)).toEqual({
			key: 'registration',
			dateIso: '2026-11-04',
			state: 'ahead',
			days: 35
		});
		// A council that voted against filing cannot have a lien on the title.
		expect(refused.registered).toBe(false);
		expect(refused.registrationIso).toBeNull();
		expect(refused.steps.at(-1)?.state).toBe('waiting');
	});

	it('waits on a step that has no day instead of scheduling one', () => {
		const noOpinion = lienStatus({ ...base, opinionIso: null });

		expect(noOpinion.steps[1]).toEqual({
			key: 'opinion',
			dateIso: null,
			state: 'waiting',
			days: null
		});
		expect(noOpinion.nextStep).toBe('opinion');
	});

	it('refuses a vote dated before the demand that supports it', () => {
		const early = lienStatus({ ...base, voteIso: '2026-08-01' });

		expect(early.inOrder).toBe(false);
		expect(early.issuable).toBe(false);
		expect(early.defect).toBe('sequence');
		expect(file.inOrder).toBe(true);
	});

	it('refuses a page for a lot with nothing owing', () => {
		const settled = lienStatus({
			...base,
			parts: { ...base.parts, feesCents: 0, lateCents: 0, levyCents: 0 }
		});

		expect(settled.securedCents).toBe(0);
		expect(settled.issuable).toBe(false);
		expect(settled.defect).toBe('settled');
	});

	it('never adds legal spend to the amount a lien would secure', () => {
		const dear = lienStatus({
			...base,
			legal: { spentCents: 540_000, budgetCents: 540_000 }
		});

		expect(dear.securedCents).toBe(570_000);
		expect(dear.legal.spentCents).toBe(540_000);
	});

	it('reports the Form F state the lot’s own rule produces', () => {
		const unit = units.find((row) => row.id === '207');
		expect(unit).toBeTruthy();
		expect(formF(unit!)).toBe('withheld');
		expect(file.formFWithheld).toBe(true);
	});
});
