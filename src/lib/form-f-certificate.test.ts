import { describe, expect, it } from 'vitest';
import { charges } from './demo/arrears';
import { building, formF, getUnit, monthlyFeeCents, units } from './demo/building';
import { formFCertificate } from './form-f-certificate';

const asOf = building.asOf;
const issue = (id: string, issued?: string) =>
	formFCertificate(getUnit(id), charges(asOf), asOf, issued);

describe('the Form F certificate', () => {
	it('withholds for lot 309 on its unpaid fine, and nothing else', () => {
		const cert = issue('309');
		expect(cert.state).toBe('withheld');
		expect(cert.owingCents).toBe(20_000);
		expect(cert.owing).toEqual([
			{ kind: 'fine', due: '2026-09-16', cents: 20_000 }
		]);
		expect(cert.withheldFor).toEqual(['fine']);
	});

	it('issues a clear certificate for lot 305, whose October fee is not yet due', () => {
		const cert = issue('305');
		expect(cert.state).toBe('issued');
		expect(cert.owingCents).toBe(0);
		expect(cert.owing).toEqual([]);
		expect(cert.next?.kind).toBe('fee');
		expect(cert.next?.cents).toBe(monthlyFeeCents(getUnit('305').entitlement));
		// The next fee is printed but never counted: the sale is not blocked by it.
		expect(cert.next!.due > cert.asOf).toBe(true);
	});

	it('names every kind lot 207 owes, oldest first', () => {
		const unit = getUnit('207');
		const cert = issue('207');
		const fee = monthlyFeeCents(unit.entitlement);
		expect(cert.state).toBe('withheld');
		expect(cert.owingCents).toBe(
			fee * unit.feeArrearsMonths + unit.lateOwing + unit.levyOwing
		);
		expect(cert.withheldFor).toEqual(['fee', 'late', 'levy']);
		const dates = cert.owing.map((line) => line.due);
		expect([...dates].sort()).toEqual(dates);
	});

	it('agrees with the lot’s own Form F rule on all forty lots', () => {
		for (const unit of units) {
			const cert = formFCertificate(unit, charges(asOf), asOf);
			expect(cert.state, `${unit.id} state`).toBe(
				formF(unit) === 'withheld' ? 'withheld' : 'issued'
			);
			expect(cert.state === 'withheld', `${unit.id} owes`).toBe(cert.owingCents > 0);
		}
	});

	it('never dates a certificate before the books it quotes', () => {
		const early = issue('305', '2026-09-01');
		expect(early.issued).toBe(asOf);
		// A later issue date is kept, and the balance still comes from the close.
		const later = issue('309', '2026-10-04');
		expect(later.issued).toBe('2026-10-04');
		expect(later.asOf).toBe(asOf);
	});

	it('carries the lot and the month in its reference, and Form B’s seven days', () => {
		const cert = issue('309', '2026-10-04');
		expect(cert.reference).toBe('OS-FF-2026-10-309');
		expect(cert.deliverBy).toBe('2026-10-11');
	});
});
