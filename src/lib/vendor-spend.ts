/**
 * What each vendor has been paid this year, against what the budget gave it.
 *
 * The contracts register names a renewal and a service, and the budget names an
 * annual figure per account. Neither answers the question a council asks of a
 * quote — "what are we paying this person, and is it inside the plan?" — because
 * the two lists are never joined. This module joins them, and four rules keep
 * the join honest:
 *
 * 1. **Spend is the books' own year to date, not the contract's wording.** The
 *    contract says "$3,000 a month"; the line says $18,000 for six months. The
 *    line is what was paid, so the line is what prints. A contract whose rate and
 *    whose line ever disagree is a question for the council, not a number this
 *    sheet may paper over.
 *
 * 2. **One account belongs to one vendor.** Two vendors claiming the same code
 *    would each print the whole line and the page would total the budget twice.
 *    A code claimed twice is removed from both rows and returned as a defect, so
 *    the page says the register is ambiguous instead of paying one line to two
 *    suppliers. A vendor may hold several codes — the concierge's wages and the
 *    employer's share are one employment — and the row adds them.
 *
 * 3. **Every operating line is accounted for exactly once.** The rows plus the
 *    lines no contract claims are the expense budget, to the cent, for both the
 *    year and the year to date. That is the page's check: a reader who adds the
 *    contracted rows and the uncontracted block lands on the budget, and a line
 *    that goes missing shows up as a difference rather than as silence.
 *
 * 4. **Money paid outside the operating budget is named, never folded in.** The
 *    membrane contractor is paid from the parkade levy's trust. Putting that
 *    spend on the operating page would overstate the building's running cost and
 *    double-count a project the levy page already accounts for, so a contract
 *    with no operating line is listed apart with the fund it is paid from.
 *
 * Label-free: the caller supplies names, account codes and the amount each
 * outside contract has been paid, so the module is testable without a catalog.
 */

export interface SpendLine {
	code: string;
	name: string;
	annualCents: number;
	ytdCents: number;
	/** The books' own phrase for why the line sits where it does. */
	reason?: string;
}

export interface VendorContract {
	vendor: string;
	service: string;
	renewal: string;
	note?: string;
	/** Ledger codes this vendor is paid from. Empty when it is paid from another fund. */
	accounts: readonly string[];
	/** The fund that pays it when `accounts` is empty, e.g. `levy`. */
	fund?: string;
}

export interface VendorSpendRow {
	vendor: string;
	service: string;
	renewal: string;
	note?: string;
	/** The ledger lines behind the money, in the order the register claims them. */
	lines: SpendLine[];
	annualCents: number;
	ytdCents: number;
	leftCents: number;
	/** Year to date over the annual budget; null when nothing is budgeted. */
	usedShare: number | null;
	/** Why the line moved, from the books, when the books say. */
	reason?: string;
}

export interface VendorSpendTotal {
	annualCents: number;
	ytdCents: number;
	leftCents: number;
}

export interface OutsideRow {
	vendor: string;
	service: string;
	/** The fund that paid, e.g. the parkade levy's trust. */
	fund: string;
	/** What that fund has actually paid this vendor. */
	paidCents: number;
	note?: string;
}

export interface VendorSpend {
	/** Register order, for the vendors paid from the operating budget. */
	rows: VendorSpendRow[];
	contracted: VendorSpendTotal;
	/** The budget lines no contract claims, in ledger order. */
	unclaimedLines: SpendLine[];
	unclaimed: VendorSpendTotal;
	/** Rows plus the unclaimed block: the operating expense budget. */
	total: VendorSpendTotal;
	/** Contracts paid from another fund; never part of the totals above. */
	outside: OutsideRow[];
	/** Codes two vendors both claim. Excluded from every row and the totals. */
	duplicates: string[];
	/** Codes a contract claims that no expense line carries. */
	missing: string[];
	/** The budget's own expense total, for the check the page prints. */
	budget: VendorSpendTotal;
	/** `total` less `budget`, on each column. Zero when the page balances. */
	difference: VendorSpendTotal;
}

