<script lang="ts">
	/**
	 * What each vendor has been paid this year, on one page.
	 *
	 * The join belongs to `vendor-spend`: the vendor's money is the books' own
	 * line, one account belongs to one vendor, and the contested or unclaimed
	 * lines are named rather than paid twice. The sheet only lays it out.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import { usedPercent, type VendorSpend } from '$lib/vendor-spend';

	let { spend }: { spend: VendorSpend } = $props();

	const note = $derived(
		fill($copy.vendorSheetSubtitle, {
			vendors: formatNumber(spend.rows.length, $locale),
			lines: formatNumber(spend.unclaimedLines.length, $locale),
			year: building.fiscalLabel
		})
	);
</script>

<article class="print-doc vendor-doc" aria-labelledby="vendor-title">
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
			<dt>{$copy.vendorSheetBooks}</dt>
			<dd>{building.asOf}</dd>
			<dt>{$copy.vendorSheetFiscal}</dt>
			<dd>{building.fiscalLabel}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="vendor-title">{$copy.vendorSheetTitle}</h1>
		<p class="print-subtitle">{note}</p>
	</div>

	<div class="vendor-wrap">
		<table class="vendor-table">
			<caption class="sr-only">{$copy.vendorSheetTitle}</caption>
			<thead>
				<tr>
					<th scope="col" class="vendor">{$copy.vendorSheetVendor}</th>
					<th scope="col" class="line">{$copy.vendorSheetLines}</th>
					<th scope="col" class="num">{$copy.vendorSheetBudget}</th>
					<th scope="col" class="num">{$copy.vendorSheetPaid}</th>
					<th scope="col" class="num">{$copy.vendorSheetLeft}</th>
					<th scope="col" class="num">{$copy.vendorSheetShare}</th>
				</tr>
			</thead>
			<tbody>
				{#each spend.rows as row (row.vendor)}
					<tr>
						<th scope="row" class="vendor">
							<span class="name">{row.vendor}</span>
							<span class="service">{row.service}</span>
							{#if row.reason}
								<span class="why">{row.reason}</span>
							{/if}
						</th>
						<td class="line">{row.lines.map((line) => line.code).join(' · ')}</td>
						<td class="num">{money(row.annualCents)}</td>
						<td class="num">{money(row.ytdCents)}</td>
						<td class="num">{money(row.leftCents)}</td>
						<td class="num">{usedPercent(row) === null ? '—' : `${usedPercent(row)}%`}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="2">{$copy.vendorSheetContracted}</th>
					<td class="num">{money(spend.contracted.annualCents)}</td>
					<td class="num">{money(spend.contracted.ytdCents)}</td>
					<td class="num">{money(spend.contracted.leftCents)}</td>
					<td class="num">
						{spend.contracted.annualCents > 0
							? `${Math.round((spend.contracted.ytdCents / spend.contracted.annualCents) * 100)}%`
							: '—'}
					</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="vendor-unclaimed">
		{fill($copy.vendorSheetUnclaimed, {
			count: formatNumber(spend.unclaimedLines.length, $locale),
			budget: money(spend.unclaimed.annualCents),
			paid: money(spend.unclaimed.ytdCents)
		})}
	</p>

	<p class="vendor-total">
		{fill($copy.vendorSheetTotals, {
			budget: money(spend.budget.annualCents),
			paid: money(spend.budget.ytdCents),
			difference: money(spend.difference.annualCents)
		})}
		{#if spend.difference.annualCents === 0 && spend.difference.ytdCents === 0}
			<strong>{$copy.vendorSheetBalanced}</strong>
		{:else}
			<strong class="off">{$copy.vendorSheetUnbalanced}</strong>
		{/if}
	</p>

	{#each spend.outside as row (row.vendor)}
		<p class="vendor-outside">
			{fill($copy.vendorSheetOutside, {
				vendor: row.vendor,
				service: row.service,
				amount: money(row.paidCents)
			})}
		</p>
	{/each}

	{#if spend.duplicates.length > 0}
		<p class="vendor-defect">
			{fill($copy.vendorSheetDuplicates, { codes: spend.duplicates.join(', ') })}
		</p>
	{/if}
	{#if spend.missing.length > 0}
		<p class="vendor-defect">
			{fill($copy.vendorSheetMissing, { codes: spend.missing.join(', ') })}
		</p>
	{/if}

	<p class="print-note">{$copy.vendorSheetBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.vendorSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.vendor-doc {
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
	.vendor-wrap {
		margin-top: 10px;
	}
	.vendor-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 7.6pt;
		line-height: 1.22;
	}
	.vendor-table th,
	.vendor-table td {
		padding: 3px 3px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.vendor-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.5pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.vendor-table .vendor {
		width: 33%;
	}
	.vendor-table .name {
		display: block;
		font-weight: 700;
	}
	.vendor-table .service,
	.vendor-table .why {
		display: block;
		margin-top: 1px;
		color: #5a6672;
		font-size: 6.6pt;
	}
	.vendor-table .why {
		font-style: italic;
	}
	.vendor-table .line {
		width: 9%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.6pt;
	}
	.vendor-table .num {
		width: 14.5%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.vendor-table tfoot th,
	.vendor-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 4px;
		font-weight: 700;
		font-size: 7.8pt;
	}
	.vendor-unclaimed,
	.vendor-total {
		margin: 6px 0 0;
		font-size: 8pt;
	}
	.vendor-total strong {
		font-weight: 700;
	}
	.vendor-total .off {
		color: #a12a2a;
	}
	.vendor-outside {
		margin: 3px 0 0;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.vendor-defect {
		margin: 3px 0 0;
		color: #a12a2a;
		font-size: 7.8pt;
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
		.vendor-doc {
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
		.vendor-wrap {
			overflow-x: auto;
		}
		.vendor-table {
			min-width: 540px;
		}
	}
</style>
