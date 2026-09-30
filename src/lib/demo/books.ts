/**
 * Fund statements for Evergreen House at September 30, 2026.
 * Operating, CRF, and the parkade levy are separate on purpose (SPA s.92).
 * The war chest is an operating-fund sub-account. It is never funded from the CRF.
 */

import {
	BTC_CAD_CENTS,
	CRF_POINT_CENTS,
	OP_POINT_CENTS,
	TOTAL_ENTITLEMENT,
	building,
	crfPortionCents,
	monthlyFeeCents,
	operatingPortionCents,
	units
} from './building';

const dollar = (amount: number) => amount * 100;

export interface LedgerLine {
	code: string;
	name: string;
	annualCents: number;
	ytdCents: number;
	note?: string;
}

export interface JournalLine {
	account: string;
	debit?: number;
	credit?: number;
}

export interface JournalEntry {
	date: string;
	memo: string;
	lines: JournalLine[];
}

const expenseSeed: Array<[string, string, number, number, string?]> = [
	['6100', 'Insurance', 48600, 24300, 'Prepaid March 28 and expensed straight across the fiscal year.'],
	['6110', 'Hydro — common property', 21360, 11400],
	['6120', 'Natural gas', 9240, 3100, 'Summer use is low. Winter months will catch this up.'],
	['6130', 'Water, sewer, and drainage', 14160, 7400],
	['6140', 'Waste and recycling', 7680, 3840],
	['6200', 'Caretaker contract', 36000, 18000, 'Bill Hargreaves. Contractor, not on payroll.'],
	['6210', 'Concierge wages', 16800, 960, 'Samira El-Masri. September only — she started the 1st.'],
	['6215', 'Employer CPP, EI, and WorkSafeBC', 2520, 0, 'September actual is CPP and EI only. WorkSafeBC posts when the quarter is billed.'],
	['6220', 'Elevator maintenance', 8640, 4320],
	['6230', 'Fire and life safety', 6240, 2400, 'Annual inspection is October 8, so most of this line is still ahead.'],
	['6240', 'Landscaping and snow', 10800, 7200, 'Summer-heavy. Snow budget is still untouched.'],
	['6250', 'Janitorial', 16080, 8040],
	['6260', 'Repairs and maintenance', 27600, 16240, 'Includes the parkade gate motor in September.'],
	['6270', 'Plumbing and drains', 7800, 2100],
	['6280', 'Envelope and roof repairs', 10800, 1800],
	['6290', 'Pest control', 1440, 720],
	['6300', 'Enterphone and fobs', 960, 960, 'Annual contract paid in April.'],
	['6310', 'Legal', 5400, 1850, 'Demand letter and lien opinion for lot 207.'],
	['6320', 'Accountant — compilation, T2, T1044', 4800, 0, 'Billed at year end. Prior-year invoice was last fiscal year.'],
	['6330', 'Insurance appraisal', 1200, 0, 'Booked October 22.'],
	['6340', 'Depreciation-report set-aside', 2400, 0, 'The budget names the plan. No cash has moved, and this is not a CRF transfer.'],
	['6350', 'EPR 2026 consultant', 6500, 4200],
	['6360', 'EV electrical load study', 3500, 3500, 'Finished. Four chargers are inside the cap. Four more stalls are roughed in.'],
	['6370', 'OpenStrata software', 2880, 1440, '$6 × 40 lots × 12 months.'],
	['6380', 'Administration', 1680, 790],
	['6390', 'AGM and meetings', 1440, 1440, 'May AGM is already paid. Council meetings are in the amenity room.'],
	['6400', 'Bank and trust fees', 360, 180],
	['6410', 'Gutters, windows, dryer vents', 2400, 0, 'November gutter day is on the calendar.'],
	['6490', 'Operating contingency', 8000, 1200]
];