export interface VendorSpendInput {
	lines: readonly SpendLine[];
	contracts: readonly VendorContract[];
	/** What each outside contract has been paid, by vendor name. */
	outsidePaid?: Readonly<Record<string, number>>;
}

function total(rows: Array<{ annualCents: number; ytdCents: number; leftCents: number }>): VendorSpendTotal {
	return rows.reduce<VendorSpendTotal>(
		(sum, row) => ({
			annualCents: sum.annualCents + row.annualCents,
			ytdCents: sum.ytdCents + row.ytdCents,
			leftCents: sum.leftCents + row.leftCents
		}),
		{ annualCents: 0, ytdCents: 0, leftCents: 0 }
	);
}

function sumLines(lines: readonly SpendLine[]): VendorSpendTotal {
	const annualCents = lines.reduce((sum, line) => sum + line.annualCents, 0);
	const ytdCents = lines.reduce((sum, line) => sum + line.ytdCents, 0);
	return { annualCents, ytdCents, leftCents: annualCents - ytdCents };
}

/**
 * The join. Rows keep the register's order because that is the order the council
 * reviews contracts in; the unclaimed block keeps the budget's own order.
 */
export function vendorSpend(input: VendorSpendInput): VendorSpend {
	const byCode = new Map(input.lines.map((line) => [line.code, line]));

	// Which vendor claims each code, and which codes are claimed twice.
	const claims = new Map<string, string[]>();
	for (const contract of input.contracts) {
		for (const code of contract.accounts) {
			claims.set(code, [...(claims.get(code) ?? []), contract.vendor]);
		}
	}
	const duplicates = [...claims.entries()]
		.filter(([, vendors]) => new Set(vendors).size > 1)
		.map(([code]) => code)
		.sort();
	const duplicateSet = new Set(duplicates);

	const missing = [...claims.keys()]
		.filter((code) => !byCode.has(code))
		.sort();

	const rows: VendorSpendRow[] = [];
	for (const contract of input.contracts) {
		if (contract.accounts.length === 0) continue;
		const lines = contract.accounts
			.filter((code) => !duplicateSet.has(code))
			.map((code) => byCode.get(code))
			.filter((line): line is SpendLine => Boolean(line));
		// A vendor whose only codes are ambiguous prints no money row: a row of
		// zeroes would read as "paid nothing", which is not what a duplicate means.
		if (lines.length === 0) continue;
		const sums = sumLines(lines);
		const reason = lines.find((line) => line.reason?.trim())?.reason;
		rows.push({
			vendor: contract.vendor,
			service: contract.service,
			renewal: contract.renewal,
			note: contract.note,
			lines,
			...sums,
			usedShare: sums.annualCents > 0 ? sums.ytdCents / sums.annualCents : null,
			reason
		});
	}

	const claimed = new Set(
		input.contracts.flatMap((contract) =>
			contract.accounts.filter((code) => byCode.has(code) && !duplicateSet.has(code))
		)
	);
	const unclaimedLines = input.lines.filter((line) => !claimed.has(line.code));

	const outside: OutsideRow[] = input.contracts
		.filter((contract) => contract.accounts.length === 0)
		.map((contract) => ({
			vendor: contract.vendor,
			service: contract.service,
			fund: contract.fund ?? 'other',
			paidCents: input.outsidePaid?.[contract.vendor] ?? 0,
			note: contract.note
		}));

	const contracted = total(rows);
	const unclaimed = sumLines(unclaimedLines);
	const budget = sumLines(input.lines);
	const all = total([
		...rows,
		{ ...unclaimed }
	]);

	return {
		rows,
		contracted,
		unclaimedLines,
		unclaimed,
		total: all,
		outside,
		duplicates,
		missing,
		budget,
		difference: {
			annualCents: all.annualCents - budget.annualCents,
			ytdCents: all.ytdCents - budget.ytdCents,
			leftCents: all.leftCents - budget.leftCents
		}
	};
}

/**
 * The share of a line a vendor has used, as a whole percentage for the page.
 * Rounded half up so 49.5% cannot print as 49% and read as under half.
 */
export function usedPercent(row: Pick<VendorSpendRow, 'usedShare'>): number | null {
	return row.usedShare === null ? null : Math.round(row.usedShare * 100);
}
