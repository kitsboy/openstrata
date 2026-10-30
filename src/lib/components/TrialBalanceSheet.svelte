<script lang="ts">
	/**
	 * The journal's second sheet: every account it touched, added by code.
	 *
	 * The arithmetic lives in `trial-balance`; this sets the columns, the two
	 * totals and the sentence that says whether they agree.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { TrialBalance } from '$lib/trial-balance';

	let { sheet }: { sheet: TrialBalance } = $props();

	const unmovedList = $derived(sheet.unmoved.map((account) => account.code).join(', '));
	const signed = (cents: number) =>
		cents === 0 ? money(0) : cents > 0 ? money(cents) : `−${money(-cents)}`;
</script>

<article class="print-doc trial-doc" aria-labelledby="trial-balance-title">
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
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="trial-balance-title">{$copy.accTrialTitle}</h1>
		<p class="print-subtitle">{$copy.accTrialSubtitle}</p>
	</div>

	<div class="trial-table-wrap">
		<table class="trial-table">
			<caption class="sr-only">{$copy.accTrialTitle}</caption>
			<thead>
				<tr>
					<th scope="col">{$copy.accColAccount}</th>
					<th scope="col" class="num">{$copy.accTrialDebit}</th>
					<th scope="col" class="num">{$copy.accTrialCredit}</th>
					<th scope="col" class="num">{$copy.accTrialBalance}</th>
				</tr>
			</thead>
			<tbody>
				{#each sheet.rows as row (row.code)}
					<tr>
						<th scope="row">
							<span class="code">{row.code}</span>
							<span class="name">{row.name}</span>
						</th>
						<td class="num">{row.debitCents === 0 ? '—' : money(row.debitCents)}</td>
						<td class="num">{row.creditCents === 0 ? '—' : money(row.creditCents)}</td>
						<td class="num">{signed(row.balanceCents)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="group-total">
					<th scope="row">{$copy.accColTotal}</th>
					<td class="num">{money(sheet.debitTotalCents)}</td>
					<td class="num">{money(sheet.creditTotalCents)}</td>
					<td class="num">{signed(sheet.balanceTotalCents)}</td>
				</tr>
				<tr class="verdict">
					<th scope="row" colspan="3">
						{sheet.ok ? $copy.accTrialAgrees : $copy.accTrialFails}
					</th>
					<td class="num">{money(sheet.differenceCents)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	{#if sheet.unmoved.length > 0}
		<p class="trial-unmoved">
			{fill($copy.accTrialUnmoved, {
				count: formatNumber(sheet.unmoved.length, $locale),
				list: unmovedList
			})}
		</p>
	{/if}

	<p class="print-note">{$copy.accTrialBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.accTrialFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.trial-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.2pt;
		line-height: 1.32;
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
		font-size: 9.2pt;
	}
	.trial-table-wrap {
		margin-top: 11px;
	}
	.trial-table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 8.2pt;
	}
	.trial-table th,
	.trial-table td {
		padding: 2.6px 5px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.trial-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 7pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.trial-table thead th:first-child {
		width: 46%;
	}
	.trial-table .code {
		display: inline-block;
		width: 3.4em;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.6pt;
	}
	.trial-table .name {
		font-weight: 600;
	}
	.trial-table .num {
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.trial-table tfoot th,
	.trial-table tfoot td {
		border-bottom: 0;
		padding-top: 4px;
	}
	.trial-table tfoot .group-total th,
	.trial-table tfoot .group-total td {
		border-top: 1.5px solid #14181c;
		font-weight: 700;
	}
	.trial-table tfoot .verdict th {
		color: #1f4d2b;
		font-size: 8pt;
	}
	.trial-unmoved {
		margin: 10px 0 0;
		color: #4b5563;
		font-size: 8pt;
		line-height: 1.4;
	}
	.print-note {
		margin: 10px 0 2px;
		padding: 6px 9px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 8.2pt;
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
		.trial-doc {
			padding: 1.4rem 1.15rem;
			border-radius: 10px;
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