const incomeSeed: Array<[string, string, number, number, boolean]> = [
	['7010', 'Parking stall rental', 2400, 1200, true],
	['7020', 'Move-in and move-out fees', 1600, 600, true],
	['7030', 'Bylaw fines', 600, 200, false],
	['7040', 'Interest — operating account', 1240, 640, true],
	['7050', 'Fobs and keys', 240, 80, true],
	['7060', 'Late fees', 400, 200, false]
];

function roundPct(cents: number, numerator: number, denominator: number): number {
	return Math.round((cents * numerator) / denominator);
}

const gross = 40 * 2400;
const eiEmployee = roundPct(gross, 163, 10000);
const cppExemption = Math.round(350_000 / 12);
const cppEmployee = roundPct(gross - cppExemption, 595, 10000);
const eiEmployer = Math.round((eiEmployee * 14) / 10);
const cppEmployer = cppEmployee;
const payrollPayable = eiEmployee + cppEmployee + eiEmployer + cppEmployer;
const payrollNet = gross - eiEmployee - cppEmployee;
const employerBurden = eiEmployer + cppEmployer;

export const payroll = {
	employee: 'Samira El-Masri',
	role: 'Evening concierge, 10 hours a week',
	hired: 'September 1, 2026',
	sin: 'Collected on the TD1. Not shown here.',
	hours: 40,
	rateCents: 2400,
	gross,
	eiEmployee,
	cppEmployee,
	eiEmployer,
	cppEmployer,
	net: payrollNet,
	remittance: payrollPayable,
	burden: employerBurden,
	expense: gross + employerBurden,
	due: 'October 15, 2026',
	payDate: 'September 30, 2026',
	eiNote: '2026 EI employee rate 1.63%, employer 1.4×, maximum insurable earnings $68,900, maximum employee premium $1,123.07.',
	cppNote:
		'CPP is shown at 5.95% with a $3,500 basic exemption, which is the 2025 structure. Confirm the 2026 T4127 tables before the October 15 remittance. This pay is over the monthly exemption, so CPP is due.'
};

const expenses: LedgerLine[] = expenseSeed.map(([code, name, annual, ytd, note]) => ({
	code,
	name,
	annualCents: dollar(annual),
	ytdCents: code === '6215' ? employerBurden : dollar(ytd),
	note
}));

const incomeLines: LedgerLine[] = incomeSeed.map(([code, name, annual, ytd]) => ({
	code,
	name,
	annualCents: dollar(annual),
	ytdCents: dollar(ytd)
}));

const expenseAnnual = expenses.reduce((sum, line) => sum + line.annualCents, 0);
const expenseTotal = expenses.reduce((sum, line) => sum + line.ytdCents, 0);
const otherIncomeAnnual = incomeLines.reduce((sum, line) => sum + line.annualCents, 0);
const otherIncome = incomeLines.reduce((sum, line) => sum + line.ytdCents, 0);
const otherCash = incomeSeed.reduce((sum, [code, , , ytd, cash]) => {
	void code;
	return sum + (cash ? dollar(ytd) : 0);
}, 0);

const monthsElapsed = 6;
const feesOperating = TOTAL_ENTITLEMENT * OP_POINT_CENTS * monthsElapsed;
const feesCrf = TOTAL_ENTITLEMENT * CRF_POINT_CENTS * monthsElapsed;
const crfContributionAnnual = TOTAL_ENTITLEMENT * CRF_POINT_CENTS * 12;
const feeAnnual = TOTAL_ENTITLEMENT * 450 * 12;

const feeArrearsOperating = units.reduce(
	(sum, unit) => sum + operatingPortionCents(unit.entitlement) * unit.feeArrearsMonths,
	0
);
const feeArrearsCrf = units.reduce(
	(sum, unit) => sum + crfPortionCents(unit.entitlement) * unit.feeArrearsMonths,
	0
);
const prepaidOperating = units
	.filter((unit) => unit.prepaidOctober)
	.reduce((sum, unit) => sum + operatingPortionCents(unit.entitlement), 0);
const prepaidCrf = units
	.filter((unit) => unit.prepaidOctober)
	.reduce((sum, unit) => sum + crfPortionCents(unit.entitlement), 0);

