<script lang="ts">
	/**
	 * The receivables ladder on one printed page.
	 *
	 * The Receivables tab answers "who owes what, and how late is it" with cards,
	 * a filter and a table that scrolls. This is the same book as the page a
	 * council puts on the table: the lots with money past due, each charge aged
	 * into the column it belongs in, the columns added up, and one line that
	 * accounts for every other lot and the standing total.
	 *
	 * Paper values, not theme tokens, like every printable sheet here: dark mode
	 * cannot change what a council hands round. The selection and the arithmetic
	 * live in `arrears-sheet.ts`; this component formats what it is given.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { ArrearsSheet } from '$lib/arrears-sheet';

	let { sheet }: { sheet: ArrearsSheet } = $props();

	const asOf = $derived(
		formatDate(sheet.asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' })
	);
	const share = $derived(
		formatNumber(sheet.over90Share, $locale, { style: 'percent', maximumFractionDigits: 0 })
	);

	/** A column with nothing in it prints a dash, so a zero is never mistaken for a gap. */
	function amount(cents: number): string {
		return cents === 0 ? '—' : money(cents);
	}
</script>

<article class="print-doc arrears-doc" aria-labelledby="arrears-sheet-title">
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
		<h1 id="arrears-sheet-title">{$copy.accArrearsSheetTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.accArrearsSheetSubtitle, {
				date: asOf,
				late: formatNumber(sheet.lateLots, $locale),
				lots: formatNumber(sheet.lots, $locale)
			})}
		</p>
	</div>

	<div class="arrears-cards">
		<div class="arrears-card">
			<p class="arrears-card-label">{$copy.accAgePastDue}</p>
			<p class="arrears-card-figure">{money(sheet.pastDue)}</p>
			<p class="arrears-card-note">
				{fill($copy.accAgePastDueLots, {
					lots: formatNumber(sheet.lateLots, $locale),
					all: formatNumber(sheet.lots, $locale)
				})}
			</p>
		</div>
		<div class="arrears-card">
			<p class="arrears-card-label">{$copy.accAgeOver90Label}</p>
			<p class="arrears-card-figure">{money(sheet.buckets.over90)}</p>
			<p class="arrears-card-note">{fill($copy.accAgeShare, { share })}</p>
		</div>
		<div class="arrears-card">
			<p class="arrears-card-label">{$copy.accAgeOldestLabel}</p>
			<p class="arrears-card-figure">{sheet.oldest?.unitId ?? '—'}</p>
			<p class="arrears-card-note">
				{#if sheet.oldest}
					{fill($copy.accAgeOldestDays, {
						days: formatNumber(sheet.oldest.days, $locale)
					})}
				{:else}
					&#8212;
				{/if}
			</p>
		</div>
	</div>

	<div class="arrears-table-wrap">
		<table class="arrears-table">
			<thead>
				<tr>
					<th scope="col" class="lot">{$copy.payLot}</th>
					<th scope="col" class="num">{$copy.accAgeCurrent}</th>
					<th scope="col" class="num">{$copy.accAge30}</th>
					<th scope="col" class="num">{$copy.accAge60}</th>
					<th scope="col" class="num">{$copy.accAge90}</th>
					<th scope="col" class="num">{$copy.accAgeOver90}</th>
					<th scope="col" class="num">{$copy.accColTotal}</th>
					<th scope="col" class="formf">{$copy.accArrearsSheetFormF}</th>
				</tr>
			</thead>
			<tbody>
				{#each sheet.rows as row (row.unitId)}
					<tr>
						<th scope="row" class="lot">
							<span class="lot-id">{row.unitId}</span>
							<span class="lot-owner">{row.owner}</span>
						</th>
						<td class="num muted">{amount(row.buckets.current)}</td>
						<td class="num">{amount(row.buckets.age30)}</td>
						<td class="num">{amount(row.buckets.age60)}</td>
						<td class="num">{amount(row.buckets.age90)}</td>
						<td class="num over">{amount(row.buckets.over90)}</td>
						<td class="num total">{money(row.total)}</td>
						<td class="formf">{row.withheld ? $copy.accArrearsSheetWithheld : '—'}</td>
					</tr>
				{/each}
				<tr class="arrears-total">
					<td class="lot">{$copy.accColTotal}</td>
					<td class="num muted">{amount(sheet.buckets.current)}</td>
					<td class="num">{amount(sheet.buckets.age30)}</td>
					<td class="num">{amount(sheet.buckets.age60)}</td>
					<td class="num">{amount(sheet.buckets.age90)}</td>
					<td class="num over">{amount(sheet.buckets.over90)}</td>
					<td class="num total">{money(sheet.total)}</td>
					<td class="formf"></td>
				</tr>
			</tbody>
		</table>
	</div>

	<p class="print-note">
		{fill($copy.accArrearsSheetBook, {
			late: formatNumber(sheet.lateLots, $locale),
			past: money(sheet.pastDue),
			current: money(sheet.current),
			notDue: money(sheet.notDue),
			standing: money(sheet.standing)
		})}
	</p>

	{#if sheet.plans.length > 0}
		<div class="arrears-plans">
			<h2 class="print-h2">{$copy.accAgePlanTitle}</h2>
			<ul>
				{#each sheet.plans as plan (plan.unitId)}
					<li>
						<span class="plan-lot">{plan.unitId} · {plan.owner}</span>
						<span class="plan-amount">{fill($copy.accArrearsSheetPlanLine, { amount: money(plan.planned) })}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<p class="print-note">
		{fill($copy.accArrearsSheetClear, {
			clear: formatNumber(sheet.clearLots, $locale),
			lots: formatNumber(sheet.lots, $locale)
		})}
	</p>

	<p class="print-basis">
		{fill($copy.accArrearsSheetBasis, { date: asOf })}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.accArrearsSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.arrears-doc {
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
	.arrears-cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
		margin: 10px 0 4px;
	}
	.arrears-card {
		padding: 6px 9px;
		border: 1px solid #dfe4e8;
		border-radius: 6px;
		background: #f7f9fa;
	}
	.arrears-card-label {
		margin: 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.arrears-card-figure {
		margin: 2px 0 0;
		font-size: 13pt;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}
	.arrears-card-note {
		margin: 1px 0 0;
		color: #4b5563;
		font-size: 7.4pt;
	}
	/* On a phone the sheet scrolls its own table rather than the page: eight
	   columns cannot compress into 358px without clipping an amount. */
	.arrears-table-wrap {
		margin-top: 8px;
		overflow-x: auto;
	}
	.arrears-table {
		width: 100%;
		min-width: 540px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8pt;
	}
	.arrears-table th,
	.arrears-table td {
		padding: 2.5px 6px;
		border-bottom: 1px solid #edf1f3;
		text-align: left;
		vertical-align: top;
	}
	.arrears-table thead th {
		padding: 3px 6px;
		border-bottom: 1px solid #c9cfd4;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.arrears-table th.lot,
	.arrears-table td.lot {
		width: 25%;
		overflow-wrap: anywhere;
	}
	.arrears-table .num {
		width: 10.5%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.arrears-table .num.total {
		width: 13%;
		font-weight: 700;
	}
	.arrears-table .formf {
		width: 9.5%;
		color: #3f4a55;
		font-size: 7.2pt;
	}
	.arrears-table thead .num,
	.arrears-table thead .formf {
		color: #3f4a55;
	}
	.arrears-table tbody tr:nth-child(even) {
		background: #fbfcfd;
	}
	.arrears-table .lot-id {
		display: block;
		font-weight: 700;
	}
	.arrears-table .lot-owner {
		display: block;
		color: #5a6672;
		font-size: 7.2pt;
		font-weight: 400;
		line-height: 1.15;
	}
	.arrears-table .muted {
		color: #4b5563;
	}
	.arrears-table .over {
		font-weight: 700;
	}
	.arrears-table .arrears-total td,
	.arrears-table .arrears-total .lot {
		padding-top: 5px;
		border-top: 1px solid #c9cfd4;
		border-bottom: 1px solid #c9cfd4;
		font-weight: 700;
	}
	.arrears-plans ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.arrears-plans li {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 2px 0;
		border-bottom: 1px dotted #dfe4e8;
		font-size: 8pt;
	}
	.arrears-plans li:last-child {
		border-bottom: 0;
	}
	.plan-lot {
		font-weight: 600;
	}
	.plan-amount {
		color: #4b5563;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.print-h2 {
		margin: 8px 0 3px;
		font-size: 8.6pt;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}
	.print-note {
		margin: 5px 0 0;
		padding: 5px 8px;
		border: 1px solid #e4d8c8;
		border-radius: 4px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.print-basis {
		margin: 5px 0 0;
		color: #5a6672;
		font-size: 7.4pt;
		line-height: 1.35;
	}
	.print-foot {
		margin-top: 7px;
		padding-top: 5px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media print {
		.arrears-table-wrap {
			overflow: visible;
		}
		.arrears-table {
			min-width: 0;
		}
	}

	@media (max-width: 640px) {
		.arrears-doc {
			padding: 1.2rem 1rem;
			border-radius: 10px;
			font-size: 8.4pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 6px;
		}
		.print-ref {
			text-align: left;
		}
		.arrears-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
