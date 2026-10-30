import { describe, expect, it } from 'vitest';
import { charges } from './demo/arrears';
import { building } from './demo/building';
import { bylawFines } from './demo/fines';
import { fineRegister, fineRow, type BylawFine } from './fine-register';

const asOf = building.asOf;
const lot309 = bylawFines[0];

const copy = (change: Partial<BylawFine>): BylawFine => ({ ...lot309, ...change });

describe('the bylaw fine register', () => {
	it('reads lot 309 from its notice to its unpaid posting', () => {
		const row = fineRow(lot309, asOf);
		expect(row.windowCloses).toBe('2026-09-12');
		expect(row.windowMet).toBe(true);
		expect(row.carried).toBe(true);
		expect(row.defect).toBeNull();
		expect(row.status).toBe('unpaid');
		expect(row.owingCents).toBe(20_000);
		// Posted 16 September and standing at the 30 September close.
		expect(row.daysOwing).toBe(14);
		expect(row.aboveCeiling).toBe(false);
	});

	it('adds to the books’ own fine charges', () => {
		const register = fineRegister(bylawFines, asOf);
		const onBooks = charges(asOf)
			.filter((charge) => charge.kind === 'fine')
			.reduce((sum, charge) => sum + charge.cents, 0);
		expect(register.owingCents).toBe(onBooks);
		expect(register).toMatchObject({
			fines: 1,
			leviedCents: 20_000,
			paidCents: 0,
			owingCents: 20_000,
			unpaid: 1,
			defects: 0
		});
		expect(register.leviedCents).toBe(register.paidCents + register.owingCents);
	});

	it('does not count a fine heard before the fourteen days closed', () => {
		const row = fineRow(copy({ hearingIso: '2026-09-10' }), asOf);
		expect(row.windowMet).toBe(false);
		expect(row.defect).toBe('window');
		expect(row.status).toBe('unposted');
		expect(row.owingCents).toBe(0);
	});

	it('does not count a fine that did not carry, because abstentions are ignored', () => {
		const row = fineRow(copy({ votes: { yes: 1, no: 1, abstain: 3 } }), asOf);
		expect(row.carried).toBe(false);
		expect(row.defect).toBe('vote');
		expect(row.owingCents).toBe(0);
	});

	it('does not count a fine posted before the vote was taken', () => {
		const row = fineRow(copy({ postedIso: '2026-09-14' }), asOf);
		expect(row.defect).toBe('posting');
		expect(row.owingCents).toBe(0);
	});

	it('treats payment as a date, so a payment after the close leaves it standing', () => {
		const after = fineRow(copy({ paidIso: '2026-10-02' }), asOf);
		expect(after.status).toBe('unpaid');
		expect(after.owingCents).toBe(20_000);

		const atClose = fineRow(copy({ paidIso: '2026-09-30' }), asOf);
		expect(atClose.status).toBe('paid');
		expect(atClose.owingCents).toBe(0);

		const register = fineRegister([copy({ paidIso: '2026-09-30' })], asOf);
		expect(register).toMatchObject({ paidCents: 20_000, owingCents: 0, unpaid: 0 });
	});

	it('flags a fine above the bylaw’s own ceiling for the days proven', () => {
		const row = fineRow(copy({ cents: 40_000 }), asOf);
		expect(row.aboveCeiling).toBe(true);
		const twoDays = fineRow(copy({ cents: 40_000, days: 2 }), asOf);
		expect(twoDays.aboveCeiling).toBe(false);
	});
});