const unpaidFines = units.reduce((sum, unit) => sum + unit.fineOwing, 0);
const unpaidLate = units.reduce((sum, unit) => sum + unit.lateOwing, 0);

const openingCash = 3_842_500;
const openingWar = 445_500;
const insurance = expenses.find((line) => line.code === '6100')!;
const openingPrepaid = insurance.annualCents;
const openingEquity = openingCash + openingWar + openingPrepaid;

const warChestYtd = dollar(405) * monthsElapsed;
const warChestCost = openingWar + warChestYtd;
const warChestSats = 5_000_000;
const warChestValue = Math.round((warChestSats * BTC_CAD_CENTS) / 100_000_000);

const ap = [
	{ vendor: 'Harbour Janitorial', memo: 'September common-area clean', cents: dollar(1340), due: '2026-10-07', account: '6250' },
	{ vendor: 'Cedar & Co Landscaping', memo: 'September grounds', cents: dollar(900), due: '2026-10-10', account: '6240' },
	{ vendor: 'Richmond Elevator', memo: 'Q3 maintenance', cents: dollar(2160), due: '2026-10-15', account: '6220' },
	{ vendor: 'BC Hydro', memo: 'September common property', cents: dollar(1820), due: '2026-10-20', account: '6110' },
	{ vendor: 'FortisBC', memo: 'September gas', cents: dollar(280), due: '2026-10-20', account: '6120' }
];
const apTotal = ap.reduce((sum, bill) => sum + bill.cents, 0);

// Insurance was paid before April 1 and sits in prepaid. Expensing it does not move cash again.
const paidExpenses = expenseTotal - apTotal - payrollPayable - insurance.ytdCents;
const cash =
	openingCash +
	(feesOperating - feeArrearsOperating) +
	prepaidOperating +
	otherCash -
	warChestYtd -
	paidExpenses;

const endingPrepaid = openingPrepaid - insurance.ytdCents;
const arOperating = feeArrearsOperating + unpaidFines + unpaidLate;
const assets = cash + arOperating + endingPrepaid + warChestCost;
const liabilities = apTotal + prepaidOperating + payrollPayable;
const equitySheet = assets - liabilities;
const equityActivity = openingEquity + feesOperating + otherIncome - expenseTotal;

const crfOpening = dollar(586_400);
const crfInterest = dollar(2180);
const crfSpend = dollar(6400);
const crfCash = crfOpening + (feesCrf - feeArrearsCrf) + prepaidCrf + crfInterest - crfSpend;
const crfEquityActivity = crfOpening + feesCrf + crfInterest - crfSpend;
const crfEquitySheet = crfCash + feeArrearsCrf - prepaidCrf;

const levyOwing = units.reduce((sum, unit) => sum + unit.levyOwing, 0);
const levyAssessed = TOTAL_ENTITLEMENT * 3600;
const levySpent = dollar(176_400);
const levyCollected = levyAssessed - levyOwing;
const levyCash = levyCollected - levySpent;
const levyRemaining = levyAssessed - levySpent;

const surplusYtd = feesOperating + otherIncome - expenseTotal;

const weights = [14, 16, 15, 16, 17, 22];
let allocated = 0;
const monthly = weights.map((weight, index) => {
	const last = index === weights.length - 1;
	const slice = last ? expenseTotal - allocated : Math.round((expenseTotal * weight) / 100);
	allocated += slice;
	return {
		label: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][index],
		fees: TOTAL_ENTITLEMENT * 450,
		expenses: slice
	};
});

const septemberUnpaid = units
	.filter((unit) => unit.feeArrearsMonths > 0)
	.reduce((sum, unit) => sum + monthlyFeeCents(unit.entitlement), 0);
const septemberCash = TOTAL_ENTITLEMENT * 450 - septemberUnpaid;
const octoberPrepay = prepaidOperating + prepaidCrf;

function balanced(lines: JournalLine[]): boolean {
	const debit = lines.reduce((sum, line) => sum + (line.debit ?? 0), 0);
	const credit = lines.reduce((sum, line) => sum + (line.credit ?? 0), 0);
	return debit === credit;
}

