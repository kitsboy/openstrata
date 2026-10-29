<script lang="ts">
	/**
	 * The fiscal year as one printed page.
	 *
	 * Rendered as a white sheet on screen as well as on paper, for the same reason
	 * every other printable document here is: a council should see the page it is
	 * about to hand out, not a themed dashboard that happens to print. Every
	 * colour is a paper value rather than a theme token, so dark mode cannot
	 * change what the sheet looks like.
	 *
	 * All the arithmetic is in `year-sheet.ts`; this component only supplies the
	 * translated category and fund names and formats the figures. That is what
	 * lets the model be tested without a catalog.
	 */
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { YearSheet } from '$lib/year-sheet';

	let { sheet }: { sheet: YearSheet } = $props();

	function categoryLabel(id: string): string {
		switch (id) {
			case 'fees':
				return $copy.yearCatFees;
			case 'parking':
				return $copy.yearCatParking;
			case 'fines':
				return $copy.yearCatFines;
			case 'interest':
				return $copy.yearCatInterest;
			case 'fobs':
				return $copy.yearCatFobs;
			case 'insurance':
				return $copy.yearCatInsurance;
			case 'utilities':
				return $copy.yearCatUtilities;
			case 'people':
				return $copy.yearCatPeople;
			case 'systems':
				return $copy.yearCatSystems;
			case 'grounds':
				return $copy.yearCatGrounds;
			case 'professional':
				return $copy.yearCatProfessional;
			case 'administration':
				return $copy.yearCatAdministration;
			default:
				return id;
		}
	}

	function fundLabel(id: string): string {
		if (id === 'operatingCents') return $copy.accFundOperating;
		if (id === 'reserveCents') return $copy.accContingencyReserve;
		return $copy.accParkadeLevy;
	}

	const healthDelta = $derived(sheet.health.delta);
</script>

