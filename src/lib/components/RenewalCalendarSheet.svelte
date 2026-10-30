<script lang="ts">
	/**
	 * The next twelve months of renewals, as one page.
	 *
	 * The counting belongs to `renewal-calendar`: a date that has passed is not a
	 * countdown, a contract with no day is not given one, and a step is tagged so
	 * nobody mistakes the appraisal for a contract that renews. The sheet prints
	 * what the module decided and adds only the reader's words — including the
	 * account's name, which comes from the same catalog the printed budget uses.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { LEDGER_NAME } from '$lib/budget-copy';
	import { building } from '$lib/demo/building';
	import { docReference } from '$lib/documents';
	import type { RenewalCalendar } from '$lib/renewal-calendar';

	let { calendar }: { calendar: RenewalCalendar } = $props();

	const reference = $derived(docReference('OS-RC', calendar.asOf));

	function lineName(code: string | null): string {
		if (code === null) return $copy.renewalCalUnfunded;
		const key = LEDGER_NAME[code];
		return key ? `${code} · ${$copy[key]}` : code;
	}

	function daysLabel(days: number): string {
		if (days === 0) return $copy.renewalCalToday;
		if (days === 1) return $copy.renewalCalTomorrow;
		return fill($copy.renewalCalDays, { days: formatNumber(days, $locale) });
	}
</script>

<article class="print-doc renewal-cal-doc" aria-labelledby="renewal-cal-title">
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
			<dt>{$copy.arrearsLetterReference}</dt>
			<dd>{reference}</dd>
			<dt>{$copy.payColDate}</dt>
			<dd>{calendar.asOf}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="renewal-cal-title">{$copy.renewalCalTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.renewalCalSubtitle, {
				plan: building.plan,
				from: formatDate(calendar.asOf, $locale, { dateStyle: 'long' }),
				to: formatDate(calendar.windowEnd, $locale, { dateStyle: 'long' })
			})}
		</p>
	</div>

	<p class="rc-summary">
		{fill($copy.renewalCalSummary, {
			renewals: formatNumber(calendar.renewals, $locale),
			steps: formatNumber(calendar.steps, $locale)
		})}
		{#if calendar.next}
			{fill($copy.renewalCalNext, {
				vendor: calendar.next.vendor,
				days: formatNumber(calendar.next.daysLeft, $locale)
			})}
		{/if}
	</p>

	<table class="rc-table">
		<caption class="sr-only">{$copy.renewalCalTitle}</caption>
		<thead>
			<tr>
				<th scope="col">{$copy.payColDate}</th>
				<th scope="col" class="num">{$copy.renewalCalColDays}</th>
				<th scope="col">{$copy.renewalCalColVendor}</th>
				<th scope="col">{$copy.renewalCalColService}</th>
				<th scope="col">{$copy.renewalCalColLine}</th>
			</tr>
		</thead>
		<tbody>
			{#each calendar.rows as row (row.id)}
				<tr>
					<td class="date">{formatDate(row.dateIso, $locale, { dateStyle: 'medium' })}</td>
					<td class="num">{daysLabel(row.daysLeft)}</td>
					<td class="vendor">{row.vendor}</td>
					<td>
						{#if row.kind === 'step'}
							<span class="tag">{$copy.renewalCalStepTag}</span>
						{/if}
						{row.service}
					</td>
					<td class="line">{lineName(row.line)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<section class="rc-open">
		<h2>{$copy.renewalCalContinuing}</h2>
		<p class="rc-open-note">{$copy.renewalCalContinuingNote}</p>
		<ul>
			{#each calendar.continuing as row (row.id)}
				<li>
					<span class="vendor">{row.vendor}</span>
					<span class="what">{row.service}</span>
					<span class="line">{lineName(row.line)}</span>
				</li>
			{/each}
		</ul>
	</section>

	{#if calendar.passed.length > 0}
		<p class="rc-passed">
			{fill($copy.renewalCalPassed, {
				rows: calendar.passed
					.map((row) => `${row.vendor} (${formatDate(row.dateIso, $locale)})`)
					.join(' · ')
			})}
		</p>
	{/if}

	<p class="print-note">{$copy.renewalCalNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.renewalCalFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.renewal-cal-doc {
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
		line-height: 1.4;
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
	.rc-summary {
		margin: 10px 0 0;
		font-size: 9pt;
	}
	.rc-table {
		width: 100%;
		margin-top: 8px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8.2pt;
	}
	.rc-table th,
	.rc-table td {
		padding: 3px 4px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
	}
	.rc-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.5pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.rc-table th:nth-child(1),
	.rc-table td:nth-child(1) {
		width: 19%;
	}
	.rc-table th:nth-child(2),
	.rc-table td:nth-child(2) {
		width: 14%;
	}
	.rc-table th:nth-child(3),
	.rc-table td:nth-child(3) {
		width: 20%;
	}
	.rc-table th:nth-child(5),
	.rc-table td:nth-child(5) {
		width: 20%;
	}
	.rc-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.rc-table .date {
		white-space: nowrap;
	}
	.rc-table .date,
	.rc-table .line {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.4pt;
	}
	/* The line column holds a code and a name, and a nowrap name overflowed the
	   sheet by 22px in Chrome — clipped on paper, invisible on screen. */
	.rc-table .line,
	.rc-open .line {
		overflow-wrap: anywhere;
	}
	.rc-table .vendor {
		font-weight: 600;
	}
	.tag {
		display: inline-block;
		margin-right: 4px;
		padding: 0 3px;
		border: 1px solid #d8c7b4;
		border-radius: 3px;
		color: #8a5a22;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		vertical-align: 1px;
	}
	.rc-open {
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid #dfe4e8;
	}
	.rc-open h2 {
		margin: 0;
		font-size: 10pt;
	}
	.rc-open-note {
		margin: 1px 0 4px;
		color: #5a6672;
		font-size: 8pt;
	}
	.rc-open ul {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 8pt;
	}
	.rc-open li {
		display: grid;
		grid-template-columns: 32% 1fr 20%;
		gap: 6px;
		padding: 2px 0;
		border-bottom: 1px solid #f1f4f6;
	}
	.rc-open li:last-child {
		border-bottom: 0;
	}
	.rc-open .vendor {
		font-weight: 600;
	}
	.rc-open .what {
		color: #3f4a55;
	}
	.rc-open .line {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.2pt;
		text-align: right;
	}
	.rc-passed {
		margin: 9px 0 0;
		padding: 5px 8px;
		border: 1px solid #e7c9a8;
		border-radius: 5px;
		background: #fdf7ef;
		color: #8a4b12;
		font-size: 8pt;
		font-weight: 600;
	}
	.print-note {
		margin: 9px 0 2px;
		padding: 5px 8px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.6pt;
		line-height: 1.35;
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
		.renewal-cal-doc {
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
		.rc-table {
			min-width: 520px;
		}
	}
</style>
