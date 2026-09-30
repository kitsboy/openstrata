import { money } from './format';
import { books, payroll } from './books';
import { building, headcount } from './building';

export type TaxStatus = 'due' | 'ready' | 'watch' | 'ok' | 'later' | 'na';

export interface TaxSection {
	id: string;
	title: string;
	agency: string;
	status: TaxStatus;
	statusLabel: string;
	deadline: string;
	appliesTo: string;
	why: string;
	facts: { label: string; value: string }[];
	steps: string[];
	checklist: { label: string; done: boolean }[];
	watchouts: string[];
}

const py = {
	fees: 31_200_000,
	parking: 240_000,
	interestOp: 118_000,
	interestCrf: 694_000,
	moves: 80_000,
	fines: 20_000,
	fobs: 12_000,
	operatingExpenses: 26_820_000,
	crf: 4_200_000,
	cash: 66_200_000,
	ar: 920_000,
	prepaid: 1_848_000,
	ap: 428_000,
	prepaidFees: 156_000
};

const pyRevenue = py.fees + py.parking + py.interestOp + py.interestCrf + py.moves + py.fines + py.fobs;
const pyExcess = pyRevenue - py.operatingExpenses - py.crf;
const pyAssets = py.cash + py.ar + py.prepaid;
const pyEquity = pyAssets - py.ap - py.prepaidFees;
const pyPassive = py.interestOp + py.interestCrf + py.parking;

export const priorYear = {
	label: building.priorFiscalLabel,
	revenue: pyRevenue,
	operatingExpenses: py.operatingExpenses,
	crf: py.crf,
	excess: pyExcess,
	assets: pyAssets,
	equity: pyEquity,
	passive: pyPassive,
	lines: [
		{ name: 'Strata fees', cents: py.fees },
		{ name: 'Parking stall rental', cents: py.parking },
		{ name: 'Interest — operating', cents: py.interestOp },
		{ name: 'Interest — CRF', cents: py.interestCrf },
		{ name: 'Move fees', cents: py.moves },
		{ name: 'Fines', cents: py.fines },
		{ name: 'Fobs and keys', cents: py.fobs }
	]
};

export const statusStyles: Record<TaxStatus, string> = {
	due: 'bg-rose-100 text-rose-800',
	ready: 'bg-amber-100 text-amber-950',
	watch: 'bg-orange-100 text-orange-950',
	ok: 'bg-emerald-100 text-emerald-900',
	later: 'bg-sky-100 text-sky-900',
	na: 'bg-slate-100 text-slate-600'
};