<article class="print-doc year-doc" aria-labelledby="year-sheet-title">
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
		<h1 id="year-sheet-title">{$copy.yearSheetTitle}</h1>
		<p class="print-subtitle">{fill($copy.yearSheetYear, { fiscal: building.fiscalLabel, date: building.asOfLabel })}</p>
	</div>

	<div class="year-columns">
		<section class="print-table-wrap">
			<h2 class="print-h2">{$copy.yearSheetIncome}</h2>
			<table>
				<thead>
					<tr>
						<th>{$copy.accColAccount}</th>
						<th class="num">{$copy.yearSheetActual}</th>
						<th class="num">{$copy.accColAnnualBudget}</th>
					</tr>
				</thead>
				<tbody>
					{#each sheet.income.rows as row (row.id)}
						<tr>
							<td>{categoryLabel(row.id)}</td>
							<td class="num">{money(row.ytdCents)}</td>
							<td class="num">{money(row.annualCents)}</td>
						</tr>
					{/each}
					<tr class="total">
						<td>{$copy.accColTotal}</td>
						<td class="num">{money(sheet.income.ytdCents)}</td>
						<td class="num">{money(sheet.income.annualCents)}</td>
					</tr>
				</tbody>
			</table>
		</section>

		<section class="print-table-wrap">
			<h2 class="print-h2">{$copy.yearSheetExpense}</h2>
			<table>
				<thead>
					<tr>
						<th>{$copy.accColAccount}</th>
						<th class="num">{$copy.yearSheetActual}</th>
						<th class="num">{$copy.accColAnnualBudget}</th>
					</tr>
				</thead>
				<tbody>
					{#each sheet.expense.rows as row (row.id)}
						<tr>
							<td>{categoryLabel(row.id)}</td>
							<td class="num">{money(row.ytdCents)}</td>
							<td class="num">{money(row.annualCents)}</td>
						</tr>
					{/each}
					<tr class="total">
						<td>{$copy.accColTotal}</td>
						<td class="num">{money(sheet.expense.ytdCents)}</td>
						<td class="num">{money(sheet.expense.annualCents)}</td>
					</tr>
				</tbody>
			</table>
		</section>
	</div>

	<div class="print-table-wrap year-surplus">
		<table>
			<tbody>
				<tr class="total">
					<th scope="row">{$copy.yearSheetSurplus}</th>
					<td class="num">{money(sheet.surplusCents)}</td>
					<td class="num">{money(sheet.budgetSurplusCents)}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="year-columns">
		<section class="print-table-wrap">
			<h2 class="print-h2">{fill($copy.accCashAt, { date: building.asOfLabel })}</h2>
			<table>
				<tbody>
					{#each sheet.funds as fund (fund.id)}
						<tr>
							<td>{fundLabel(fund.id)}</td>
							<td class="num">{money(fund.cents)}</td>
						</tr>
					{/each}
					<tr class="total">
						<td>{$copy.accColTotal}</td>
						<td class="num">{money(sheet.fundsTotalCents)}</td>
					</tr>
				</tbody>
			</table>
		</section>

		<section>
			<h2 class="print-h2">{$copy.yearSheetHealth}</h2>
			<p class="year-health">
				{fill($copy.yearSheetHealthLine, {
					from: sheet.health.from.label,
					fromScore: formatNumber(sheet.health.from.score, $locale),
					to: sheet.health.to.label,
					toScore: formatNumber(sheet.health.to.score, $locale)
				})}
			</p>
			<p class="year-health-move" class:down={healthDelta < 0}>
				{#if healthDelta === 0}
					{fill($copy.yearSheetHealthFlat, { month: sheet.health.from.label })}
				{:else if healthDelta < 0}
					{fill($copy.yearSheetHealthDown, {
						points: formatNumber(Math.abs(healthDelta), $locale),
						month: sheet.health.from.label
					})}
				{:else}
					{fill($copy.yearSheetHealthUp, {
						points: formatNumber(healthDelta, $locale),
						month: sheet.health.from.label
					})}
				{/if}
			</p>
		</section>
	</div>

	<section class="print-table-wrap">
		<h2 class="print-h2">{$copy.yearSheetOpen}</h2>
		{#if sheet.open.length === 0}
			<p class="print-p">{$copy.yearSheetOpenEmpty}</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>{$copy.yearSheetDue}</th>
						<th>{$copy.yearSheetItem}</th>
						<th class="num">{$copy.deadlinesDays}</th>
					</tr>
				</thead>
				<tbody>
					{#each sheet.open as item (item.title)}
						<tr>
							<td class="nowrap">{formatDate(item.dueAt, $locale, { dateStyle: 'medium' })}</td>
							<td>{item.title}</td>
							<td class="num" class:late={item.daysLeft < 0}>
								{item.daysLeft < 0
									? $copy.deadlinesOverdue
									: `${formatNumber(item.daysLeft, $locale)} ${$copy.deadlinesDays}`}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		<p class="print-table-note">
			{fill($copy.yearSheetOpenSummary, {
				n: formatNumber(sheet.open.length, $locale),
				overdue: formatNumber(sheet.openOverdue, $locale)
			})}
		</p>
	</section>

	<p class="print-basis">{$copy.yearSheetBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.yearSheetFooter, { name: building.name, date: building.asOfLabel })}</p>
	</footer>
</article>

<style>
	/* Paper values, not theme tokens — the sheet is the same in light and dark. */
	.year-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2.25rem 2.5rem 1.75rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 10.5pt;
		line-height: 1.45;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 2rem;
	}
	.print-org {
		margin: 0;
		font-size: 15pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 2px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 7px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 9pt;
		font-weight: 500;
	}
	.print-rule {
		height: 2px;
		margin: 14px 0 14px;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 19pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 10pt;
	}
	.print-h2 {
		margin: 14px 0 5px;
		font-size: 10.5pt;
		font-weight: 700;
		letter-spacing: 0.01em;
		break-after: avoid;
	}
	.year-columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 0 26px;
	}
	/* A table's min-content width is a floor, and two of them side by side can
	   be wider than the sheet — which on paper is a clipped column, not a scroll.
	   `minmax(0, 1fr)` plus a fixed table layout lets the cells wrap instead. */
	.year-columns > * {
		min-width: 0;
	}
	.print-table-wrap {
		margin: 0 0 4px;
	}
	.print-table-wrap table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 9pt;
	}
	.print-table-wrap th:first-child,
	.print-table-wrap td:first-child {
		width: 46%;
	}
	.print-table-wrap .num {
		width: 27%;
		overflow-wrap: anywhere;
	}
	.print-table-wrap th,
	.print-table-wrap td {
		padding: 3px 5px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: top;
	}
	.print-table-wrap thead th {
		background: #f3f6f7;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.print-table-wrap .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.print-table-wrap .nowrap {
		white-space: nowrap;
	}
	.print-table-wrap tr.total th,
	.print-table-wrap tr.total td {
		border-top: 2px solid #c9cfd4;
		font-weight: 700;
	}
	.year-surplus {
		margin-top: 3px;
	}
	.year-surplus table {
		font-size: 9.5pt;
	}
	.year-surplus tr.total th {
		width: 45%;
	}
	.year-surplus td {
		width: 27.5%;
	}
	.year-health {
		margin: 5px 0 0;
		font-size: 10pt;
	}
	.year-health-move {
		margin: 3px 0 0;
		color: #2f6b4f;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8pt;
		letter-spacing: 0.02em;
	}
	.year-health-move.down {
		color: #a33a3a;
	}
	.print-table-wrap .late {
		color: #a33a3a;
		font-weight: 700;
	}
	.print-table-note {
		margin: 4px 0 0;
		color: #5a6672;
		font-size: 8pt;
	}
	.print-basis {
		margin: 10px 0 0;
		padding: 7px 10px;
		border-left: 3px solid #f0801a;
		background: #fdf6ef;
		color: #3f4a55;
		font-size: 8.5pt;
	}
	.print-foot {
		margin-top: 12px;
		padding-top: 7px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media (max-width: 640px) {
		.year-doc {
			padding: 1.5rem 1.25rem;
			border-radius: 10px;
			font-size: 10pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 10px;
		}
		.print-ref {
			text-align: left;
		}
		.year-columns {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
