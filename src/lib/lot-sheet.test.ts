import { describe, expect, it } from 'vitest';
import { account, billedMonths, forLot, mentionsLot, oldestDays, upcoming } from './lot-sheet';
import { charges } from './demo/arrears';
import { balance, building, monthlyFeeCents, units } from './demo/building';

const AS_OF = building.asOf;
const unit = (id: string) => units.find((candidate) => candidate.id === id)!;
const months = billedMonths(building.fiscalStart, AS_OF);

const sheet = (id: string) =>
	account(charges(AS_OF).filter((charge) => charge.unitId === id), {
		feeCents: monthlyFeeCents(unit(id).entitlement),
		months,
		asOf: AS_OF
	});

describe('billedMonths', () => {
	it('runs from the fiscal year opening to the statement month', () => {
		expect(months).toEqual(['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']);
	});

	it('handles a fiscal year that opens late in the calendar', () => {
		expect(billedMonths('2026-11-01', '2027-01-31')).toEqual(['2026-11', '2026-12', '2027-01']);
	});
});

describe('account', () => {
	it('bills the fiscal months in order and stops at the statement date', () => {
		const lines = sheet('305');
		expect(lines.map((line) => line.date)).toEqual([
			'2026-04-01',
			'2026-05-01',
			'2026-06-01',
			'2026-07-01',
			'2026-08-01',
			'2026-09-01'
		]);
		// October is due on the 1st and is a dated item to come, not a ledger line.
		expect(lines.some((line) => line.date > AS_OF)).toBe(false);
		expect(upcoming(charges(AS_OF).filter((charge) => charge.unitId === '305'), AS_OF)).toHaveLength(1);
	});

	it('shows a cleared month against its payment and leaves the balance at zero', () => {
		const lines = sheet('305');
		expect(lines.every((line) => line.charge === line.cleared)).toBe(true);
		expect(lines.at(-1)?.still).toBe(0);
	});

	it('leaves the months behind open, and the running figure ends on what stands', () => {
		const lines = sheet('207');
		const open = lines.filter((line) => line.charge > line.cleared);
		expect(open.map((line) => line.date)).toContain('2026-07-01');
		expect(open.some((line) => line.date === '2026-06-01')).toBe(false);
		const due = balance(unit('207'));
		expect(lines.at(-1)?.still).toBe(due.arrears + due.late + due.levy);
	});

	it('puts a late fee after the fee it followed, both on their own days', () => {
		const lines = sheet('207');
		const july = lines.findIndex((line) => line.date === '2026-07-01');
		expect(lines[july].kind).toBe('fee');
		expect(lines[july + 1].kind).toBe('late');
		expect(lines[july + 1].date).toBe('2026-07-05');
	});

	it('carries the levy at its own date, ahead of the fiscal year', () => {
		const lines = sheet('207');
		expect(lines[0].kind).toBe('levy');
		expect(lines[0].date).toBe('2025-11-12');
		expect(lines[0].charge).toBe(355_200);
	});

	it('never lets the running figure fall except by a cleared line', () => {
		for (const id of ['104', '207', '305', '309']) {
			const lines = sheet(id);
			for (let index = 1; index < lines.length; index += 1) {
				const previous = lines[index - 1];
				const line = lines[index];
				expect(line.still, `${id} ${line.date}`).toBe(
					previous.still + line.charge - line.cleared
				);
			}
		}
	});

	it('agrees with the ladder about what is past due', () => {
		const lines = sheet('104');
		expect(lines.at(-1)?.still).toBe(balance(unit('104')).arrears + balance(unit('104')).late);
		expect(oldestDays(charges(AS_OF).filter((charge) => charge.unitId === '104'), AS_OF)).toBe(29);
	});
});

describe('mentionsLot', () => {
	it('finds a lot named on its own', () => {
		expect(mentionsLot('Council — lien vote, lot 207', '207')).toBe(true);
		expect(mentionsLot('Council — lien vote, lot 207', '201')).toBe(false);
	});

	it('finds a lot inside a list of lots', () => {
		const line = 'Lots 201, 309, and 404 are the ones to warn.';
		expect(mentionsLot(line, '404')).toBe(true);
		expect(mentionsLot(line, '305')).toBe(false);
	});

	it('is not fooled by other three-digit numbers on the line', () => {
		expect(mentionsLot('Fine of $300 a day, capped at 309 dollars', '309')).toBe(false);
		expect(mentionsLot('Form B, 7 days, lot 201', '201')).toBe(true);
	});
});

describe('forLot', () => {
	const items = [
		{ date: '2026-10-05', title: 'Form B due — lot 201', detail: 'Harbour Notary asked on September 28.' },
		{ date: '2026-10-20', title: 'Council — lien vote, lot 207', detail: 'The lawyer is preparing a lien.' },
		{ date: '2026-09-01', title: 'Past item for lot 201', detail: 'Already happened.' },
		{ date: '2027-03-31', title: 'Speculation and vacancy tax', detail: 'Have dates ready for lots 106, 201, 309, 404, and 406.' }
	];

	it('keeps only the items that name the lot and are still ahead', () => {
		expect(forLot(items, '201', AS_OF).map((item) => item.date)).toEqual([
			'2026-10-05',
			'2027-03-31'
		]);
	});

	it('reads the detail as well as the title, soonest first', () => {
		expect(forLot(items, '207', AS_OF).map((item) => item.title)).toEqual([
			'Council — lien vote, lot 207'
		]);
	});

	it('returns nothing for a lot nothing is dated for, and respects the limit', () => {
		expect(forLot(items, '305', AS_OF)).toEqual([]);
		expect(forLot(items, '406', AS_OF, 1)).toHaveLength(1);
	});
});
