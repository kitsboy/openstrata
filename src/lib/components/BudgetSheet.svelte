<script lang="ts">
	/**
	 * The budget on one printed page.
	 *
	 * The Budget tab answers "what did we plan and what have we spent". This sheet
	 * is the page a council reviews at the table: the annual budget, the year to
	 * date, what is left and how far the year has run from the plan, line by line,
	 * with the groups and the result adding up.
	 *
	 * Paper values, not theme tokens, like every printable sheet here: dark mode
	 * cannot change what a council hands round. The arithmetic lives in
	 * `budget-sheet.ts`; this component only supplies translated account names and
	 * formats the figures.
	 */
	import { copy, fill, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { BudgetGroup, BudgetSheet, BudgetSheetRow } from '$lib/budget-sheet';

	let { sheet }: { sheet: BudgetSheet } = $props();

	/** A row's own name, except the two the catalog names. */
	function accountLabel(row: BudgetSheetRow): string {
		if (row.code === '4000') return $copy.accRowStrataFees;
		if (row.code === '3500') return $copy.accRowCrfContribution;
		return `${row.code} ${row.name}`;
	}

	/**
	 * Money with its direction written, so a printed column needs no colour code.
	 * The word carries the sign: "$720.00 over" is unambiguous in a way that a
	 * minus in front of "under" is not.
	 */
	function variance(row: { varianceCents: number; tone: string }): string {
		if (row.tone === 'na') return '—';
		if (row.varianceCents === 0) return $copy.budgetSheetOnPlan;
		const amount = money(Math.abs(row.varianceCents));
		return `${amount} ${row.varianceCents > 0 ? $copy.budgetSheetOver : $copy.budgetSheetUnder}`;
	}

	/** A group total mixes favourable and unfavourable lines, so it is signed. */
	function signedMoney(cents: number): string {
		if (cents === 0) return money(0);
		return cents > 0 ? `+${money(cents)}` : `−${money(-cents)}`;
	}

	/** What is left is a plain amount; only an overspent line takes a minus. */
	function leftLabel(cents: number): string {
		return cents < 0 ? `−${money(-cents)}` : money(cents);
	}

	const share = $derived(
		formatNumber(sheet.monthsElapsed / sheet.monthsInYear, $locale, {
			style: 'percent',
			maximumFractionDigits: 0
		})
	);
	const groups: BudgetGroup[] = $derived([sheet.income, sheet.expense, sheet.reserve]);
	const groupLabel = $derived<Record<string, string>>({
		income: $copy.budgetSheetIncome,
		expense: $copy.budgetSheetExpenses,
		reserve: $copy.accRowCrfContribution
	});
</script>

<article class="print-doc budget-doc" aria-labelledby="budget-sheet-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<div>
				<p class="print-org">{building.name}</p>
				<p class="print-org-line">{building.legalName}</p>
				<p class="print-org-line">{building.address}, {building.city}, {building.province} {building.postal}</p>
				<p class="print-org-line">Strata Plan {building.plan}</p>
			</div>
		</div>
		<dl class="print-ref">
			<dt>{$copy.yearSheetFiscal}</dt>
			<dd>{building.fiscalLabel}</dd>
			<dt>{$copy.yearSheetBooksTo}</dt>
			<dd>{building.asOfLabel}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="budget-sheet-title">{$copy.budgetSheetTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.budgetSheetSubtitle, {
				fiscal: building.fiscalLabel,
				months: formatNumber(sheet.monthsElapsed, $locale),
				year: formatNumber(sheet.monthsInYear, $locale),
				date: building.asOfLabel
			})}
		</p>
	</div>

	<div class="budget-table-wrap">
	<table class="budget-table">
		<thead>
			<tr>
				<th scope="col" class="account">{$copy.accColAccount}</th>
				<th scope="col" class="num">{$copy.accColAnnualBudget}</th>
				<th scope="col" class="num">{$copy.yearToDate}</th>
				<th scope="col" class="num">{$copy.accColLeft}</th>
				<th scope="col" class="num">{$copy.budgetSheetColVariance}</th>
			</tr>
		</thead>
		{#each groups as group (group.id)}
			<tbody>
				<tr class="group-head">
					<th scope="rowgroup" colspan="5">{groupLabel[group.id]}</th>
				</tr>
				{#each group.rows as row (row.code)}
					<tr>
						<td class="account">{accountLabel(row)}</td>
						<td class="num">{money(row.annualCents)}</td>
						<td class="num">{money(row.ytdCents)}</td>
						<td class="num">{leftLabel(row.leftCents)}</td>
						<td class="num {row.tone}">
							{variance(row)}
							<!-- The why, under the how much. A line exactly on plan has none. -->
							{#if row.reason}<span class="variance-why">{row.reason}</span>{/if}
						</td>
					</tr>
				{/each}
				<tr class="total">
					<td class="account">{$copy.accColTotal}</td>
					<td class="num">{money(group.annualCents)}</td>
					<td class="num">{money(group.ytdCents)}</td>
					<td class="num">{leftLabel(group.leftCents)}</td>
					<td class="num">{signedMoney(group.varianceCents)}</td>
				</tr>
			</tbody>
		{/each}
		<tbody>
			<tr class="result">
				<td class="account">{$copy.accRowBudgetResult}</td>
				<td class="num">{money(sheet.result.annualCents)}</td>
				<td class="num">{money(sheet.result.ytdCents)}</td>
				<td class="num">{leftLabel(sheet.result.leftCents)}</td>
				<td class="num {sheet.result.tone}">{variance(sheet.result)}</td>
			</tr>
		</tbody>
	</table>
	</div>

	<p class="print-note">
		{fill($copy.budgetSheetPlanNote, { share, months: formatNumber(sheet.monthsElapsed, $locale), date: building.asOfLabel })} {$copy.budgetSheetReasonNote}
	</p>
	<p class="print-basis">{$copy.budgetSheetBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.budgetSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.budget-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 1.6rem 2rem 0.9rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 8.4pt;
		line-height: 1.3;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
	}
	.print-letterhead > * {
		min-width: 0;
	}
	.print-org {
		margin: 0;
		font-size: 13pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		/* Two long values — the fiscal year and the statement date — fit on the
		   paper only if they are allowed to wrap rather than push past the edge. */
		flex: 0 1 auto;
		max-width: 58mm;
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 4px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.4pt;
		overflow-wrap: anywhere;
	}
	.print-rule {
		height: 2px;
		margin: 7px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 15pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 2px 0 0;
		color: #3f4a55;
		font-size: 8.4pt;
	}
	/* On a phone the sheet scrolls its own table rather than the page: five
	   money columns cannot compress into 358px without clipping an amount. */
	.budget-table-wrap {
		margin-top: 6px;
		overflow-x: auto;
	}
	.budget-table {
		width: 100%;
		min-width: 560px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 7.2pt;
		line-height: 1.18;
	}
	.budget-table th,
	.budget-table td {
		padding: 0.5px 5px;
		border-bottom: 1px solid #edf1f3;
		vertical-align: top;
	}
	.budget-table thead th {
		padding: 2px 5px;
		border-bottom: 1px solid #c9cfd4;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-align: right;
		text-transform: uppercase;
	}
	.budget-table thead th.account {
		text-align: left;
	}
	.budget-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.budget-table .account {
		overflow-wrap: anywhere;
	}
	.budget-table th:first-child,
	.budget-table td.account {
		width: 28%;
	}
	/* The variance column carries the reason under the amount, so it needs the
	   room the other three money columns can spare. */
	.budget-table th:last-child,
	.budget-table td:last-child {
		width: 24%;
	}
	.variance-why {
		display: block;
		color: #5a6672;
		font-family: Georgia, 'Times New Roman', serif;
		font-style: italic;
		font-size: 6.2pt;
		font-weight: 400;
		line-height: 1.05;
		white-space: normal;
	}
	.budget-table .group-head th {
		padding-top: 4px;
		border-bottom: 1px solid #c9cfd4;
		background: #f7f9fa;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-align: left;
		text-transform: uppercase;
	}
	.budget-table .total td {
		border-top: 1px solid #c9cfd4;
		border-bottom: 1px solid #c9cfd4;
		font-weight: 700;
	}
	.budget-table .result td {
		padding-top: 2px;
		font-size: 8pt;
		font-weight: 700;
	}
	.budget-table td.unfavourable {
		font-weight: 700;
	}
	.budget-table td.on,
	.budget-table td.favourable {
		color: #3f4a55;
	}
	.print-note {
		margin: 4px 0 0;
		padding: 4px 7px;
		border: 1px solid #e4d8c8;
		border-radius: 4px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.4pt;
	}
	.print-basis {
		margin: 4px 0 0;
		color: #5a6672;
		font-size: 7pt;
		line-height: 1.35;
	}
	.print-foot {
		margin-top: 6px;
		padding-top: 4px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media print {
		.budget-table-wrap {
			overflow: visible;
		}
		.budget-table {
			min-width: 0;
		}
	}

	@media (max-width: 640px) {
		.budget-doc {
			padding: 1.2rem 1rem;
			border-radius: 10px;
			font-size: 7.6pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 6px;
		}
		.print-ref {
			text-align: left;
		}
	}
</style>