export const sections: TaxSection[] = [
	{
		id: 'position',
		title: 'What this building files',
		agency: 'Map',
		status: 'due',
		statusLabel: 'Two returns due today',
		deadline: 'September 30, 2026',
		appliesTo: 'The strata corporation, plus a desk for owner taxes the strata does not pay',
		why: 'A strata is a corporation. It files even when it owes no tax. Owners file vacancy taxes on their own lots. Mixing those two jobs is how councils scare people, or miss a deadline.',
		facts: [
			{ label: 'Legal name', value: building.legalName },
			{ label: 'Business number', value: building.cra.bn },
			{ label: 'Corporate account', value: building.cra.rc },
			{ label: 'Payroll account', value: building.cra.rp },
			{ label: 'GST account', value: building.cra.rt },
			{ label: 'Year end on the returns due today', value: 'March 31, 2026' },
			{ label: 'Year you are living in', value: building.fiscalLabel },
			{ label: 'Next T2 / T1044', value: 'September 30, 2027' },
			{ label: 'Accountant', value: building.accountant }
		],
		steps: [
			'Separate the strata’s own returns (T2, T1044, payroll, maybe GST) from owner returns (UHT, SVT, Empty Homes Tax, property tax).',
			'Today’s job is the year that already ended. Do not wait for March 2027 to file March 2026.',
			'Open the drafted T2 and T1044, read the one-page 149(1)(l) memo, and have council release them to North Shore Tax Co-op before midnight.',
			'Leave owner-tax letters for the weekend. Lots 106, 201, 309, 404, and 406 are the ones that need a note. The strata still does not file those returns.',
			'Put the next six deadlines on the council calendar before you adjourn: October 15 payroll, December 31 EPR, February 28 T4/T4A, March 31 SVT, April 30 UHT checkpoint, May 19 AGM.'
		],
		checklist: [
			{ label: 'BN and program accounts match the CRA letters in the minute book', done: true },
			{ label: 'Prior-year statements compiled', done: true },
			{ label: 'T2 drafted, tax payable $0', done: true },
			{ label: 'T1044 drafted', done: true },
			{ label: 'Council has released the returns for e-file', done: false },
			{ label: 'Owner-tax reminder list printed', done: false }
		],
		watchouts: [
			'This page is a filled-in sample for a fictional building. It is not a filing and not advice to a real strata. Your accountant signs the real return.',
			'Rates and forms change. The dollar amounts here are this building’s books. The statutory rates are labeled with where they came from.'
		]
	},
	{
		id: 'gst',
		title: 'GST / HST',
		agency: 'CRA',
		status: 'ok',
		statusLabel: 'Not registered',
		deadline: 'Review January 15, 2027',
		appliesTo: 'The strata, only if it makes taxable supplies over the small-supplier line',
		why: 'Residential strata fees are an exempt supply. You do not add GST to the monthly fee, and you do not get the GST back on the hydro bill, the insurance, or the elevator contract. That GST is just part of the cost.',
		facts: [
			{ label: 'RT account', value: 'None' },
			{ label: 'Fees this year', value: `${money(books.feeAnnual)} budgeted, treated as exempt` },
			{ label: 'Parking, fobs, fines, interest', value: `${money(books.otherIncomeAnnual)} budgeted. Treated here as exempt or not a supply.` },
			{ label: 'Commercial units', value: 'None' },
			{ label: 'Rooftop or antenna lease', value: 'None' },
			{ label: 'Small-supplier line', value: '$30,000 of taxable supplies over four consecutive quarters' }
		],
		steps: [
			'List every amount the strata collected that was not a monthly fee: parking, guest suite, fobs, laundry, antenna, storage rented to a non-resident.',
			'Mark each one exempt or taxable. A stall rented to an owner of this residential complex is kept inside the exempt residential supply in this package. A stall rented to a stranger, or a cell lease, is the kind of thing that flips the answer.',
			'Add the taxable column. If it is under $30,000 and you are not already registered, you are a small supplier. Do not charge GST.',
			'Do not book a GST receivable. You are not registered, so the GST on vendor bills stays inside the expense.',
			'Repeat the test every January, and again before anyone signs a rooftop agreement.',
			'If you cross the line, call the accountant before the next invoice. Registration can be backdated to the day you crossed it.'
		],
		checklist: [
			{ label: 'No commercial lots', done: true },
			{ label: 'No antenna or rooftop lease', done: true },
			{ label: 'Extra stalls are rented only to owners (308 and 410)', done: true },
			{ label: 'January review is on the calendar', done: true },
			{ label: 'Council minute says fees are billed with no GST', done: true }
		],
		watchouts: [
			'A caretaker suite the strata itself owns can complicate the exemption. This building does not own one.',
			'Fines are not a supply. Do not put GST on the $200 lot 309 fine.'
		]
	},
	{
		id: 't2',
		title: 'T2 corporation income tax',
		agency: 'CRA',
		status: 'due',
		statusLabel: 'Due today — ready to e-file',
		deadline: 'September 30, 2026',
		appliesTo: 'The Owners, Strata Plan LMS 2847',
		why: 'The T2 is due six months after year end. Year end was March 31, so today is the day. Tax is zero because the corporation claims the non-profit exemption in s.149(1)(l). Zero tax does not cancel the return.',
		facts: [
			{ label: 'Year being filed', value: priorYear.label },
			{ label: 'Revenue', value: money(priorYear.revenue) },
			{ label: 'Operating expenses', value: money(priorYear.operatingExpenses) },
			{ label: 'CRF contribution', value: money(priorYear.crf) },
			{ label: 'Excess kept in the funds', value: money(priorYear.excess) },
			{ label: 'Taxable income after 149(1)(l)', value: '$0.00' },
			{ label: 'Tax payable', value: '$0.00' },
			{ label: 'Balance-due date', value: 'Two months after year end — already passed, and nothing was owing' },
			{ label: 'Preparer', value: 'North Shore Tax Co-op, engagement signed May 22, 2026' }
		],
		steps: [
			'Print Schedule 100 (balance sheet) and Schedule 125 (income statement) from the compiled statements. Assets were ' + money(priorYear.assets) + '. Fund balances were ' + money(priorYear.equity) + '.',
			'Show revenue of ' + money(priorYear.revenue) + ', operating expenses of ' + money(priorYear.operatingExpenses) + ', and the CRF contribution of ' + money(priorYear.crf) + '. The excess of ' + money(priorYear.excess) + ' stayed in the funds.',
			'Do not invent shareholders. A strata created under the Strata Property Act has no share capital. Leave share schedules blank and write that in the note to the preparer.',
			'Attach the 149(1)(l) memo: the corporation exists to maintain common property, income is not payable to owners, and council has not distributed a surplus. Parking and interest were used for the building, not paid out.',
			'The war chest is a corporate asset bought with operating surplus. It is disclosed at cost, with fair value in a note. It was not bought with CRF dollars, and it was not distributed to owners.',
			'Council reads the jacket, the two schedules, and the memo, then tells the accountant to e-file. One person does not file it from a kitchen table.',
			'Save the confirmation number in the minute book next to the May 20, 2026 resolution that waived a review engagement.',
			'The year now underway is not this return. Its T2 is due September 30, 2027.'
		],
		checklist: [
			{ label: 'Schedule 100 drafted and tied to the three bank accounts', done: true },
			{ label: 'Schedule 125 drafted', done: true },
			{ label: '149(1)(l) memo signed by the treasurer', done: true },
			{ label: 'No shareholder schedule', done: true },
			{ label: 'War chest disclosed at cost, CRF not used to buy it', done: true },
			{ label: 'Council release recorded', done: false },
			{ label: 'E-file confirmation stored', done: false }
		],
		watchouts: [
			'If owners can take the surplus, the exemption fails. Do not rebate “extra” fees in December. Amend next year’s budget instead.',
			'A late T2 with zero tax often has no balance-due penalty. File because buyers, insurers, and CRA reviews ask for it. The T1044 is the return that still has a penalty at zero tax.'
		]
	},
	{
		id: 't1044',
		title: 'T1044 non-profit information return',
		agency: 'CRA',
		status: 'due',
		statusLabel: 'Due today — ready to e-file',
		deadline: 'September 30, 2026',
		appliesTo: 'This strata, because last year’s assets were over $200,000 and passive receipts were over $10,000',
		why: 'An NPO files a T1044 when assets at the end of the previous year were over $200,000, or when interest, dividends, rentals, and royalties were over $10,000, or when it had to file one before. This building trips both money tests. The CRF is why almost every mature strata files this.',
		facts: [
			{ label: 'Assets at March 31, 2026', value: money(priorYear.assets) },
			{ label: 'Interest plus parking', value: money(priorYear.passive) },
			{ label: 'Asset test', value: 'Over $200,000 — must file' },
			{ label: 'Passive-income test', value: 'Over $10,000 — must file' },
			{ label: 'Paid to members', value: '$0. Council is volunteer.' },
			{ label: 'Owing to members', value: '$0' },
			{ label: 'Due', value: 'Six months after year end, same day as the T2' }
		],
		steps: [
			'Copy the asset total from Schedule 100. Do not leave the CRF off because it “belongs to the future.” It is an asset of the corporation.',
			'Copy interest and the parking receipts into the passive-income line. CRF interest counts.',
			'Answer the member questions as zero. No council stipend, no gift cards, no “thank you” cheques. If you want to pay a council member, stop and reread the exemption before you do it.',
			'Describe the purpose in one sentence: operation and maintenance of the common property of LMS 2847.',
			'File it with the T2. Store both confirmations together.',
			'Expect to file again next year. Once you have filed, the “had to file before” test keeps you in, and the CRF will still be over $200,000.'
		],
		checklist: [
			{ label: 'Asset figure matches Schedule 100', done: true },
			{ label: 'Passive income matches the general ledger', done: true },
			{ label: 'Member remuneration is zero', done: true },
			{ label: 'Purpose sentence matches the strata plan, not a business', done: true },
			{ label: 'E-filed', done: false }
		],
		watchouts: [
			'The late-filing penalty is a daily amount with a minimum and a maximum, and it applies even when income tax is zero. Confirm the current figures on the T1044 instruction page before you tell an owner “it’s only a form.”',
			'Do not net CRF interest out of the passive line to duck the $10,000 test. The asset test already forces the return.'
		]
	},
	{
		id: 'payroll',
		title: 'Payroll, source deductions, and T4',
		agency: 'CRA',
		status: 'ready',
		statusLabel: 'First pay is on the books',
		deadline: 'Remit by October 15, 2026 if CRA set you as monthly',
		appliesTo: 'Samira El-Masri, the only employee. The caretaker is not on payroll.',
		why: 'Hiring one part-time concierge opened an RP account. September has been paid. The deductions are a liability until they are remitted. T4s are a February job, not a September job.',
		facts: [
			{ label: 'Employee', value: `${payroll.employee}, hired ${payroll.hired}` },
			{ label: 'September hours', value: `${payroll.hours} hours at ${money(payroll.rateCents)} / hour` },
			{ label: 'Gross', value: money(payroll.gross) },
			{ label: 'EI employee (1.63%)', value: money(payroll.eiEmployee) },
			{ label: 'CPP employee', value: money(payroll.cppEmployee) },
			{ label: 'EI employer (1.4×)', value: money(payroll.eiEmployer) },
			{ label: 'CPP employer', value: money(payroll.cppEmployer) },
			{ label: 'Net paid September 30', value: money(payroll.net) },
			{ label: 'Remittance sitting in the books', value: money(payroll.remittance) },
			{ label: 'RP account', value: building.cra.rp }
		],
		steps: [
			'Keep the signed TD1 and the SIN out of this screen. The treasurer has the paper. The demo does not invent a SIN.',
			'Run the pay: gross, EI, CPP, net. EI here uses the published 2026 employee rate of 1.63% and the 1.4 employer multiple. CPP uses 5.95% and a $3,500 basic exemption, which is the 2025 structure — open T4127 for 2026 and replace the CPP line before you remit if the table moved.',
			'Pay the net from the operating account. Do not pay it from the CRF or the levy trust.',
			'Hold the employee and employer portions as “source deductions payable.” That balance today is ' + money(payroll.remittance) + '.',
			'Read the remitter frequency on the CRA letter. New employers are often quarterly. This council plans to remit monthly so September does not wait until January. If the letter says quarterly, move the cash date to January 15, 2027 and leave the liability on the September 30 balance sheet either way.',
			'Remit on time with the RP account. The 15th moves to the next business day when it falls on a weekend.',
			'In February, file the T4 and the T4 Summary for Samira by February 28, 2027. Give her the slip. There is no other employee.',
			'Workers’ compensation is not a CRA deduction. It is on the WorkSafeBC section. BC Employer Health Tax does not apply at this payroll. The exemption threshold is far above one concierge. Confirm the current threshold before you ever hire a full-time site team.'
		],
		checklist: [
			{ label: 'RP account open', done: true },
			{ label: 'TD1 on file, SIN not in the app', done: true },
			{ label: 'September net pay issued', done: true },
			{ label: 'Deductions recorded as a liability', done: true },
			{ label: 'Remitter frequency confirmed against the CRA letter', done: false },
			{ label: 'October 15 (or January 15) remittance sent', done: false },
			{ label: 'T4 calendar row set for February 28, 2027', done: true }
		],
		watchouts: [
			payroll.cppNote,
			'Do not put Bill Hargreaves on a T4. He invoices as a contractor and carries his own WCB. If you start directing his hours like an employee, the accountant has to re-look at that.'
		]
	},
	{
		id: 't4a',
		title: 'T4A slips for contractors',
		agency: 'CRA',
		status: 'later',
		statusLabel: 'February 28, 2027',
		deadline: 'February 28, 2027',
		appliesTo: 'Service contractors the strata paid, generally where the amount is $500 or more',
		why: 'A T4A is how CRA sees payments to people who are not on payroll. The caretaker, the accountant, and the lawyer are the slips this building should expect. Construction contractors can have a different slip. Ask before you assume a T5018.',
		facts: [
			{ label: 'Caretaker budget', value: money(36_000_00) + ' a year, Bill Hargreaves' },
			{ label: 'Accountant budget', value: money(4_800_00) },
			{ label: 'Legal, year to date', value: money(1_850_00) },
			{ label: 'Due', value: 'Last day of February, with the T4s' }
		],
		steps: [
			'List every vendor paid for services from April 1, 2026 to March 31, 2027. Use the payables register, not memory.',
			'Drop suppliers of goods and government bodies. Keep people and firms paid for services.',
			'Prepare a T4A where the year’s payments cross the reporting line. Confirm the current threshold on the T4A guide. $500 is the figure this package is using.',
			'Use the legal name and the contractor’s BN or SIN. Email a spreadsheet to the caretaker in January asking him to confirm his name and BN. Do not guess.',
			'File the T4A Summary with the slips. Hand each contractor their copy.',
			'Keep the invoices. A T4A does not replace the contract or the WCB certificate.'
		],
		checklist: [
			{ label: 'Vendor list is the contracts register on the accounting page', done: true },
			{ label: 'Hargreaves WCB certificate is current', done: true },
			{ label: 'BN request scheduled for January', done: false },
			{ label: 'Slips prepared', done: false }
		],
		watchouts: [
			'Paying a council member “as a contractor” for treasurer work is a bad shortcut. It can break the non-profit exemption and still be employment. Don’t.',
			'The membrane contractor may belong on a contract-payment slip rather than a T4A. The lawyer and the accountant sort that one. The due date is the same season.'
		]
	},
	{
		id: 'uht',
		title: 'Underused Housing Tax — owner desk',
		agency: 'CRA',
		status: 'watch',
		statusLabel: 'Strata does not file',
		deadline: 'April 30 checkpoint for affected owners',
		appliesTo: 'Owners who are not excluded owners. Not the strata corporation, unless it owns a residential lot.',
		why: 'UHT is a federal 1% tax aimed at vacant or underused housing, mainly foreign owners and some corporations, partnerships, and trusts. Since the 2023 changes in Bill C-69, most Canadian individuals are excluded owners and do not file. The strata’s job is to know who might still be affected and to hand them occupancy dates. CRA’s “who must file” page, reviewed here as published through late 2025, is the source. Confirm it again before the next April.',
		facts: [
			{ label: 'Strata-owned residential lot', value: 'None. No UHT return for LMS 2847 itself.' },
			{ label: 'Watch — lot 106', value: 'Northwater Holdings Ltd., corporate title, tenant in place' },
			{ label: 'Watch — lot 406', value: 'Pacifica Estate Corp., foreign corporation, tenant since August 1, 2026' },
			{ label: 'Everyone else', value: `${headcount.lots - 2} lots on title as individuals, treated as excluded unless title is in a trust or a partnership` },
			{ label: 'What we hand an owner', value: 'Move-in date, Form K, and whether the lot was vacant' }
		],
		steps: [
			'Do not file a UHT-2900 for the strata plan. There is no caretaker suite on title to the corporation.',
			'Tell Canadian owners who hold the lot in their own name that they are generally excluded and do not file. Say “generally.” A trust or a partnership on title changes the answer.',
			'Email the director of Northwater and the agent for Pacifica. Say the strata will not file for them, and that a corporation is often an affected owner. Attach the occupancy note.',
			'For lot 406, include the exact tenancy start: August 1, 2026. A partial year is their accountant’s problem to classify.',
			'For lot 106, include “tenanted continuously since April 1, 2023.” That fact matters for an exemption even when a return is required.',
			'If an owner asks “was this cancelled?”, do not guess. Open the CRA page and read the current filing year with them. This package does not treat the tax as repealed.',
			'Put a reminder on April 1 of each year titled “UHT letters to affected owners,” not “file the strata’s UHT.”'
		],
		checklist: [
			{ label: 'Confirmed the strata owns no residential lot', done: true },
			{ label: 'Corporate owners identified (106, 406)', done: true },
			{ label: 'Occupancy dates written down', done: true },
			{ label: 'Letters sent', done: false },
			{ label: 'No UHT-2900 drafted in the strata’s name', done: true }
		],
		watchouts: [
			'An exemption from paying the tax is not the same as an exemption from filing. Affected owners can owe a return and owe no tax.',
			'Do not put UHT advice in a Form B. Form B has its own contents. Point the buyer’s notary at the owner.'
		]
	},
	{
		id: 'svt',
		title: 'BC speculation and vacancy tax — owner desk',
		agency: 'Province of BC',
		status: 'watch',
		statusLabel: 'Next declaration March 31, 2027',
		deadline: 'March 31, 2027 for the 2026 calendar year',
		appliesTo: 'Each owner. Vancouver is in a specified area. The strata corporation does not declare and does not pay.',
		why: 'Owners declare every year, generally by March 31. Tax, if any, is due on the first business day of July. In 2026 that weekday landed on July 2. Exemptions turn on how the home was used: principal residence, a real tenancy, and a list of others. The rate depends on who the owner is. The strata should not quote a rate.',
		facts: [
			{ label: '2025 declarations', value: 'Most owners declared by March 31, 2026 as a principal residence' },
			{ label: 'Lot 404', value: 'Vacant since March 2026. Owner in Toronto. Highest-touch file.' },
			{ label: 'Lot 201', value: 'Owner moved out in August and listed September 8. The declaration has to describe the change.' },
			{ label: 'Lot 309', value: 'Short-term guests. Do not describe this lot as tenanted.' },
			{ label: 'Lot 406', value: 'Corporate owner. Tenant only since August 1, 2026.' },
			{ label: 'Lot 106', value: 'Corporate owner, tenanted all year. They still declare.' }
		],
		steps: [
			'In January, export a one-line occupancy note for every lot: who lived there, and the dates.',
			'Send the note to the owner. Say the declaration is theirs, on the provincial site, and the strata will confirm dates if the province asks.',
			'For the five watch lots, have the secretary add a sentence that matches the unit page. Do not soften lot 309 into “rented.”',
			'If an owner is assessed and asks the strata to pay, the answer is no. It is not a common expense.',
			'Keep the notes for six years with the rest of the tax file. A review asks for the tenancy dates, and Form K is the evidence.',
			'The July payment date is the owner’s. It does not go on the strata fee run.'
		],
		checklist: [
			{ label: '2025 declaration status recorded on each lot', done: true },
			{ label: 'Watch lots flagged', done: true },
			{ label: 'January export is on the calendar', done: false },
			{ label: 'Strata has not paid anyone’s SVT', done: true }
		],
		watchouts: [
			'A Form K that is missing (lots 209, 407, and 309) is a hole in the evidence, even when the fee account is fine.',
			'Do not guess the percentage. Send the owner to the declaration. Canadian, satellite, and foreign rates are different, and exemptions change the bill to zero.'
		]
	},
	{
		id: 'eht',
		title: 'Vancouver Empty Homes Tax — owner desk',
		agency: 'City of Vancouver',
		status: 'watch',
		statusLabel: 'Next cycle opens in the winter',
		deadline: 'Working date February 2, 2027',
		appliesTo: 'Each owner of a residential lot in the City. Not the strata.',
		why: 'The City taxes homes that sit empty. Owners declare each year. The 2025 tax year was due February 3, 2026. Most of this building declared a principal residence. A few cannot say that. The City sets the next due date in a bylaw notice. February 2, 2027 is a placeholder until that notice is in the minute book.',
		facts: [
			{ label: 'Last due date', value: 'February 3, 2026, for the 2025 tax year' },
			{ label: 'Lot 404', value: 'Empty since March 2026. 2025 declaration was late, filed February 20, 2026.' },
			{ label: 'Lot 201', value: 'Listed September 8, 2026. A listing exemption is the owner’s to claim.' },
			{ label: 'Lot 309', value: 'Nightly use. Principal-residence treatment is unlikely.' },
			{ label: 'Lot 406', value: 'Tenancy began August 1, 2026. The City decides if the year qualifies.' },
			{ label: 'Placeholder', value: 'February 2, 2027 — replace when the City posts the date' }
		],
		steps: [
			'When the City’s letter arrives, replace the February 2 placeholder on the calendar the same week. Do not leave the guess in place.',
			'Send owners the same occupancy note you prepared for the speculation tax. One note can serve both if the dates are honest.',
			'Call out 201, 309, 404, and 406 by lot number. A blanket “please declare” email will be ignored by the people who need it.',
			'Offer the enterphone log and the Form K. Do not offer a legal opinion.',
			'If a buyer of lot 201 asks whether EHT is paid, send them to the owner and the City. It is not a Form F item unless a bylaw or a charge says otherwise. The arrears that block Form F are strata charges.',
			'Keep a copy of whatever the owner forwards back, so next year’s secretary is not starting from zero.'
		],
		checklist: [
			{ label: '2025 status is on the lot cards', done: true },
			{ label: 'Placeholder date is labeled as a placeholder', done: true },
			{ label: 'City notice filed in the minute book', done: false },
			{ label: 'Targeted emails drafted', done: false }
		],
		watchouts: [
			'EHT, SVT, and UHT are three different governments. An exemption from one is not an exemption from the others.',
			'The strata does not add Empty Homes Tax to the fee schedule.'
		]
	},
	{
		id: 'property',
		title: 'Property tax, home owner grant, and PST',
		agency: 'City of Vancouver and BC',
		status: 'na',
		statusLabel: 'Owners pay the City',
		deadline: 'The City’s July tax due date, on each owner’s bill',
		appliesTo: 'Each strata lot’s owner. PST is on some vendor bills, not a tax the strata collects.',
		why: 'Property tax follows the lot, not the strata plan. The strata does not collect it and does not pay it, because this corporation does not own a taxable lot. PST is different: it is buried in some invoices and it is not a balance you remit.',
		facts: [
			{ label: 'Strata-owned taxable lot', value: 'None' },
			{ label: 'Who pays property tax', value: 'Each owner, on the City bill for their lot' },
			{ label: 'Home owner grant', value: 'The owner claims it. The strata cannot.' },
			{ label: 'PST account', value: 'None. The strata is not a collector.' },
			{ label: 'Insurance', value: 'Premium tax is inside the broker’s invoice. It is not a separate remittance.' }
		],
		steps: [
			'If an owner asks why the fee “doesn’t include property tax,” show them this page. The fee maintains common property. The City taxes the lot.',
			'Do not pay an owner’s property tax from the operating account, even as a favour. It is not a common expense and it tangles the non-profit story.',
			'When a vendor charges PST, leave it inside the expense. There is no PST payable account to remit.',
			'If you ever buy a caretaker suite in the strata’s name, stop and ask the accountant before the completion date. That purchase creates a property-tax bill and can change the GST and UHT answers.',
			'Home owner grant deadlines are on the City bill. They are not on the council calendar except as a courtesy mention in the winter newsletter.'
		],
		checklist: [
			{ label: 'No strata-owned lot on title', done: true },
			{ label: 'Fee schedule has no property-tax line', done: true },
			{ label: 'PST is not set up as a remittance', done: true }
		],
		watchouts: [
			'A special levy is still not property tax. Owners sometimes use the words for each other when a Form B is being prepared. Use the levy trust balance, not the City bill.'
		]
	},
	{
		id: 'worksafebc',
		title: 'WorkSafeBC',
		agency: 'WorkSafeBC',
		status: 'ready',
		statusLabel: 'Registered for the new employee',
		deadline: 'Quarterly payroll report follows the classification letter',
		appliesTo: 'Samira’s wages. Not the caretaker, while he remains an independent contractor with his own certificate.',
		why: 'The moment the strata had a worker, it needed an account. The caretaker already invoices with a clearance letter. Those are different facts and they should stay different.',
		facts: [
			{ label: 'Account', value: 'WS-2847 (demo)' },
			{ label: 'Assessable payroll, September', value: money(payroll.gross) },
			{ label: 'Caretaker', value: 'Not assessable here — his WCB clearance is on file' },
			{ label: 'Rate', value: 'Waiting on the classification letter. Line 6215 has room for it.' },
			{ label: 'Budget line', value: '6215, shared with employer CPP and EI' }
		],
		steps: [
			'Register before the first shift. This building did it on September 1.',
			'When the classification letter arrives, write the rate on this page and replace the estimate. Do not publish a guessed rate to owners.',
			'Report Samira’s wages on the WorkSafeBC schedule. Report Bill’s only if a ruling says he is a worker.',
			'Ask every contractor for a clearance letter once a year. Harbour Janitorial, Cedar & Co, Richmond Elevator, and Seawall Membrane are the ones to chase this winter.',
			'Keep clearance letters next to the contract, not in a personal inbox.',
			'An injury report is a same-day job. The secretary’s number is the one on the lobby board.'
		],
		checklist: [
			{ label: 'Account open', done: true },
			{ label: 'Caretaker clearance current', done: true },
			{ label: 'Classification letter filed', done: false },
			{ label: 'Other contractors’ clearances requested for the new year', done: false }
		],
		watchouts: [
			'Paying WorkSafeBC from the CRF is the wrong fund. It is an operating cost of having a worker.',
			'A volunteer council member is not automatically a worker. Do not “add them to payroll” to be nice.'
		]
	},
	{
		id: 'records',
		title: 'Record keeping',
		agency: 'CRA and the SPA',
		status: 'ok',
		statusLabel: 'Six years, and longer where the SPA says so',
		deadline: 'Rolling',
		appliesTo: 'Returns, ledgers, minutes, Form K, and the war-chest records',
		why: 'CRA generally wants records for six years from the end of the tax year they relate to. The Strata Property Act has its own list, and some of it is permanent. Keep whichever period is longer. A buyer in 2030 will ask for the 2026 Form B backup.',
		facts: [
			{ label: 'CRA horizon', value: 'Six years after the year the record belongs to' },
			{ label: 'Permanent', value: 'Minutes, bylaws, the strata plan, and the depreciation report' },
			{ label: 'War chest', value: 'Every purchase: date, CAD, sats, rate, and which fund paid. Forever, with the books.' },
			{ label: 'Where', value: 'Minute book plus the export from this software. Two copies, one off site.' }
		],
		steps: [
			'After the T2 is accepted, file the confirmation, the schedules, and the compiled statements as one PDF.',
			'Keep payroll records (TD1, pay stub, remittance) for the CRA period even after Samira leaves.',
			'Keep Form K files with the lot, not in a stack by year, so a Form B can be built in an afternoon.',
			'Bank statements for all three accounts stay with the reconciliation the treasurer signed.',
			'When a document hits the SPA destruction date and the CRA date is already past, record what you destroyed. Do not quietly empty a cabinet before an AGM.',
			'The watch-only xpub and the hardware-key holder list are governance records. They are not a secret the treasurer keeps in a notes app.'
		],
		checklist: [
			{ label: 'Three bank feeds archived monthly', done: true },
			{ label: 'Minute book is current through September 15', done: true },
			{ label: 'Prior-year tax PDF slot is empty until e-file', done: false },
			{ label: 'Off-site copy of the ledger', done: true }
		],
		watchouts: [
			'Destroying a record because “the software has it” fails when the export is incomplete. Export the year with the filing.'
		]
	},
	{
		id: 'close',
		title: 'How to close a year',
		agency: 'Council and the accountant',
		status: 'later',
		statusLabel: 'Next close is March 31, 2027',
		deadline: 'AGM by May 31, 2027. T2 and T1044 by September 30, 2027.',
		appliesTo: 'The fiscal year that is open now',
		why: 'The close is a checklist, not a mood. March 31 cuts the year. The AGM has to happen within two months. The tax returns follow six months after year end. Doing those in that order is the whole job.',
		facts: [
			{ label: 'Open year', value: building.fiscalLabel },
			{ label: 'Cut-off', value: 'March 31, 2027' },
			{ label: 'AGM backstop', value: 'May 31, 2027. Planned meeting May 19.' },
			{ label: 'Returns', value: 'September 30, 2027' },
			{ label: 'YTD operating surplus, before the war-chest transfer', value: money(books.surplusYtd) },
			{ label: 'Books status today', value: books.tie.ok ? 'Operating, CRF, and the levy each balance' : 'Out of balance — do not close' }
		],
		steps: [
			'On March 31, reconcile operating, CRF, and the levy trust. Three reconciliations, three signatures.',
			'Count prepaid April fees as a liability. They are not next year’s windfall and they are not this year’s income.',
			'Count unpaid fees, fines, and levy as receivables. Lot 207’s lien file has to match the subledger to the cent.',
			'Leave prepaid insurance as an asset and expense only the months that belong to the year.',
			'Print the war chest: sats, cost, fair value, and a sentence that says the CRF did not pay for it.',
			'Council approves the package. The accountant compiles. Owners get it with the AGM notice, at least two weeks before May 19.',
			'The AGM approves next year’s budget. Fees can keep running at the old amount if you have to, then you adjust. Do not invent a fee the meeting has not seen.',
			'E-file the T2 and T1044 by September 30. T4 and T4A are already due the February before that, because they follow the calendar year of the pay, not a mood of the treasurer.',
			'Start the next depreciation-report clock only when the date on the report says so. This one is good until June 12, 2029.'
		],
		checklist: [
			{ label: 'Close checklist is on the calendar', done: true },
			{ label: 'AGM date reserved (May 19, 2027)', done: true },
			{ label: 'Accountant engaged for the coming year', done: true },
			{ label: 'March 31 reconciliation', done: false },
			{ label: 'AGM notice with financials', done: false }
		],
		watchouts: [
			'Today, September 30, 2026, is not this checklist. Today is last year’s filing. Next March is this checklist.',
			'A council that “rolls the year” inside the software without a signed reconciliation does not have books. It has a draft.'
		]
	}
];
