<script lang="ts">
	/**
	 * The reserve fund as one printed page.
	 *
	 * The Funds tab shows this year's balances; the reserve plan shows five years
	 * forward. This is that picture as paper, so the AGM package can carry it
	 * beside the year's sheet and the meeting packet instead of sending a reader
	 * to a different tab to print a third document.
	 *
	 * The arithmetic is `reservePlan`, unchanged — the contribution the budget
	 * funds rather than the report's recommendation, interest at the rate the
	 * statements actually paid, each project paid in the fiscal year that ends in
	 * the calendar year the report names, and the levy's membrane left out because
	 * it is another trust's money. The page prints the first year that runs short,
	 * because a projection that can only say "fine" answers nothing.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import { reservePlan } from '$lib/reserve-plan';
	import { reservePicture } from '$lib/demo/reserve';

	const reserve = $derived(reservePlan(reservePicture.input));
	const last = $derived(reserve.rows.at(-1)!);
	const rate = $derived(
		formatNumber(reservePicture.input.annualRateBps / 100, $locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	);
</script>

<article class="print-doc reserve-doc" aria-labelledby="reserve-sheet-title">
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
		<h1 id="reserve-sheet-title">{$copy.accReserveTitle}</h1>
		<p class="print-subtitle">{$copy.accReserveLede}</p>
	</div>

	<div class="reserve-table-wrap">
		<table class="reserve-table">
			<thead>
				<tr>
					<th scope="col">{$copy.accReserveColYear}</th>
					<th scope="col" class="num">{$copy.accReserveColOpening}</th>
					<th scope="col" class="num">{$copy.accReserveColContribution}</th>
					<th scope="col" class="num">{$copy.accReserveColInterest}</th>
					<th scope="col">{$copy.accReserveColScheduled}</th>
					<th scope="col" class="num">{$copy.accReserveColClosing}</th>
				</tr>
			</thead>
			<tbody>
				{#each reserve.rows as row (row.label)}
					<tr>
						<th scope="row" class="year">{row.label}</th>
						<td class="num">{money(row.openingCents)}</td>
						<td class="num">{money(row.contributionCents)}</td>
						<td class="num">{money(row.interestCents)}</td>
						<td class="scheduled">
							{#if row.projects.length > 0}
								{#each row.projects as project (project.label)}
									<span class="block"
										>{project.label} · <span class="tabular-nums">{money(project.cents)}</span></span
									>
								{/each}
							{:else}
								<span class="none">—</span>
							{/if}
						</td>
						<td class="num closing" class:short={row.short}>{money(row.closingCents)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="reserve-verdict" class:short={reserve.firstShortfall !== null}>
		{#if reserve.firstShortfall}
			{fill($copy.accReserveShortfall, {
				year: reserve.firstShortfall.label,
				amount: money(-reserve.firstShortfall.closingCents)
			})}
		{:else}
			{fill($copy.accReserveCovers, {
				year: last.label,
				amount: money(last.closingCents)
			})}
		{/if}
	</p>

	<div class="reserve-notes">
		<p>
			{fill($copy.accReserveReport, {
				firm: reservePicture.report.firm,
				dated: reservePicture.report.dated,
				due: reservePicture.report.nextDue
			})}
		</p>
		<p>
			{fill($copy.accReserveRate, {
				rate,
				date: formatDate(reservePicture.statementDate, $locale, { dateStyle: 'long' })
			})}
		</p>
		<p>
			{fill($copy.accReserveFunding, {
				funded: money(reservePicture.input.annualContributionCents),
				recommended: money(reservePicture.recommendedAnnualCents)
			})}
		</p>
		<p>
			{fill($copy.accReserveLevy, {
				project: reservePicture.levy.label,
				amount: money(reservePicture.levy.cents)
			})}
		</p>
	</div>

	<footer class="print-foot">
		<p>{fill($copy.yearSheetFooter, { name: building.name, date: building.asOfLabel })}</p>
	</footer>
</article>

<style>
	/* Paper values, not theme tokens: the sheet is the same in light and dark. */
	.reserve-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.4rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.4pt;
		line-height: 1.4;
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
		font-size: 14pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.4pt;
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
		font-size: 6.6pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 4px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8pt;
		overflow-wrap: anywhere;
	}
	.print-rule {
		height: 2px;
		margin: 11px 0;
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
		max-width: 118mm;
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9pt;
	}
	.reserve-table-wrap {
		margin-top: 10px;
		overflow-x: auto;
	}
	.reserve-table {
		width: 100%;
		min-width: 560px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8.4pt;
		line-height: 1.3;
	}
	.reserve-table th,
	.reserve-table td {
		padding: 3px 6px;
		border-bottom: 1px solid #edf1f3;
		text-align: left;
		vertical-align: top;
	}
	.reserve-table thead th {
		border-bottom: 1px solid #c9cfd4;
		background: #f3f6f7;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.6pt;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.reserve-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.reserve-table .year {
		width: 11%;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.reserve-table .scheduled {
		width: 28%;
		overflow-wrap: anywhere;
	}
	.reserve-table thead th:first-child,
	.reserve-table thead th:nth-child(2),
	.reserve-table thead th:nth-child(3),
	.reserve-table thead th:nth-child(4),
	.reserve-table thead th:last-child {
		width: 15.25%;
	}
	.reserve-table .closing {
		font-weight: 700;
	}
	.reserve-table .closing.short {
		color: #a33a3a;
	}
	.reserve-table .none {
		color: #9aa4ac;
	}
	.reserve-verdict {
		margin: 8px 0 0;
		padding: 5px 8px;
		border-left: 3px solid #2f6b4f;
		background: #f3f8f5;
		font-size: 9.4pt;
		font-weight: 700;
	}
	.reserve-verdict.short {
		border-left-color: #a33a3a;
		background: #fdf4f4;
		color: #8c2f2f;
	}
	.reserve-notes {
		margin-top: 8px;
		color: #5a6672;
		font-size: 7.4pt;
		line-height: 1.4;
	}
	.reserve-notes p {
		margin: 2px 0 0;
	}
	.print-foot {
		margin-top: 10px;
		padding-top: 6px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.6pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media print {
		.reserve-table-wrap {
			overflow: visible;
		}
		.reserve-table {
			min-width: 0;
		}
	}

	@media (max-width: 640px) {
		.reserve-doc {
			padding: 1.4rem 1.1rem;
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