const journal: JournalEntry[] = [
	{
		date: '2026-09-01',
		memo: 'September strata fees billed — 40 lots',
		lines: [
			{ account: '1200 Accounts receivable — fees', debit: TOTAL_ENTITLEMENT * 450 },
			{ account: '4010 Fee income — operating', credit: TOTAL_ENTITLEMENT * OP_POINT_CENTS },
			{ account: '4020 Fee income — CRF', credit: TOTAL_ENTITLEMENT * CRF_POINT_CENTS }
		]
	},
	{
		date: '2026-09-01',
		memo: 'September fee cash, net of lots 104 and 207',
		lines: [
			{ account: '1010 Operating chequing', debit: Math.round((septemberCash * 13) / 15) },
			{ account: '1020 CRF savings', debit: septemberCash - Math.round((septemberCash * 13) / 15) },
			{ account: '1200 Accounts receivable — fees', credit: septemberCash }
		]
	},
	{
		date: '2026-09-28',
		memo: 'October fees prepaid by lots 203, 308, and 401',
		lines: [
			{ account: '1010 Operating chequing', debit: prepaidOperating },
			{ account: '1020 CRF savings', debit: prepaidCrf },
			{ account: '2030 Prepaid fees — operating', credit: prepaidOperating },
			{ account: '2035 Prepaid fees — CRF', credit: prepaidCrf }
		]
	},
	{
		date: '2026-09-02',
		memo: 'War-chest purchase, operating surplus only, 3-of-5 watch-only',
		lines: [
			{ account: '1080 BTC war chest at cost', debit: dollar(405) },
			{ account: '1010 Operating chequing', credit: dollar(405) }
		]
	},
	{
		date: '2026-09-05',
		memo: 'Late fees — lots 104 and 207, September',
		lines: [
			{ account: '1210 Late fees receivable', debit: dollar(100) },
			{ account: '7060 Late fee income', credit: dollar(100) }
		]
	},
	{
		date: '2026-09-16',
		memo: 'Bylaw fine — lot 309, one day under bylaw 9.2',
		lines: [
			{ account: '1220 Fines receivable', debit: dollar(200) },
			{ account: '7030 Bylaw fine income', credit: dollar(200) }
		]
	},
	{
		date: '2026-09-30',
		memo: 'Concierge payroll — Samira El-Masri, September',
		lines: [
			{ account: '6210 Concierge wages', debit: gross },
			{ account: '6215 Employer CPP and EI', debit: employerBurden },
			{ account: '1010 Operating chequing', credit: payrollNet },
			{ account: '2100 Source deductions payable', credit: payrollPayable }
		]
	},
	{
		date: '2026-09-30',
		memo: 'Insurance amortized for September',
		lines: [
			{ account: '6100 Insurance expense', debit: dollar(4050) },
			{ account: '1300 Prepaid insurance', credit: dollar(4050) }
		]
	},
	{
		date: '2026-09-30',
		memo: 'CRF interest posted by the credit union',
		lines: [
			{ account: '1020 CRF savings', debit: dollar(360) },
			{ account: '7100 Interest — CRF', credit: dollar(360) }
		]
	}
];

