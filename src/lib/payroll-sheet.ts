/**
 * The month's payroll, as the remittance worksheet a treasurer files from.
 *
 * The books carry one employee and one month of pay. A worksheet is what turns
 * those figures into something a council can check and a treasurer can act on,
 * so this module recomputes what it can and prints every place the record and
 * the arithmetic disagree. Six rules:
 *
 * 1. **Gross is hours times rate.** The figure on the wage line is checked
 *    against the timesheet rather than trusted, because a rate change entered in
 *    one place and not the other is the ordinary payroll mistake.
 *
 * 2. **The net is what is left, not what was typed.** Net equals gross less the
 *    employee's two deductions. A recorded net that does not match prints as a
 *    defect beside the computed one.
 *
 * 3. **The remittance is both shares.** The employee's CPP and EI plus the
 *    employer's CPP and EI are what goes to the CRA, and the total is checked
 *    against the payable the books carry. Nothing else is withheld: there is no
 *    income tax in this record, and the sheet says so and says why rather than
 *    leaving a blank a reader might read as an omission.
 *
 * 4. **The employer's share is computed, not assumed.** Employer EI is the
 *    employee's premium times the multiplier the books use (1.4), and employer
 *    CPP equals the employee's. Both are checks, so a rate that changed in the
 *    record but was not carried into the employer's line shows up.
 *
 * 5. **The cost to the building is wages plus the employer's share**, and it is
 *    the sum of the two expense lines' year to date. The worksheet's job is to
 *    show the building's own cost beside the employee's take-home, which are two
 *    very different numbers.
 *
 * 6. **A rate basis the books call unconfirmed cannot be filed from.** The
 *    sample pay was computed on the 2025 CPP structure (5.95% with the $3,500
 *    exemption) and the books themselves ask for the current T4127 tables before
 *    the remittance. The worksheet prints that caveat and refuses to call itself
 *    ready while the basis is unconfirmed.
 */

import { daysBetween } from './arrears';

