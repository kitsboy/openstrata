/**
 * The fiscal year as one printed page, for the annual meeting package.
 *
 * The dashboard answers "what is happening now" in a dozen panels. An AGM asks a
 * narrower question — what did the year do, what is in the funds, did compliance
 * get better or worse, and what is still outstanding — and a council hands the
 * answer over as paper. This module is that page, with three rules that keep it
 * honest:
 *
 * 1. **Every figure is read from the books, never retyped.** Income and spend are
 *    the ledger's own lines, grouped by account code; a line no category claims
 *    is reported as unmatched rather than dropped, so a new account code shows
 *    up as a defect instead of making the totals quietly disagree with
 *    /accounting.
 * 2. **The operating surplus is income less spend, and the CRF contribution is
 *    not spend.** A dollar moved to the reserve fund is still the owners' money;
 *    counting it as an expense would make the year look poorer than it is. The
 *    reserve's own balances appear in the funds block, where they belong.
 * 3. **Open means tracked and dated.** A deadline is open until its date passes,
 *    and one that has passed is counted as overdue rather than removed — the page
 *    a council signs should not lose the item it missed.
 *
 * Label-free by design: the caller supplies the translated category names, the
 * fund names and the dates, so this module is testable without a catalog.
 */

export interface SheetLine {
	code: string;
	name: string;
	/** Actual for the year to date, in cents. */
	ytdCents: number;
	/** The approved budget for the full year, in cents. */
	annualCents: number;
}

/** A display category: the account codes it claims, in print order. */
export interface CategoryRule {
	id: string;
	codes: readonly string[];
}

export interface CategoryTotal {
	id: string;
	ytdCents: number;
	annualCents: number;
	/** The lines behind the total, so a reader can check it. */
	lines: SheetLine[];
}

export interface CategorySummary {
	rows: CategoryTotal[];
	ytdCents: number;
	annualCents: number;
	/** Codes no rule claimed. Empty is the healthy state. */
	unmatched: string[];
}

export interface YearFunds {
	operatingCents: number;
	reserveCents: number;
	levyCents: number;
}

export interface HealthPoint {
	label: string;
	score: number;
}

export interface OpenItem {
	title: string;
	/** ISO date the item falls due. */
	dueAt: string;
	/** Days from the statement date; negative means it has passed. */
	daysLeft: number;
}

export interface YearSheetInput {
	income: readonly SheetLine[];
	expense: readonly SheetLine[];
	funds: YearFunds;
	health: { from: HealthPoint; to: HealthPoint };
	open: readonly OpenItem[];
}

export interface YearSheet {
	income: CategorySummary;
	expense: CategorySummary;
	/** Income less spend, in cents. */
	surplusCents: number;
	/** The budget's own income less spend, for the same comparison. */
	budgetSurplusCents: number;
	funds: Array<{ id: keyof YearFunds; cents: number }>;
	fundsTotalCents: number;
	health: { from: HealthPoint; to: HealthPoint; delta: number };
	open: OpenItem[];
	openOverdue: number;
}

/**
 * Operating income, in the order a reader expects to see it. The operating share
 * of the fees comes first because it is most of the money; the small lines are
 * grouped so the page stays one page.
 */
export const INCOME_RULES: readonly CategoryRule[] = [
	{ id: 'fees', codes: ['7000'] },
	{ id: 'parking', codes: ['7010', '7020'] },
	{ id: 'fines', codes: ['7030', '7060'] },
	{ id: 'interest', codes: ['7040'] },
	{ id: 'fobs', codes: ['7050'] }
];

/**
 * Operating spend by category. Insurance is its own line because it is the
 * largest single contract and the one a reader asks about first; the rest follow
 * the building's own shape — utilities, the people, the systems, the grounds, the
 * professional work, and the cost of running the corporation.
 */
export const EXPENSE_RULES: readonly CategoryRule[] = [
	{ id: 'insurance', codes: ['6100'] },
	{ id: 'utilities', codes: ['6110', '6120', '6130', '6140'] },
	{ id: 'people', codes: ['6200', '6210', '6215'] },
	{ id: 'systems', codes: ['6220', '6230', '6260', '6270', '6280', '6290', '6300', '6410'] },
	{ id: 'grounds', codes: ['6240', '6250'] },
	{ id: 'professional', codes: ['6310', '6320', '6330', '6340', '6350', '6360'] },
	{ id: 'administration', codes: ['6370', '6380', '6390', '6400', '6490'] }
];

/**
 * Group the ledger's lines into the categories above.
 *
 * A line is claimed by the first rule that lists its code. A code no rule lists
 * is returned in `unmatched` and left out of the rows — the totals then disagree
 * with the ledger, which is the failure a test should catch, rather than a page
 * that adds up to a number nobody can find in the books.
 */
export function categorise(
	lines: readonly SheetLine[],
	rules: readonly CategoryRule[]
): CategorySummary {
	const rows: CategoryTotal[] = rules.map((rule) => ({
		id: rule.id,
		ytdCents: 0,
		annualCents: 0,
		lines: []
	}));
	const unmatched: string[] = [];

	for (const line of lines) {
		const index = rules.findIndex((rule) => rule.codes.includes(line.code));
		const row = rows[index];
		if (index === -1 || !row) {
			if (!unmatched.includes(line.code)) unmatched.push(line.code);
			continue;
		}
		row.ytdCents += line.ytdCents;
		row.annualCents += line.annualCents;
		row.lines.push(line);
	}

	return {
		rows,
		ytdCents: rows.reduce((sum, row) => sum + row.ytdCents, 0),
		annualCents: rows.reduce((sum, row) => sum + row.annualCents, 0),
		unmatched
	};
}

/** The whole page: two category tables, three funds, one score and the open list. */
export function buildYearSheet(input: YearSheetInput): YearSheet {
	const income = categorise(input.income, INCOME_RULES);
	const expense = categorise(input.expense, EXPENSE_RULES);
	const funds = [
		{ id: 'operatingCents' as const, cents: input.funds.operatingCents },
		{ id: 'reserveCents' as const, cents: input.funds.reserveCents },
		{ id: 'levyCents' as const, cents: input.funds.levyCents }
	];

	return {
		income,
		expense,
		surplusCents: income.ytdCents - expense.ytdCents,
		budgetSurplusCents: income.annualCents - expense.annualCents,
		funds,
		fundsTotalCents: funds.reduce((sum, fund) => sum + fund.cents, 0),
		health: {
			from: input.health.from,
			to: input.health.to,
			delta: input.health.to.score - input.health.from.score
		},
		open: [...input.open],
		openOverdue: input.open.filter((item) => item.daysLeft < 0).length
	};
}
