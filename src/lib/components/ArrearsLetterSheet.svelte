<script lang="ts">
	/**
	 * One owner's arrears, as a letter they can hold.
	 *
	 * The arithmetic belongs to `arrears-letter`: only money that has fallen due
	 * is asked for, ages come from due dates, a plan is a schedule and not
	 * arrears, and the deadline is the day the building's own bylaw adds a late
	 * fee. The sheet addresses it, lists it and signs it.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import { periodOf } from '$lib/arrears';
	import type { ArrearsLetter, LetterLine } from '$lib/arrears-letter';

	let { letter }: { letter: ArrearsLetter } = $props();

	function monthName(day: string): string {
		return formatDate(`${periodOf(day)}-01`, $locale, { month: 'long' });
	}

	function lineLabel(line: LetterLine): string {
		if (line.kind === 'fee') return fill($copy.lotSheetFee, { month: monthName(line.due) });
		if (line.kind === 'late') return fill($copy.lotSheetLate, { month: monthName(line.due) });
		if (line.kind === 'fine') return $copy.lotSheetFine;
		return $copy.lotSheetLevy;
	}
</script>

<article class="print-doc arrears-letter-doc" aria-labelledby="arrears-letter-title">
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
			<dd>{letter.reference}</dd>
			<dt>{$copy.payColDate}</dt>
			<dd>{letter.asOf}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="arrears-letter-title">{$copy.arrearsLetterTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.arrearsLetterSubject, {
				lot: letter.unitId,
				date: formatDate(letter.asOf, $locale, { dateStyle: 'long' })
			})}
		</p>
	</div>

	<dl class="al-address">
		<dt>{$copy.arrearsLetterTo}</dt>
		<dd>{letter.owner}</dd>
		<dd>{building.address}, {$copy.payLot} {letter.unitId}</dd>
		<dd>{building.city}, {building.province} {building.postal}</dd>
	</dl>

	{#if letter.lines.length > 0}
		<p class="al-intro">
			{fill($copy.arrearsLetterIntro, {
				amount: money(letter.clearCents),
				date: formatDate(letter.asOf, $locale, { dateStyle: 'long' })
			})}
		</p>

		<div class="al-wrap">
			<table class="al-table">
				<caption class="sr-only">{$copy.arrearsLetterTitle}</caption>
				<thead>
					<tr>
						<th scope="col">{$copy.payColDate}</th>
						<th scope="col">{$copy.accColAccount}</th>
						<th scope="col" class="num">{$copy.accColAmount}</th>
						<th scope="col" class="num">{$copy.arrearsLetterAge}</th>
						<th scope="col">{$copy.arrearsLetterSchedule}</th>
					</tr>
				</thead>
				<tbody>
					{#each letter.lines as line (line.due + line.kind + (line.period ?? ''))}
						<tr>
							<td class="date">{formatDate(line.due, $locale, { dateStyle: 'medium' })}</td>
							<td>{lineLabel(line)}</td>
							<td class="num">{money(line.cents)}</td>
							<td class="num">{line.daysLate}</td>
							<td class="plan">
								{line.planCents
									? fill($copy.arrearsLetterPlan, { amount: money(line.planCents) })
									: '—'}
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" colspan="2">{$copy.arrearsLetterClearShort}</th>
						<td class="num">{money(letter.clearCents)}</td>
						<td class="num">{letter.oldestDays}</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>

		{#if letter.plannedCents > 0}
			<p class="al-plan">
				{fill($copy.arrearsLetterPlanLine, {
					balance: money(letter.plannedCents),
					amount: money(letter.planMonthlyCents ?? 0)
				})}
			</p>
		{/if}

		{#if letter.next}
			<p class="al-next">
				{fill($copy.arrearsLetterNext, {
					amount: money(letter.next.cents),
					date: formatDate(letter.next.due, $locale, { dateStyle: 'long' })
				})}
			</p>
		{/if}

		<p class="al-deadline">
			{fill($copy.arrearsLetterDeadline, {
				date: formatDate(letter.deadline, $locale, { dateStyle: 'long' }),
				amount: money(letter.lateFeeCents)
			})}
		</p>
	{:else}
		<p class="al-intro">
			{fill($copy.arrearsLetterNone, {
				date: formatDate(letter.asOf, $locale, { dateStyle: 'long' }),
				next: letter.next ? money(letter.next.cents) : money(0),
				due: letter.next
					? formatDate(letter.next.due, $locale, { dateStyle: 'long' })
					: formatDate(letter.deadline, $locale, { dateStyle: 'long' })
			})}
		</p>
	{/if}

	<section class="al-pay">
		<h2>{$copy.arrearsLetterPayTitle}</h2>
		<p>{fill($copy.arrearsLetterEtransfer, { address: building.payTo.etransfer, lot: letter.unitId })}</p>
		<p>{$copy.arrearsLetterOther}</p>
		<p>{fill($copy.arrearsLetterQuestions, { email: building.payTo.etransfer })}</p>
	</section>

	<div class="al-sign">
		<p class="al-sign-role">{$copy.arrearsLetterSignature}</p>
		<p class="al-sign-line" aria-hidden="true"></p>
		<p class="al-sign-meta">{$copy.arrearsLetterDated} {formatDate(letter.asOf, $locale, { dateStyle: 'long' })}</p>
	</div>

	<p class="print-note">{$copy.arrearsLetterBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.arrearsLetterFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.arrears-letter-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.4pt;
		line-height: 1.42;
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
	.al-address {
		margin: 12px 0 0;
		font-size: 9pt;
	}
	.al-address dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.al-address dd {
		margin: 1px 0 0;
	}
	.al-intro {
		margin: 10px 0 0;
	}
	.al-wrap {
		margin-top: 8px;
	}
	.al-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8pt;
		line-height: 1.25;
	}
	.al-table th,
	.al-table td {
		padding: 3px 4px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
	}
	.al-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.5pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.al-table .date {
		width: 17%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		white-space: nowrap;
	}
	.al-table .num {
		width: 14%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.al-table .plan {
		width: 23%;
		color: #4b5563;
		font-size: 7.4pt;
	}
	.al-table tfoot th,
	.al-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 4px;
		font-weight: 700;
		font-size: 8.2pt;
	}
	.al-plan,
	.al-next,
	.al-deadline {
		margin: 7px 0 0;
		font-size: 8.6pt;
	}
	.al-plan,
	.al-next {
		color: #3f4a55;
	}
	.al-deadline {
		font-weight: 600;
	}
	.al-pay h2 {
		margin: 12px 0 2px;
		font-family: inherit;
		font-size: 10pt;
	}
	.al-pay p {
		margin: 2px 0 0;
		font-size: 8.6pt;
	}
	.al-sign {
		margin-top: 14px;
	}
	.al-sign-role {
		margin: 0;
		font-size: 8.6pt;
	}
	.al-sign-line {
		width: 58%;
		margin: 18px 0 2px;
		border-bottom: 1px solid #14181c;
	}
	.al-sign-meta {
		margin: 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
	}
	.print-note {
		margin: 10px 0 2px;
		padding: 5px 8px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.8pt;
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
		.arrears-letter-doc {
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
		.al-wrap {
			overflow-x: auto;
		}
		.al-table {
			min-width: 480px;
		}
	}
</style>
