<script lang="ts">
	/**
	 * The whole building's fee schedule on one page.
	 *
	 * Every figure is computed in `fee-schedule` from the lot's entitlement and the
	 * budget's two rates; this sets the columns and the totals a council approves.
	 * A tenanted lot is marked with its tenant, because the register is where a
	 * council starts reading.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import { BOOK_FEE_RATES, type FeeSchedule } from '$lib/fee-schedule';

	let { sheet }: { sheet: FeeSchedule } = $props();
</script>

<article class="print-doc fee-doc" aria-labelledby="fee-schedule-title">
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
			<dt>{$copy.unitsFeeSheetLots}</dt>
			<dd>{formatNumber(sheet.lots, $locale)}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="fee-schedule-title">{$copy.unitsFeeSheetTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.unitsFeeSheetSubtitle, { rate: money(BOOK_FEE_RATES.monthlyCents) })}
		</p>
	</div>

	<div class="fee-table-wrap">
		<table class="fee-table">
			<caption class="sr-only">{$copy.unitsFeeSheetTitle}</caption>
			<thead>
				<tr>
					<th scope="col" class="lot">{$copy.payLot}</th>
					<th scope="col">{$copy.accColOwner}</th>
					<th scope="col" class="num">{$copy.unitsEntitlement}</th>
					<th scope="col" class="num">{$copy.accFundOperating}</th>
					<th scope="col" class="num">{$copy.accContingencyReserve}</th>
					<th scope="col" class="num">{$copy.unitsMonthlyFee}</th>
					<th scope="col" class="num">{$copy.unitsFeeSheetAnnual}</th>
				</tr>
			</thead>
			<tbody>
				{#each sheet.rows as row (row.unitId)}
					<tr>
						<th scope="row" class="lot">{row.unitId}</th>
						<td class="who">
							{row.owner}{#if row.tenant}<span class="tenant"> · {$copy.unitsFeeSheetTenant}: {row.tenant}</span>{/if}
						</td>
						<td class="num">{formatNumber(row.points, $locale)}</td>
						<td class="num">{money(row.operatingCents)}</td>
						<td class="num">{money(row.crfCents)}</td>
						<td class="num">{money(row.monthlyCents)}</td>
						<td class="num">{money(row.annualCents)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="group-total">
					<th scope="row" colspan="2">{$copy.accColTotal}</th>
					<td class="num">{formatNumber(sheet.points, $locale)}</td>
					<td class="num">{money(sheet.operatingCents)}</td>
					<td class="num">{money(sheet.crfCents)}</td>
					<td class="num">{money(sheet.monthlyCents)}</td>
					<td class="num">{money(sheet.annualCents)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="fee-note">
		{fill($copy.unitsFeeSheetTenanted, {
			tenanted: formatNumber(sheet.tenanted, $locale),
			lots: formatNumber(sheet.lots, $locale)
		})}
	</p>

	<p class="print-note">{$copy.unitsFeeSheetBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.unitsFeeSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.fee-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9pt;
		line-height: 1.3;
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
	.fee-table-wrap {
		margin-top: 10px;
	}
	.fee-table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 6.9pt;
		line-height: 1.16;
	}
	.fee-table th,
	.fee-table td {
		padding: 1px 4px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.fee-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.2pt;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.fee-table .lot {
		width: 7%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	.fee-table .who {
		width: 31%;
	}
	.fee-table .num {
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.fee-table .tenant {
		color: #5a6672;
		font-size: 6.1pt;
		font-style: italic;
	}
	.fee-table tfoot th,
	.fee-table tfoot td {
		border-bottom: 0;
		padding-top: 4px;
	}
	.fee-table tfoot .group-total th,
	.fee-table tfoot .group-total td {
		border-top: 1.5px solid #14181c;
		font-weight: 700;
		font-size: 7pt;
	}
	.fee-note {
		margin: 5px 0 0;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.print-note {
		margin: 5px 0 0;
		padding: 5px 8px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.print-foot {
		margin-top: 8px;
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
		.fee-doc {
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
		.fee-doc .fee-table-wrap {
			overflow-x: auto;
		}
		.fee-table {
			min-width: 520px;
		}
	}
</style>
