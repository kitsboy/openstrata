<script lang="ts">
	/**
	 * The close on one printed page.
	 *
	 * The overview tab answers "does the close work" on screen: cards, the tie
	 * line and the five checks. This is the same close as paper — cash on deposit,
	 * then each fund counted from its accounts and again from the year's activity,
	 * with the difference between the two counts printed rather than asserted.
	 *
	 * Paper values, not theme tokens, like every printable sheet here: dark mode
	 * cannot change what a council files. The arithmetic lives in
	 * `close-reconciliation.ts`; this component supplies the labels and formats
	 * the figures.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building, TOTAL_ENTITLEMENT, units } from '$lib/demo/building';
	import { books } from '$lib/demo/books';
	import type {
		CloseReconciliation,
		ReconLine,
		ReconGroup,
		ReconLabel,
		ReconSection
	} from '$lib/close-reconciliation';

	let { sheet }: { sheet: CloseReconciliation } = $props();

	/**
	 * Every label on the sheet, one map for the catalog and the books' own names.
	 * Typed as a complete record of the union, so a label the module can emit and
	 * this map does not translate fails `npm run check` instead of printing blank.
	 */
	const labels = $derived<Record<ReconLabel, string>>({
		cashTitle: $copy.accReconCashTitle,
		operatingTitle: $copy.accReconOperatingTitle,
		crfTitle: $copy.accContingencyReserve,
		levyTitle: $copy.accParkadeLevy,
		budgetTitle: $copy.accTabBudget,
		accounts: $copy.accReconAccounts,
		activity: $copy.accReconActivity,
		difference: $copy.accReconDifference,
		operating: $copy.accFundOperating,
		receivables: $copy.accFundReceivables,
		prepaidInsurance: $copy.accPrepaidInsurance,
		warChest: $copy.accWarChestAtCost,
		bills: $copy.accReconBills,
		prepaidFees: $copy.accPrepaidFees,
		payroll: $copy.accReconPayroll,
		openingEquity: $copy.accReconOpening,
		fees: $copy.accReconFees,
		otherIncome: $copy.accReconOther,
		expenses: $copy.accReconExpenses,
		crf: $copy.accContingencyReserve,
		crfReceivables: $copy.accFundReceivables,
		crfPrepaid: $copy.accPrepaidFees,
		crfOpening: $copy.accCrfOpening,
		crfContributions: $copy.accCrfContributions,
		crfInterest: $copy.accCrfInterest,
		// The study is the books' own name for the spend, not catalog copy.
		crfStudy: books.crf.study,
		levy: $copy.accParkadeLevy,
		levyCash: $copy.accReconLevyCash,
		levyOwing: $copy.accStillOwing,
		levyAssessed: $copy.accReconAssessed,
		levySpent: $copy.accLevySpent,
		levyRemaining: $copy.accLevyRemaining,
		budgetFees: $copy.accRowStrataFees,
		budgetReserve: $copy.accRowCrfContribution,
		budgetOther: $copy.accReconOther,
		budgetExpenses: $copy.accReconExpenses,
		budgetResult: $copy.accRowBudgetResult,
		cashTotal: $copy.accColTotal,
		fundBalance: $copy.accFundBalance
	});

	/** A group with a second count is told apart by its heading, not by a colour. */
	function heading(section: ReconSection, group: ReconGroup): string {
		return section.groups.length > 1 ? labels[group.id] : '';
	}

	/** Money with its direction written, so a page needs no colour code. */
	function signed(cents: number): string {
		if (cents === 0) return money(0);
		return cents > 0 ? `+${money(cents)}` : `−${money(-cents)}`;
	}

	/** A line that takes away is printed with the minus, not as a negative. */
	function amount(line: ReconLine): string {
		return line.side === 'less' ? `−${money(line.cents)}` : money(line.cents);
	}

	const lots = formatNumber(units.length, $locale);
	const points = formatNumber(TOTAL_ENTITLEMENT, $locale);
</script>

