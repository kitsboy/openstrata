<script lang="ts">
	/**
	 * The parkade levy on one printed page.
	 *
	 * The funds tab shows the levy as a card beside the two funds. This is the
	 * page a council hands to an owner who asks where the levy went: what the
	 * special meeting assessed, what the lots have paid, what the contract has
	 * been paid, what is left, and the three lots that still owe.
	 *
	 * Paper values, not theme tokens, like every printable sheet here. The rules
	 * live in `levy-sheet.ts`; this component formats what it is given.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { LevySheet } from '$lib/levy-sheet';

	let { sheet }: { sheet: LevySheet } = $props();

	/** A difference with its direction written, so the page needs no colour code. */
	function difference(cents: number): string {
		if (cents === 0) return money(0);
		return cents > 0 ? `+${money(cents)}` : `−${money(-cents)}`;
	}
</script>

<article class="print-doc levy-doc" aria-labelledby="levy-sheet-title">
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
		<h1 id="levy-sheet-title">{$copy.accParkadeLevy}</h1>
		<p class="print-subtitle">
			{fill($copy.accLevySheetSubtitle, {
				project: sheet.project,
				date: sheet.approved
			})}
		</p>
	</div>

	<div class="levy-table-wrap">
		<table class="levy-table">
			<caption class="sr-only">{$copy.accParkadeLevy}</caption>
			<thead>
				<tr>
					<th scope="col" class="line">{$copy.accColAccount}</th>
					<th scope="col" class="num">{$copy.accColAmount}</th>
				</tr>
			</thead>
			<tbody>
				<tr class="section-head"><th scope="colgroup" colspan="2">{$copy.accLevySheetTrust}</th></tr>
				<tr>
					<th scope="row" class="line">{$copy.accLevyColAssessed}</th>
					<td class="num">{money(sheet.assessedCents)}</td>
				</tr>
				<tr>
					<th scope="row" class="line">{$copy.accLevyCollected}</th>
					<td class="num">{money(sheet.collectedCents)}</td>
				</tr>
				<tr>
					<th scope="row" class="line">{$copy.accStillOwing}</th>
					<td class="num">{money(sheet.owingCents)}</td>
				</tr>
				<tr>
					<th scope="row" class="line">{$copy.accLevySpent}</th>
					<td class="num">−{money(sheet.paidCents)}</td>
				</tr>
				<tr class="group-total">
					<th scope="row" class="line">{$copy.accReconLevyCash}</th>
					<td class="num">{money(sheet.cashCents)}</td>
				</tr>
				<tr class="group-total">
					<th scope="row" class="line">{$copy.accLevyRemaining}</th>
					<td class="num">{money(sheet.remainingCents)}</td>
				</tr>
				<tr class="levy-check">
					<th scope="row" class="line">{$copy.accLevySheetCheck}</th>
					<td class="num">
						{difference(sheet.differenceCents)}
						<span class="check-word">
							{sheet.ok ? $copy.accReconAgrees : $copy.accReconFails}
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="levy-table-wrap">
		<table class="levy-table lots">
			<caption class="levy-caption">{$copy.accLevySheetLots}</caption>
			<thead>
				<tr>
					<th scope="col" class="lot">{$copy.payLot}</th>
					<th scope="col" class="who">{$copy.accColOwner}</th>
					<th scope="col" class="num">{$copy.accLevyColPoints}</th>
					<th scope="col" class="num">{$copy.accLevyColAssessed}</th>
					<th scope="col" class="num">{$copy.accLevyColPaid}</th>
					<th scope="col" class="num">{$copy.accStillOwing}</th>
					<th scope="col" class="plan">{$copy.accLevySheetPlan}</th>
				</tr>
			</thead>
			<tbody>
				{#each sheet.lots as row (row.unitId)}
					<tr>
						<th scope="row" class="lot">{row.unitId}</th>
						<td class="who">{row.owner}</td>
						<td class="num">{formatNumber(row.points, $locale)}</td>
						<td class="num">{money(row.assessedCents)}</td>
						<td class="num">{money(row.paidCents)}</td>
						<td class="num owing">{money(row.owingCents)}</td>
						<td class="plan">
							{row.planCents === null
								? '—'
								: fill($copy.accAgePlanLine, { amount: money(row.planCents) })}
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="5" class="line">{fill($copy.accLevySettled, {
						lots: formatNumber(sheet.settledLots, $locale),
						amount: money(sheet.settledCents)
					})}</th>
					<td class="num owing">{money(sheet.owingCents)}</td>
					<td class="plan"></td>
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="print-note">{fill($copy.accLevyOnePoint, {
		amount: money(sheet.pointCents)
	})}</p>

	<p class="print-basis">
		{fill($copy.accLevySheetBasis, { date: building.asOfLabel })}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.accLevySheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.levy-doc {
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

	.levy-table-wrap {
		margin: 10px 0 0;
		overflow-x: auto;
	}
	.levy-table {
		width: 100%;
		min-width: 460px;
		border-collapse: collapse;
		font-size: 7.8pt;
		table-layout: fixed;
	}
	.levy-table.lots {
		min-width: 640px;
	}
	.levy-table thead th {
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
	.levy-table th,
	.levy-table td {
		padding: 3px 6px;
		border-bottom: 1px solid #e8ecef;
		text-align: left;
		vertical-align: top;
	}
	.levy-table tbody th.line {
		font-weight: 400;
	}
	.levy-table .num {
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.levy-table .line {
		width: auto;
	}
	.levy-table .num {
		width: 26mm;
	}
	.levy-table .lot {
		width: 16mm;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.levy-table .who {
		width: auto;
	}
	.levy-table .plan {
		width: 34mm;
		color: #5a6672;
		font-size: 7pt;
	}
	.levy-table .section-head th {
		padding-top: 5px;
		padding-bottom: 3px;
		border-bottom: 1px solid #c9cfd4;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.levy-table .group-total th,
	.levy-table .group-total td {
		font-weight: 700;
	}
	.levy-table .levy-check th,
	.levy-table .levy-check td {
		padding-top: 3px;
		font-weight: 700;
	}
	.check-word {
		margin-left: 4px;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.levy-table .owing {
		font-weight: 700;
	}
	.levy-table tfoot th,
	.levy-table tfoot td {
		padding-top: 4px;
		border-top: 1px solid #9aa5ad;
		border-bottom: 1px solid #9aa5ad;
		font-size: 7pt;
		font-weight: 700;
	}
	.levy-table tfoot th {
		text-align: right;
		font-weight: 400;
	}
	.levy-caption {
		margin: 8px 0 2px;
		color: #14181c;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-align: left;
		text-transform: uppercase;
	}
	.print-note {
		margin: 6px 0 0;
		padding: 4px 7px;
		border: 1px solid #e4d8c8;
		border-radius: 4px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.4pt;
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
		.levy-table-wrap {
			overflow: visible;
		}
		.levy-table,
		.levy-table.lots {
			min-width: 0;
		}
		.levy-table {
			break-inside: auto;
		}
		.levy-table tbody {
			break-inside: avoid;
		}
	}

	@media (max-width: 640px) {
		.levy-doc {
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
	}
</style>
