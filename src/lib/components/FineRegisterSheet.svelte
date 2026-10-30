<script lang="ts">
	/**
	 * The bylaw fine register on one page.
	 *
	 * A fine is a notice, a window, a hearing, a vote and a posting; the sheet
	 * prints all of them beside the amount, so a reader can see whether the money
	 * on the books is supported by the process that produced it. The arithmetic
	 * belongs to `fine-register`, including the defects it refuses to count.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { FineRegister, FineRow } from '$lib/fine-register';

	let { register }: { register: FineRegister } = $props();

	function dayLabel(day: string | null): string {
		if (!day) return '—';
		return day;
	}

	function voteLabel(row: FineRow): string {
		const { yes, no, abstain } = row.fine.votes;
		return `${yes}–${no}–${abstain}`;
	}

	function statusLabel(row: FineRow): string {
		if (row.defect === 'window') return $copy.finesSheetDefectWindow;
		if (row.defect === 'vote') return $copy.finesSheetDefectVote;
		if (row.defect === 'posting') return $copy.finesSheetDefectPosting;
		if (row.status === 'paid') return $copy.finesSheetPaid;
		return fill($copy.finesSheetUnpaidDays, {
			days: formatNumber(row.daysOwing, $locale)
		});
	}

	const asOfLabel = $derived(
		formatDate(register.asOf, $locale, { dateStyle: 'long' })
	);
</script>

<article class="print-doc fines-doc" aria-labelledby="fines-title">
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
			<dt>{$copy.finesSheetBooksTo}</dt>
			<dd>{register.asOf}</dd>
			<dt>{$copy.finesSheetCount}</dt>
			<dd>{formatNumber(register.fines, $locale)}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="fines-title">{$copy.finesSheetTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.finesSheetSubtitle, { date: asOfLabel })}
		</p>
	</div>

	{#if register.rows.length > 0}
		<div class="fines-wrap">
			<table class="fines-table">
				<caption class="sr-only">{$copy.finesSheetTitle}</caption>
				<thead>
					<tr>
						<th scope="col" class="lot">{$copy.payLot}</th>
						<th scope="col">{$copy.finesSheetBylaw}</th>
						<th scope="col">{$copy.finesSheetNotice}</th>
						<th scope="col">{$copy.finesSheetWindow}</th>
						<th scope="col">{$copy.finesSheetHearing}</th>
						<th scope="col" class="num">{$copy.finesSheetVote}</th>
						<th scope="col">{$copy.finesSheetPosted}</th>
						<th scope="col" class="num">{$copy.accColAmount}</th>
						<th scope="col">{$copy.finesSheetStatus}</th>
					</tr>
				</thead>
				<tbody>
					{#each register.rows as row (row.fine.lot + row.fine.noticeIso)}
						<tr class:defect={row.defect !== null}>
							<th scope="row" class="lot">{row.fine.lot}</th>
							<td>{row.fine.bylaw}</td>
							<td class="date">{dayLabel(row.fine.noticeIso)}</td>
							<td class="date">{row.windowCloses}</td>
							<td class="date">{row.fine.hearingIso}</td>
							<td class="num">{voteLabel(row)}</td>
							<td class="date">{dayLabel(row.fine.postedIso)}</td>
							<td class="num">{money(row.fine.cents)}</td>
							<td>{statusLabel(row)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" colspan="7">{$copy.accColTotal}</th>
						<td class="num">{money(register.owingCents)}</td>
						<td>{fill($copy.finesSheetOwingOf, { levied: money(register.leviedCents) })}</td>
					</tr>
				</tfoot>
			</table>
		</div>

		<p class="fines-summary">
			{fill($copy.finesSheetSummary, {
				levied: money(register.leviedCents),
				paid: money(register.paidCents),
				owing: money(register.owingCents),
				unpaid: formatNumber(register.unpaid, $locale)
			})}
		</p>
		<p class="fines-ceiling">
			{fill($copy.finesSheetCeiling, {
				rate: money(register.rows[0].fine.ceilingPerDayCents)
			})}
			{#if register.rows[0].aboveCeiling}
				<strong>{$copy.finesSheetAbove}</strong>
			{/if}
		</p>
		{#if register.defects > 0}
			<p class="fines-defects">
				{fill($copy.finesSheetDefects, { count: formatNumber(register.defects, $locale) })}
			</p>
		{:else}
			<p class="fines-defects">{$copy.finesSheetNoDefects}</p>
		{/if}
	{:else}
		<p class="fines-empty">{fill($copy.finesSheetEmpty, { date: asOfLabel })}</p>
	{/if}

	<p class="print-note">{$copy.finesSheetBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.finesSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.fines-doc {
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
	.fines-wrap {
		margin-top: 10px;
	}
	.fines-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 7.2pt;
		line-height: 1.2;
	}
	.fines-table th,
	.fines-table td {
		padding: 3px 3px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.fines-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.4pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.fines-table .lot {
		width: 5%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	.fines-table th:nth-child(2) {
		width: 23%;
	}
	.fines-table .date {
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.6pt;
		white-space: nowrap;
	}
	.fines-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.fines-table tfoot th,
	.fines-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 4px;
		font-weight: 700;
		font-size: 7.4pt;
	}
	.fines-table tfoot td:last-child {
		text-align: right;
	}
	.fines-table tr.defect td:nth-child(9) {
		color: #a12a2a;
		font-weight: 600;
	}
	.fines-summary {
		margin: 7px 0 0;
		font-size: 8.4pt;
	}
	.fines-ceiling {
		margin: 2px 0 0;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.fines-defects {
		margin: 2px 0 0;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.fines-empty {
		margin: 12px 0 0;
		padding: 7px 9px;
		border: 1px solid #dfe4e8;
		border-radius: 5px;
		color: #4b5563;
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
		.fines-doc {
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
		.fines-wrap {
			overflow-x: auto;
		}
		.fines-table {
			min-width: 540px;
		}
	}
</style>