<article class="print-doc recon-doc" aria-labelledby="recon-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<BrandMark size={30} />
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
		<h1 id="recon-title">{$copy.accReconTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.accReconSubtitle, { date: building.asOfLabel })}
		</p>
	</div>

	<div class="recon-table-wrap">
		<table class="recon-table">
			<caption class="sr-only">{$copy.accReconTitle}</caption>
			<thead>
				<tr>
					<th scope="col" class="line">{$copy.accColAccount}</th>
					<th scope="col" class="num">{$copy.accColAmount}</th>
				</tr>
			</thead>
			{#each sheet.sections as section (section.id)}
				<tbody>
					<tr class="section-head">
						<th scope="colgroup" colspan="2">{labels[section.title]}</th>
					</tr>
					{#each section.groups as group (group.id)}
						{#if heading(section, group)}
							<tr class="group-head">
								<th scope="colgroup" colspan="2">{heading(section, group)}</th>
							</tr>
						{/if}
						{#each group.lines as line (line.id)}
							<tr>
								<th scope="row" class="line {line.side}">
									{labels[line.id]}
									{#if line.code}<span class="line-code">{line.code}</span>{/if}
								</th>
								<td class="num {line.side}">{amount(line)}</td>
							</tr>
						{/each}
						<tr class="group-total">
							<th scope="row" class="line">{labels[group.totalId]}</th>
							<td class="num">{money(group.total)}</td>
						</tr>
					{/each}
					{#if section.groups.length > 1}
						<tr class="recon-verdict">
							<th scope="row" class="line">{labels.difference}</th>
							<td class="num">
								{signed(section.difference)}
								<span class="verdict-word">
									{section.ok
										? $copy.accReconAgrees
										: fill($copy.accReconOffBy, {
												amount: money(Math.abs(section.difference))
											})}
								</span>
							</td>
						</tr>
					{/if}
				</tbody>
			{/each}
		</table>
	</div>

	<div class="recon-checks">
		{#each sheet.checks as check (check.id)}
			<p class="recon-check">
				<span class="recon-mark" aria-hidden="true">{check.ok ? '✓' : '·'}</span>
				<span class="recon-check-text">
					{check.id === 'journal'
						? $copy.accReconJournal
						: fill($copy.accReconEntitlement, { lots, points })}
				</span>
				<span class="recon-status">
					{check.ok ? $copy.accReconAgrees : $copy.accReconFails}
				</span>
			</p>
		{/each}
	</div>

	<p class="print-basis">{$copy.accReconBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.accReconFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.recon-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 1.8rem 2.1rem 1rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9pt;
		line-height: 1.35;
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
	.print-brand {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		color: #f0801a;
	}
	.print-org {
		margin: 0;
		/* Explicit ink: inheriting the sheet's muted body colour left the 13.5pt
		   building name under the 4.5:1 AA floor. */
		color: #14181c;
		font-size: 13.5pt;
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
		font-size: 7.6pt;
		overflow-wrap: anywhere;
	}
	.print-rule {
		height: 2px;
		margin: 9px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 16pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9pt;
	}

	.recon-table-wrap {
		margin: 10px 0 0;
		overflow-x: auto;
	}
	.recon-table {
		width: 100%;
		min-width: 460px;
		border-collapse: collapse;
		font-size: 7.6pt;
		table-layout: fixed;
	}
	.recon-table thead th {
		padding: 4px 6px;
		border-bottom: 1px solid #c9cfd4;
		background: #f7f9fa;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-align: left;
		text-transform: uppercase;
	}
	.recon-table tbody + tbody {
		border-top: 2px solid #c9cfd4;
	}
	.recon-table th,
	.recon-table td {
		padding: 2.5px 6px;
		text-align: left;
		vertical-align: top;
	}
	.recon-table tbody th.line {
		font-weight: 400;
	}
	.recon-table .line {
		width: auto;
	}
	.recon-table .num {
		width: 32mm;
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.recon-table .section-head th {
		padding-top: 6px;
		padding-bottom: 3px;
		border-bottom: 1px solid #c9cfd4;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.recon-table .group-head th {
		padding-top: 3px;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.recon-table .line-code {
		margin-left: 6px;
	/* #7a858f cleared 6.2pt text at only ~3.6:1; this is the same grey the
	   other small print on the sheet uses and clears AA. */
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		white-space: nowrap;
	}
	.recon-table .less {
		color: #5a6672;
	}
	.recon-table .group-total th,
	.recon-table .group-total td {
		border-top: 1px solid #e8ecef;
		font-weight: 700;
	}
	.recon-table .recon-verdict th,
	.recon-table .recon-verdict td {
		border-top: 1px solid #c9cfd4;
		padding-top: 3px;
		font-weight: 700;
	}
	.recon-table .recon-verdict td {
		white-space: normal;
	}
	.verdict-word {
		margin-left: 4px;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.recon-checks {
		margin: 8px 0 0;
		padding-top: 5px;
		border-top: 1px solid #dfe4e8;
	}
	.recon-check {
		display: flex;
		align-items: baseline;
		gap: 5px;
		margin: 0 0 2px;
		font-size: 7.4pt;
	}
	.recon-check-text {
		flex: 1;
		min-width: 0;
	}
	.recon-mark {
		color: #f0801a;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-weight: 700;
	}
	.recon-status {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.print-basis {
		margin: 6px 0 0;
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
		.recon-table-wrap {
			overflow: visible;
		}
		.recon-table {
			min-width: 0;
			/* The sheet is longer than one Letter page by its nature — five funds and
			   the checks — so the table must be allowed to break between rows. The
			   generic `.print-doc table { break-inside: avoid }` rule turns the whole
			   sheet into an unbreakable block, which pushes the letterhead and the
			   foot onto pages of their own. Rows still never split. */
			break-inside: auto;
		}
		/* A fund is one idea: its two counts and their difference move to the next
		   page together rather than splitting between the accounts and the year. */
		.recon-table tbody {
			break-inside: avoid;
		}
	}

	@media (max-width: 640px) {
		.recon-doc {
			padding: 1.2rem 1rem;
			border-radius: 10px;
			font-size: 8pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 6px;
		}
		.print-ref {
			text-align: left;
		}
		.recon-table {
			min-width: 400px;
		}
	}
</style>
