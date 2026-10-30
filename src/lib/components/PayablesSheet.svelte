<script lang="ts">
	/**
	 * The payables tab on one page: every bill the close carries, the days each
	 * one has left, and the two windows cut from the total.
	 *
	 * The rules are in `payables-sheet` — the day count, the thirty-day edge and
	 * the total that is the rows added up. This component only sets them.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { PayablesSheet } from '$lib/payables-sheet';

	let { sheet }: { sheet: PayablesSheet } = $props();

	const windowLabel = $derived(
		formatDate(sheet.windowEnd, $locale, { day: 'numeric', month: 'long', year: 'numeric' })
	);
	const closeLabel = $derived(
		formatDate(sheet.asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' })
	);
	const heldForCra = $derived(
		sheet.rows
			.filter((row) => row.account.startsWith('21'))
			.reduce((sum, row) => sum + row.cents, 0)
	);
	const vendorBills = $derived(sheet.totalCents - heldForCra);
</script>

<article class="print-doc payable-doc" aria-labelledby="payables-sheet-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<BrandMark size={28} />
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
			<dt>{$copy.accPayablesWindow}</dt>
			<dd>{windowLabel}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="payables-sheet-title">{$copy.accPayablesTitle}</h1>
		<p class="print-subtitle">{$copy.accPayablesSubtitle}</p>
	</div>

	<div class="payable-table-wrap">
		<table class="payable-table">
			<caption class="sr-only">{$copy.accPayablesTitle}</caption>
			<thead>
				<tr>
					<th scope="col" class="who">{$copy.accColWho}</th>
					<th scope="col">{$copy.accColFor}</th>
					<th scope="col" class="code">{$copy.accColAccount}</th>
					<th scope="col" class="date">{$copy.accColDue}</th>
					<th scope="col" class="num">{$copy.accPayablesDays}</th>
					<th scope="col" class="num">{$copy.accColAmount}</th>
				</tr>
			</thead>
			<tbody>
				{#each sheet.rows as row (row.vendor + row.due)}
					<tr class:overdue={row.overdue}>
						<th scope="row" class="who">{row.vendor}</th>
						<td>{row.memo}</td>
						<td class="code">{row.account}</td>
						<td class="date">{row.due}</td>
						<td class="num">
							{formatNumber(row.days, $locale)}
							{#if row.overdue}<span class="late">{$copy.accPayablesLate}</span>{/if}
						</td>
						<td class="num">{money(row.cents)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="group-total">
					<th scope="row" colspan="5">{$copy.accStateOpen}</th>
					<td class="num">{money(sheet.totalCents)}</td>
				</tr>
				<tr>
					<th scope="row" colspan="5">{fill($copy.accPayablesDueBy, { date: windowLabel })}</th>
					<td class="num">{money(sheet.within30Cents)}</td>
				</tr>
				<tr>
					<th scope="row" colspan="5">{fill($copy.accPayablesAfter, { date: windowLabel })}</th>
					<td class="num">{money(sheet.beyondCents)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="print-note">
		{fill($copy.accPayablesBasis, {
			bills: money(vendorBills),
			deductions: money(heldForCra),
			date: closeLabel
		})}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.accPayablesFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.payable-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.4pt;
		line-height: 1.35;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.25rem;
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
		font-size: 14pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.5pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 4px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8.4pt;
		font-weight: 500;
	}
	.print-rule {
		height: 2px;
		margin: 12px 0 12px;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 18pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9.4pt;
	}
	.payable-table-wrap {
		margin-top: 12px;
	}
	.payable-table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 8.6pt;
	}
	.payable-table th,
	.payable-table td {
		padding: 4px 5px;
		border-bottom: 1px solid #e6eaee;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.payable-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 7.2pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.payable-table .who {
		width: 20%;
		font-weight: 600;
	}
	.payable-table .code {
		width: 8%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.8pt;
	}
	.payable-table .date {
		width: 14%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.8pt;
		white-space: nowrap;
	}
	.payable-table .num {
		width: 15%;
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.payable-table .late {
		display: block;
		color: #9a3412;
		font-size: 7pt;
		font-style: italic;
	}
	.payable-table tfoot tr th {
		border-bottom: 0;
		padding-top: 6px;
	}
	.payable-table tfoot .group-total th,
	.payable-table tfoot .group-total td {
		border-top: 1.5px solid #14181c;
		font-weight: 700;
	}
	.payable-table tfoot td {
		border-bottom: 0;
		padding-top: 6px;
	}
	.print-note {
		margin: 12px 0 2px;
		padding: 6px 9px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 8.4pt;
	}
	.print-foot {
		margin-top: 9px;
		padding-top: 6px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media (max-width: 640px) {
		.payable-doc {
			padding: 1.4rem 1.15rem;
			border-radius: 10px;
			font-size: 9pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 8px;
		}
		.print-ref {
			text-align: left;
		}
	}
</style>
