import { describe, expect, it } from 'vitest';
import { payrollSheet, remittanceDay, type PayrollRecord } from './payroll-sheet';
import { books, payroll, payrollRates } from './demo/books';

const record: PayrollRecord = {
	employee: payroll.employee,
	role: payroll.role,
	periodLabel: 'September 2026',
	payDate: payroll.payDateIso,
	dueDate: payroll.dueIso,
	hours: payroll.hours,
	rateCents: payroll.rateCents,
	grossCents: payroll.gross,
	eiEmployeeCents: payroll.eiEmployee,
	cppEmployeeCents: payroll.cppEmployee,
	eiEmployerCents: payroll.eiEmployer,
	cppEmployerCents: payroll.cppEmployer,
	netCents: payroll.net,
	remittanceCents: payroll.remittance,
	postedWagesCents: books.expenses.find((line) => line.code === '6210')!.ytdCents,
	postedEmployerCents: books.expenses.find((line) => line.code === '6215')!.ytdCents,
	td1OnFile: true,
	rates: payrollRates,
	asOf: '2026-09-30'
};

describe('payrollSheet', () => {
	it('recomputes the pay the books carry', () => {
		const sheet = payrollSheet(record);

		expect(sheet.grossCents).toBe(96_000);
		expect(sheet.eiEmployeeCents).toBe(1_565);
		expect(sheet.cppEmployeeCents).toBe(3_977);
		expect(sheet.netCents).toBe(90_458);
		expect(sheet.employerCents).toBe(6_168);
		expect(sheet.remittanceCents).toBe(11_710);
		expect(sheet.costCents).toBe(102_168);
		expect(sheet.balanced).toBe(true);
	});

	it('adds the two expense lines back to the cost of the pay', () => {
		const sheet = payrollSheet(record);

		expect(sheet.wageLineAgrees).toBe(true);
		expect(sheet.employerLineAgrees).toBe(true);
		expect(sheet.postedWagesCents + sheet.postedEmployerCents).toBe(sheet.costCents);
	});

	it('takes the remittance day from the pay date', () => {
		const sheet = payrollSheet(record);

		expect(remittanceDay('2026-09-30')).toBe('2026-10-15');
		expect(remittanceDay('2026-12-31')).toBe('2027-01-15');
		expect(sheet.dueFromPayDate).toBe('2026-10-15');
		expect(sheet.dueMatches).toBe(true);
		expect(sheet.daysToDue).toBe(15);
	});

	it('prints a net that does not add back as a defect', () => {
		const sheet = payrollSheet({ ...record, netCents: 90_500 });

		expect(sheet.netMatches).toBe(false);
		expect(sheet.balanced).toBe(false);
		expect(sheet.netCents).toBe(90_458);
	});

	it('catches an employer share that did not carry the multiplier', () => {
		const sheet = payrollSheet({ ...record, eiEmployerCents: 1_565 });

		expect(sheet.employerEiMatches).toBe(false);
		expect(sheet.balanced).toBe(false);
		expect(payrollSheet({ ...record, cppEmployerCents: 3_900 }).employerCppMatches).toBe(false);
	});

	it('will not call an unconfirmed rate basis ready to file', () => {
		const sheet = payrollSheet(record);

		expect(sheet.rates.confirmed).toBe(false);
		expect(sheet.readyToFile).toBe(false);
		expect(payrollSheet({ ...record, rates: { ...payrollRates, confirmed: true } }).readyToFile).toBe(
			true
		);
	});

	it('states that no income tax is withheld and annualises the wage', () => {
		const sheet = payrollSheet(record);

		expect(sheet.incomeTaxWithheld).toBe(false);
		expect(sheet.td1OnFile).toBe(true);
		expect(sheet.annualisedCents).toBe(1_152_000);
	});
});
