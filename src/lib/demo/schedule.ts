export type CalCategory = 'fees' | 'council' | 'cra' | 'bc-tax' | 'maintenance' | 'insurance' | 'compliance' | 'payroll';

export interface CalEvent {
	date: string;
	title: string;
	category: CalCategory;
	detail: string;
}

export const categoryMeta: Record<CalCategory, { label: string; dot: string; pill: string }> = {
	fees: { label: 'Fees', dot: 'bg-brand-500', pill: 'bg-brand-50 text-brand-800' },
	council: { label: 'Council', dot: 'bg-bc-blue', pill: 'bg-blue-50 text-bc-blue' },
	cra: { label: 'CRA', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-800' },
	'bc-tax': { label: 'BC & City tax', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-900' },
	maintenance: { label: 'Maintenance', dot: 'bg-bc-green', pill: 'bg-emerald-50 text-emerald-900' },
	insurance: { label: 'Insurance', dot: 'bg-bitcoin', pill: 'bg-orange-50 text-orange-900' },
	compliance: { label: 'Compliance', dot: 'bg-fuchsia-500', pill: 'bg-fuchsia-50 text-fuchsia-900' },
	payroll: { label: 'Payroll', dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-900' }
};

function iso(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function thirdTuesday(year: number, month: number): Date {
	const first = new Date(year, month - 1, 1);
	const add = (2 - first.getDay() + 7) % 7;
	return new Date(year, month - 1, 1 + add + 14);
}

function lastBusinessDay(year: number, month: number): Date {
	const date = new Date(year, month, 0);
	while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() - 1);
	return date;
}

function onOrAfterBusinessDay(year: number, month: number, day: number): Date {
	const date = new Date(year, month - 1, day);
	while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
	return date;
}

function monthRange(): Array<{ year: number; month: number }> {
	const out: Array<{ year: number; month: number }> = [];
	for (let year = 2026, month = 4; year < 2027 || (year === 2027 && month <= 5); ) {
		out.push({ year, month });
		month += 1;
		if (month === 13) {
			month = 1;
			year += 1;
		}
	}
	return out;
}

const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function generated(): CalEvent[] {
	const events: CalEvent[] = [];
	for (const { year, month } of monthRange()) {
		const label = `${monthName[month - 1]} ${year}`;
		const due = new Date(year, month - 1, 1);
		events.push({
			date: iso(due),
			title: `${label} strata fees due`,
			category: 'fees',
			detail: 'Due on the 1st even if it is a weekend. Reference is LMS2847, the lot, and the year-month. PAD lots settle on this day.'
		});
		events.push({
			date: iso(new Date(year, month - 1, 5)),
			title: 'Late fee attaches',
			category: 'fees',
			detail: '$50 on any lot that is still short. The fee is automatic. Council does not vote it lot by lot.'
		});
		const council = thirdTuesday(year, month);
		events.push({
			date: iso(council),
			title: 'Council meeting',
			category: 'council',
			detail: 'Amenity room, 7:00–8:30 pm, hybrid. Package goes out the Friday before. Quorum is 3 of 5.'
		});
		events.push({
			date: iso(lastBusinessDay(year, month)),
			title: 'Bank reconciliation',
			category: 'fees',
			detail: 'Three accounts: operating, CRF, and the parkade levy. The treasurer signs the rec. Unmatched payments sit in suspense until they are assigned to a lot.'
		});
	}

	for (let index = 0; index < 7; index += 1) {
		const date = new Date(2026, 9 + index, 1);
		const due = onOrAfterBusinessDay(date.getFullYear(), date.getMonth() + 1, 15);
		const paid = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		events.push({
			date: iso(due),
			title: 'Payroll remittance checkpoint',
			category: 'payroll',
			detail: `Source deductions for ${monthName[paid.getMonth()]} ${paid.getFullYear()}. A new employer is often quarterly. This council plans to remit monthly. Read the RP letter: if CRA says quarterly, September waits until January 15, 2027 instead of October 15.`
		});
	}
	return events;
}

const oneOffs: CalEvent[] = [
	{
		date: '2026-09-15',
		title: 'Council — bylaw hearing, lot 309',
		category: 'council',
		detail: 'Fine of $200 passed. Minutes are on the Meetings page. The generated council row for this date is the same meeting.'
	},
	{
		date: '2026-09-30',
		title: 'T2 and T1044 due',
		category: 'cra',
		detail: 'For the year ended March 31, 2026. Tax payable is zero. File both anyway. The T1044 penalty does not care that tax is zero.'
	},
	{
		date: '2026-09-30',
		title: 'Concierge payday',
		category: 'payroll',
		detail: 'Samira El-Masri, September, net pay from operating. Source deductions stay on the books until they are remitted.'
	},
	{
		date: '2026-10-03',
		title: 'Lot 104 promised payment',
		category: 'fees',
		detail: 'Chidi Okonkwo said the September e-transfer would arrive today. If it does not, the lot is still one month behind plus the late fee.'
	},
	{
		date: '2026-10-05',
		title: 'Form B due — lot 201',
		category: 'compliance',
		detail: 'Harbour Notary asked on September 28. One week. Form F can be issued with it. The lot is clear.'
	},
	{
		date: '2026-10-08',
		title: 'Fire inspection',
		category: 'maintenance',
		detail: 'Coast Fire Protection, 9:00 am, lobby. Caretaker brings the panel keys. Owners do not need to be home.'
	},
	{
		date: '2026-10-20',
		title: 'Council — lien vote, lot 207',
		category: 'council',
		detail: 'Also on the agenda: release the T2, EPR progress, insurance appraisal, and the October receivable list. Same night as the regular third Tuesday.'
	},
	{
		date: '2026-10-22',
		title: 'Insurance appraisal',
		category: 'insurance',
		detail: 'Appraiser walks the common property. Needed before the broker markets the April 1, 2027 renewal. Water deductible is $25,000. Quake deductible is 10%.'
	},
	{
		date: '2026-11-04',
		title: 'Elevator safety inspection',
		category: 'maintenance',
		detail: 'Richmond Elevator. Post the shutdown notice 48 hours ahead. Budget for a half-day outage.'
	},
	{
		date: '2026-11-12',
		title: 'Levy anniversary and gutter day',
		category: 'maintenance',
		detail: 'Parkade levy was approved November 12, 2025. Gutters, roof drains, and dryer vents are the same week.'
	},
	{
		date: '2026-12-15',
		title: 'EPR draft to council',
		category: 'compliance',
		detail: 'Metro Energy Advisors delivers the draft. Filing deadline is December 31. Missing it is disclosed on Form B.'
	},
	{
		date: '2026-12-31',
		title: 'EPR 2026 deadline',
		category: 'compliance',
		detail: 'Metro Vancouver energy performance report. $4,200 of a $6,500 budget is spent. EV load study is already done.'
	},
	{
		date: '2027-01-15',
		title: 'GST small-supplier review',
		category: 'cra',
		detail: 'Add up anything that was not an exempt residential supply. Under $30,000, and not registered, means no GST on fees. A rooftop antenna would change this meeting.'
	},
	{
		date: '2027-01-15',
		title: 'Quarterly payroll date, if CRA assigned it',
		category: 'payroll',
		detail: 'Only if the RP letter says quarterly. Otherwise the monthly 15ths already covered September through December.'
	},
	{
		date: '2027-01-20',
		title: 'Insurance marketing starts',
		category: 'insurance',
		detail: 'Send the appraisal, the loss history, and the levy status to Harbour Insurance Brokers. Renewal is April 1.'
	},
	{
		date: '2027-02-02',
		title: 'Empty Homes Tax — working due date',
		category: 'bc-tax',
		detail: 'Last cycle was due February 3, 2026. Replace this date when the City posts the next bylaw notice. Lots 201, 309, and 404 are the ones to warn.'
	},
	{
		date: '2027-02-28',
		title: 'T4 and T4A due',
		category: 'cra',
		detail: 'T4 for Samira. T4A for contractors at or over $500 for services. The caretaker, the accountant, and the lawyer are the likely slips. File even if you also gave them invoices.'
	},
	{
		date: '2027-03-31',
		title: 'Speculation and vacancy tax declarations due',
		category: 'bc-tax',
		detail: 'Owners declare. The strata does not pay SVT. Have occupancy dates ready for lots 106, 201, 309, 404, and 406. Tax, if any, is due the first business day of July.'
	},
	{
		date: '2027-03-31',
		title: 'Fiscal year end',
		category: 'fees',
		detail: 'Cut off the three bank accounts. Count prepaid fees as a liability, not as next year’s income. CRF interest stays in the CRF.'
	},
	{
		date: '2027-04-01',
		title: 'Insurance renewal and new budget year',
		category: 'insurance',
		detail: 'New premium hits prepaid insurance. The April 1 fee run uses the budget the AGM has to approve by May 31 — council should carry last year’s fees if the AGM has not happened yet, then adjust.'
	},
	{
		date: '2027-04-30',
		title: 'UHT-2900 checkpoint for affected owners',
		category: 'cra',
		detail: 'Most Canadian individuals are excluded and do not file. Lots 106 and 406 are corporations and have to ask their own accountants. The strata does not file this return. Confirm the current CRA rule before you send the reminder.'
	},
	{
		date: '2027-05-19',
		title: 'AGM',
		category: 'council',
		detail: 'Must be held by May 31, 2027, two months after the March 31 year end. Quorum is 14 of 40 lots. Budget, CRF contribution, insurance, and council election are the votes.'
	},
	{
		date: '2027-05-31',
		title: 'Last day to hold the AGM',
		category: 'compliance',
		detail: 'SPA requires the AGM within two months of the fiscal year end. May 19 is the planned date so this deadline is the backstop.'
	},
	{
		date: '2027-06-12',
		title: 'Depreciation report still current',
		category: 'compliance',
		detail: 'RJC Engineers, June 12, 2024. Next report is due June 12, 2029. The funded CRF is $43,200 against a $48,000 recommendation.'
	},
	{
		date: '2027-09-30',
		title: 'Next T2 and T1044',
		category: 'cra',
		detail: 'For the year you are in now, April 1, 2026 to March 31, 2027. Six months after year end.'
	}
];

export const events: CalEvent[] = [...generated(), ...oneOffs].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

export function eventsOn(date: string): CalEvent[] {
	return events.filter((event) => event.date === date);
}

export function eventsInMonth(year: number, month: number): CalEvent[] {
	const key = `${year}-${String(month).padStart(2, '0')}`;
	return events.filter((event) => event.date.startsWith(key));
}

export const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function monthGrid(year: number, month: number): Array<{ date: string; inMonth: boolean }> {
	const first = new Date(year, month - 1, 1);
	const start = new Date(year, month - 1, 1 - first.getDay());
	const cells: Array<{ date: string; inMonth: boolean }> = [];
	for (let i = 0; i < 42; i += 1) {
		const date = new Date(start);
		date.setDate(start.getDate() + i);
		cells.push({ date: iso(date), inMonth: date.getMonth() === month - 1 });
	}
	return cells;
}

export const highlightDates = [
	{ date: '2026-09-30', label: 'T2 / T1044 due' },
	{ date: '2026-10-01', label: 'Fees due' },
	{ date: '2026-10-08', label: 'Fire inspection' },
	{ date: '2026-10-20', label: 'Council' },
	{ date: '2026-12-31', label: 'EPR deadline' },
	{ date: '2027-02-28', label: 'T4 / T4A' },
	{ date: '2027-03-31', label: 'Year end & SVT' },
	{ date: '2027-05-19', label: 'AGM' }
];