export const contracts = [
	{ vendor: 'Harbour Insurance Brokers', service: 'Building policy HH-2847-26', renewal: 'April 1, 2027', note: 'Appraisal October 22 so the broker can market the renewal in January.' },
	{ vendor: 'Bill Hargreaves', service: 'Caretaker, $3,000 a month', renewal: 'March 31, 2027', note: 'Contractor. WCB on file. Not on the T4.' },
	{ vendor: 'Samira El-Masri', service: 'Evening concierge', renewal: 'Employment, open', note: 'First employee. RP account opened September 1.' },
	{ vendor: 'Harbour Janitorial', service: 'Weekly common-area clean', renewal: 'Month to month', note: 'September invoice is in accounts payable.' },
	{ vendor: 'Cedar & Co', service: 'Landscaping, April to November', renewal: 'November 30, 2026', note: 'Snow is a separate call-out if needed.' },
	{ vendor: 'Richmond Elevator', service: 'Quarterly maintenance', renewal: 'January 31, 2027', note: 'Annual safety inspection November 4.' },
	{ vendor: 'Coast Fire Protection', service: 'Annual fire inspection', renewal: 'October 8, 2026', note: 'Lobby, 9:00 am. Panel keys with the caretaker.' },
	{ vendor: 'Seawall Membrane Co.', service: 'Parkade membrane, levy project', renewal: 'Closes when the holdback is released', note: 'Contract equals the $216,000 levy. Progress billed $176,400.' },
	{ vendor: 'North Shore Tax Co-op', service: 'Compilation, T2, T1044', renewal: 'Each fiscal year', note: 'Today’s filing is the prior year. This year’s fee is still in the budget.' },
	{ vendor: 'False Creek Law', service: 'Lien opinion, lot 207', renewal: 'File stays open', note: 'Council vote on October 20.' },
	{ vendor: 'Metro Energy Advisors', service: 'EPR 2026', renewal: 'December 31, 2026 deadline', note: '$4,200 spent of a $6,500 budget.' },
	{ vendor: 'OpenStrata', service: 'Sovereign plan', renewal: 'Monthly', note: '$6 a lot. Watch-only. No custody of the war chest.' }
] as const;

const budgetDelta = expenseAnnual + crfContributionAnnual - otherIncomeAnnual - feeAnnual;
const journalOk = journal.every((entry) => balanced(entry.lines));

export const books = {
	asOfLabel: building.asOfLabel,
	monthsElapsed,
	feeAnnual,
	expenseAnnual,
	crfContributionAnnual,
	otherIncomeAnnual,
	expenses,
	incomeLines,
	expenseTotal,
	otherIncome,
	feesOperating,
	feesCrf,
	surplusYtd,
	openingEquity,
	warChestYtd,
	warChestCost,
	warChestSats,
	warChestValue,
	warChestGain: warChestValue - warChestCost,
	monthly,
	journal,
	contracts,
	ap,
	apTotal,
	payroll,
	operating: {
		cash,
		ar: arOperating,
		feeArrears: feeArrearsOperating,
		fines: unpaidFines,
		late: unpaidLate,
		prepaidInsurance: endingPrepaid,
		warChest: warChestCost,
		ap: apTotal,
		prepaidFees: prepaidOperating,
		payrollPayable,
		equity: equitySheet,
		unrestricted: equitySheet - warChestCost
	},
	crf: {
		opening: crfOpening,
		contributions: feesCrf,
		interest: crfInterest,
		spent: crfSpend,
		cash: crfCash,
		ar: feeArrearsCrf,
		prepaidFees: prepaidCrf,
		equity: crfEquitySheet,
		study: 'Elevator modernization scoping study'
	},
	levy: {
		perPointCents: 3600,
		assessed: levyAssessed,
		collected: levyCollected,
		owing: levyOwing,
		spent: levySpent,
		cash: levyCash,
		remaining: levyRemaining,
		project: 'Parkade membrane — Seawall Membrane Co.',
		approved: 'Special general meeting, November 12, 2025, 3/4 vote'
	},
	tie: {
		ok:
			equitySheet === equityActivity &&
			crfEquitySheet === crfEquityActivity &&
			levyCash + levyOwing === levyRemaining &&
			budgetDelta === 0 &&
			journalOk &&
			units.reduce((sum, unit) => sum + unit.entitlement, 0) === TOTAL_ENTITLEMENT,
		equityDelta: equitySheet - equityActivity,
		crfDelta: crfEquitySheet - crfEquityActivity,
		levyDelta: levyCash + levyOwing - levyRemaining,
		budgetDelta,
		journalOk
	},
	september: {
		billed: TOTAL_ENTITLEMENT * 450,
		unpaid: septemberUnpaid,
		cash: septemberCash,
		prepay: octoberPrepay
	}
};

export type Books = typeof books;
