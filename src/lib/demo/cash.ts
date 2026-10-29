/**
 * The credit union's month-end balances, April to September 2026.
 *
 * The journal is a September sample, but the three accounts have statements for
 * every month, and a treasurer reads them that way: what was in the bank at each
 * month end. So the closes are records rather than a formula — the bank's number
 * is the fact, and a figure derived from the budget would be an estimate wearing
 * a statement's clothes.
 *
 * Three things keep the record honest:
 *
 * 1. **September is the close the rest of the books report.** Its three figures
 *    are `books.operating.cash`, `books.crf.cash` and `books.levy.cash`, and a
 *    test says so. The month-by-month table therefore lands on the funds tab's
 *    own cash rather than beside it.
 * 2. **The parkade levy runs exactly through its own money.** It was collected
 *    before this fiscal year began — $207,948 on the resolution of 12 November
 *    2025 — and the April 1 balance is that collection, untouched. $176,400 of
 *    the $216,000 project was billed and paid across six months, and what is
 *    left at 30 September is the $31,548 trust balance.
 * 3. **The operating account moves with the fee run.** April to August carry the
 *    month's fee income less the month's allocated expenses, which is the same
 *    split the budget chart draws. September's movement is what the two
 *    statements say, and it is larger than its own fee-and-expense line because
 *    the timing lands there: October's fees were prepaid, five vendor bills were
 *    still unpaid, and the source deductions were owed rather than paid.
 */

export interface CashMonth {
	/** `YYYY-MM`, the fiscal month the balance closes. */
	period: string;
	/** The statement date: the month's last day. */
	asOf: string;
	/** 1010 operating chequing, in cents. */
	operating: number;
	/** 1020 CRF savings, in cents. */
	crf: number;
	/** The parkade levy trust account, in cents. */
	levy: number;
}

/**
 * The fiscal year's opening balances on 1 April 2026, before any month closed.
 * The levy's is the collection, because nothing had been paid out of it yet in
 * this fiscal year and the resolution predates it.
 */
export const openingCash = {
	operating: 3_842_500,
	crf: 58_640_000,
	levy: 20_794_800
} as const;

export const cashMonths: CashMonth[] = [
	{ period: '2026-04', asOf: '2026-04-30', operating: 4_758_316, crf: 59_000_000, levy: 17_794_800 },
	{ period: '2026-05', asOf: '2026-05-31', operating: 5_419_249, crf: 59_360_000, levy: 14_794_800 },
	{ period: '2026-06', asOf: '2026-06-30', operating: 6_207_624, crf: 59_720_000, levy: 11_794_800 },
	{ period: '2026-07', asOf: '2026-07-31', operating: 6_868_557, crf: 60_080_000, levy: 8_794_800 },
	{ period: '2026-08', asOf: '2026-08-31', operating: 7_402_048, crf: 60_440_000, levy: 5_794_800 },
	{ period: '2026-09', asOf: '2026-09-30', operating: 8_179_762, crf: 60_368_880, levy: 3_154_800 }
];
