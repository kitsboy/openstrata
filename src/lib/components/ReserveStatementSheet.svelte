<script lang="ts">
	/**
	 * The reserve contribution, owner by owner, on one page.
	 *
	 * The allocation belongs to `reserve-statement`: a lot's share is its points,
	 * the budget column is the rate the budget charges, and the recommendation is
	 * split without losing a cent. The sheet lays the rows out and states the gap
	 * the AGM votes on.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { ReserveStatement } from '$lib/reserve-statement';

	let { statement }: { statement: ReserveStatement } = $props();

	const gap = $derived(
		fill($copy.reserveSheetGap, {
			funded: money(statement.budgetAnnualCents),
			recommended: money(statement.recommendedAnnualCents),
			gap: money(statement.differenceCents),
			perPoint: money(statement.recommendedPerPointAnnualCents)
		})
	);
</script>

<article class="print-doc reserve-statement-doc" aria-labelledby="reserve-statement-title">
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
			<dt>{$copy.vendorSheetFiscal}</dt>
			<dd>{building.fiscalLabel}</dd>
			<dt>{$copy.reserveSheetReport}</dt>
			<dd>{statement.report.dated}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="reserve-statement-title">{$copy.reserveSheetTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.reserveSheetSubtitle, {
				points: formatNumber(statement.points, $locale),
				lots: formatNumber(statement.rows.length, $locale)
			})}
		</p>
	</div>

	<div class="rs-wrap">
		<table class="rs-table">
			<caption class="sr-only">{$copy.reserveSheetTitle}</caption>
			<thead>
				<tr>
					<th scope="col" class="lot">{$copy.payLot}</th>
					<th scope="col" class="owner">{$copy.accColOwner}</th>
					<th scope="col" class="num">{$copy.unitsPoints}</th>
					<th scope="col" class="num">{$copy.accCrfContributions}</th>
					<th scope="col" class="num">{$copy.reserveSheetRecommended}</th>
					<th scope="col" class="num">{$copy.reserveSheetDifference}</th>
				</tr>
			</thead>
			<tbody>
				{#each statement.rows as row (row.unitId)}
					<tr>
						<th scope="row" class="lot">{row.unitId}</th>
						<td class="owner">{row.owner}</td>
						<td class="num">{formatNumber(row.entitlement, $locale)}</td>
						<td class="num">{money(row.budgetAnnualCents)}</td>
						<td class="num">{money(row.recommendedAnnualCents)}</td>
						<td class="num">{money(row.differenceCents)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="2">{$copy.reserveSheetTotal}</th>
					<td class="num">{formatNumber(statement.points, $locale)}</td>
					<td class="num">{money(statement.budgetAnnualCents)}</td>
					<td class="num">{money(statement.recommendedAnnualCents)}</td>
					<td class="num">{money(statement.differenceCents)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="rs-gap">{gap}</p>

	<p class="rs-received">
		{fill($copy.reserveSheetReceived, {
			received: money(statement.receivedCents),
			arrears: money(statement.arrearsCents),
			months: formatNumber(statement.monthsElapsed, $locale)
		})}
	</p>

	{#if statement.shortfall}
		<p class="rs-shortfall">
			{fill($copy.reserveSheetShortfall, {
				year: statement.shortfall.year,
				amount: money(statement.shortfall.cents)
			})}
		</p>
	{:else}
		<p class="rs-shortfall">{$copy.reserveSheetCovers}</p>
	{/if}

	<p class="print-note">{$copy.reserveSheetBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.vendorSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.reserve-statement-doc {
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
		margin: 12px 0;
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
	.rs-wrap {
		margin-top: 9px;
	}
	.rs-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 6.9pt;
		line-height: 1.15;
	}
	.rs-table th,
	.rs-table td {
		padding: 1.45px 3px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.rs-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.2pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.rs-table .lot {
		width: 6%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	.rs-table .owner {
		width: 31%;
	}
	.rs-table .num {
		width: 15.75%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.rs-table tfoot th,
	.rs-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 3px;
		font-weight: 700;
		font-size: 7.2pt;
	}
	.rs-gap,
	.rs-received,
	.rs-shortfall {
		margin: 5px 0 0;
		font-size: 8pt;
	}
	.rs-received {
		color: #4b5563;
		font-size: 7.8pt;
	}
	.rs-shortfall {
		font-weight: 600;
	}
	.print-note {
		margin: 8px 0 2px;
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
		.reserve-statement-doc {
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
		.rs-wrap {
			overflow-x: auto;
		}
		.rs-table {
			min-width: 540px;
		}
	}
</style>
