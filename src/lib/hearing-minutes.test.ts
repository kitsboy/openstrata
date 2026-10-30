import { describe, expect, it } from 'vitest';
import { fineRegister, fineRow, type BylawFine } from './fine-register';
import { hearingMinutes } from './hearing-minutes';
import { bylawFines } from './demo/fines';
import { building, formF, getUnit } from './demo/building';

const register = fineRegister(bylawFines, building.asOf);
const row = register.rows[0];

/** The minute of the meeting that heard the fine, with the demo's own numbers. */
const base = {
	row,
	meetingIso: '2026-09-15',
	asOf: building.asOf,
	seats: 5,
	quorum: 3,
	chair: 'Owen MacLeod',
	formFWithheld: formF(getUnit('309')) === 'withheld'
};

/**
 * The minute a lawyer, an adjudicator or a buyer's notary asks for.
 *
 * The register already decides whether the process holds; the minute adds the
 * meeting — was there a quorum, did the motion carry, what did the lot's account
 * carry afterwards. A record that showed a fine after a lost vote or an
 * inquorate meeting would be the most damaging kind of wrong, so each of those
 * prints no amount at all.
 */
describe('hearingMinutes', () => {
	it('records the decision the register and the minutes agree on', () => {
		const minute = hearingMinutes(base);

		expect(minute.valid).toBe(true);
		expect(minute.defect).toBeNull();
		expect(minute.reference).toBe('OS-BM-2026-09');
		expect(minute.fineCents).toBe(20_000);
		expect(minute.postedIso).toBe('2026-09-16');
		expect(minute.owingCents).toBe(20_000);
		expect(minute.formFWithheld).toBe(true);
	});

	it('counts the vote with abstentions outside the denominator', () => {
		const minute = hearingMinutes(base);

		expect(minute.vote).toEqual({ yes: 4, no: 0, abstain: 1 });
		expect(minute.denominator).toBe(4);
		expect(minute.present).toBe(5);
		expect(minute.quorate).toBe(true);
		expect(minute.carried).toBe(true);
	});

	it('has no minute of a decision dated before the hearing', () => {
		const minute = hearingMinutes({ ...base, meetingIso: '2026-09-10' });

		expect(minute.valid).toBe(false);
		expect(minute.defect).toBe('not-heard');
		expect(minute.fineCents).toBeNull();
		expect(minute.owingCents).toBe(0);
		expect(minute.formFWithheld).toBe(false);
	});

	it('imposes nothing when the vote was taken without quorum', () => {
		const minute = hearingMinutes({ ...base, quorum: 6 });

		expect(minute.quorate).toBe(false);
		expect(minute.carried).toBe(false);
		expect(minute.defect).toBe('no-quorum');
		expect(minute.fineCents).toBeNull();
	});

	it('imposes nothing when the motion did not carry', () => {
		const lost: BylawFine = { ...bylawFines[0], votes: { yes: 2, no: 3, abstain: 0 } };
		const minute = hearingMinutes({ ...base, row: fineRow(lost, building.asOf) });

		expect(minute.carried).toBe(false);
		expect(minute.defect).toBe('vote');
		expect(minute.fineCents).toBeNull();
		expect(minute.postedIso).toBeNull();
	});

	it('names the register’s own defect rather than recording a fine', () => {
		const early: BylawFine = { ...bylawFines[0], hearingIso: '2026-09-08' };
		const minute = hearingMinutes({ ...base, row: fineRow(early, building.asOf) });

		expect(minute.processDefect).toBe('window');
		expect(minute.defect).toBe('process');
		expect(minute.fineCents).toBeNull();
		expect(minute.owingCents).toBe(0);
	});

	it('prints the vote it was given, whatever the outcome', () => {
		const minute = hearingMinutes({ ...base, quorum: 6 });

		expect(minute.vote).toEqual({ yes: 4, no: 0, abstain: 1 });
		expect(minute.seats).toBe(5);
		expect(minute.quorum).toBe(6);
	});
});