/** The 15th of the month after the pay date: the regular remittance day. */
export function remittanceDay(payDate: string): string {
	const date = new Date(`${payDate}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return payDate;
	const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 15));
	return next.toISOString().slice(0, 10);
}

export interface PayrollRates {
	/** Employee EI, in basis points of insurable earnings. */
	eiEmployeeBps: number;
	/** The employer's EI multiple of the employee's premium. */
	eiEmployerMultiplier: number;
	/** Employee CPP, in basis points of pensionable earnings. */
	cppBps: number;
	/** The basic exemption applied to this pay, in cents. */
	cppExemptCents: number;
	/** The year whose tables the books used, e.g. `2025`. */
	rateYear: string;
	/** False when the books flag the basis as needing confirmation. */
	confirmed: boolean;
}

export interface PayrollRecord {
	employee: string;
	role: string;
	/** The pay period as the books name it, e.g. `September 2026`. */
	periodLabel: string;
	payDate: string;
	/** The day the record says the remittance is due. */
	dueDate: string;
	hours: number;
	rateCents: number;
	/** The gross the wage line carries. */
	grossCents: number;
	eiEmployeeCents: number;
	cppEmployeeCents: number;
	eiEmployerCents: number;
	cppEmployerCents: number;
	/** The net the record pays. */
	netCents: number;
	/** The payable the books carry for the remittance. */
	remittanceCents: number;
	/** The wage line's year to date. */
	postedWagesCents: number;
	/** The employer-share line's year to date. */
	postedEmployerCents: number;
	/** True when a TD1 is on file; the books do not carry it, only its existence. */
	td1OnFile: boolean;
	rates: PayrollRates;
	/** The statement date the days are counted from. */
	asOf: string;
}

export interface PayrollSheet {
	employee: string;
	role: string;
	periodLabel: string;
	payDate: string;
	dueDate: string;
	/** The day the pay date implies, computed here. */
	dueFromPayDate: string;
	dueMatches: boolean;
	/** Whole days from the statement date to the due date; negative when late. */
	daysToDue: number;
	hours: number;
	rateCents: number;
	/** Hours × rate. */
	grossCents: number;
	grossMatches: boolean;
	eiEmployeeCents: number;
	cppEmployeeCents: number;
	employeeDeductionsCents: number;
	netCents: number;
	netMatches: boolean;
	eiEmployerCents: number;
	cppEmployerCents: number;
	employerCents: number;
	remittanceCents: number;
	remittanceMatches: boolean;
	/** Wages plus the employer's share: what the building spends. */
	costCents: number;
	postedWagesCents: number;
	postedEmployerCents: number;
	wageLineAgrees: boolean;
	employerLineAgrees: boolean;
	employerEiMatches: boolean;
	employerCppMatches: boolean;
	/** Gross annualised at twelve pays, for the tax question below. */
	annualisedCents: number;
	/** This record withholds no income tax; the worksheet says so. */
	incomeTaxWithheld: boolean;
	td1OnFile: boolean;
	rates: PayrollRates;
	/** Every arithmetic check passed. */
	balanced: boolean;
	/** Balanced and on a rate basis the books call confirmed. */
	readyToFile: boolean;
}

/** The worksheet. Every figure is recomputed; the record's own is kept for the checks. */
export function payrollSheet(record: PayrollRecord): PayrollSheet {
	const grossCents = Math.round(record.hours * record.rateCents);
	const employeeDeductionsCents = record.eiEmployeeCents + record.cppEmployeeCents;
	const netCents = grossCents - employeeDeductionsCents;
	const employerCents = record.eiEmployerCents + record.cppEmployerCents;
	const remittanceCents = employeeDeductionsCents + employerCents;
	const dueFromPayDate = remittanceDay(record.payDate);

	const grossMatches = grossCents === record.grossCents;
	const netMatches = netCents === record.netCents;
	const remittanceMatches = remittanceCents === record.remittanceCents;
	const wageLineAgrees = record.postedWagesCents === grossCents;
	const employerLineAgrees = record.postedEmployerCents === employerCents;
	const employerEiMatches =
		record.eiEmployerCents === Math.round(record.eiEmployeeCents * record.rates.eiEmployerMultiplier);
	const employerCppMatches = record.cppEmployerCents === record.cppEmployeeCents;
	const dueMatches = dueFromPayDate === record.dueDate;

	const balanced =
		grossMatches &&
		netMatches &&
		remittanceMatches &&
		wageLineAgrees &&
		employerLineAgrees &&
		employerEiMatches &&
		employerCppMatches &&
		dueMatches;

	return {
		employee: record.employee,
		role: record.role,
		periodLabel: record.periodLabel,
		payDate: record.payDate,
		dueDate: record.dueDate,
		dueFromPayDate,
		dueMatches,
		daysToDue: daysBetween(record.asOf, record.dueDate),
		hours: record.hours,
		rateCents: record.rateCents,
		grossCents,
		grossMatches,
		eiEmployeeCents: record.eiEmployeeCents,
		cppEmployeeCents: record.cppEmployeeCents,
		employeeDeductionsCents,
		netCents,
		netMatches,
		eiEmployerCents: record.eiEmployerCents,
		cppEmployerCents: record.cppEmployerCents,
		employerCents,
		remittanceCents,
		remittanceMatches,
		costCents: grossCents + employerCents,
		postedWagesCents: record.postedWagesCents,
		postedEmployerCents: record.postedEmployerCents,
		wageLineAgrees,
		employerLineAgrees,
		employerEiMatches,
		employerCppMatches,
		annualisedCents: grossCents * 12,
		// The books withhold nothing but CPP and EI for this employee; there is no
		// income tax field to be empty, and the sheet states the fact.
		incomeTaxWithheld: false,
		td1OnFile: record.td1OnFile,
		rates: record.rates,
		balanced,
		readyToFile: balanced && record.rates.confirmed
	};
}
