<script lang="ts">
	/**
	 * One lot's share of the special levy, as a letter.
	 *
	 * The arithmetic belongs to `levy-letter`: the share is points at the
	 * resolution's rate, the owing figure is capped at that share, a plan is a
	 * schedule and not arrears, and the trust's two routes are checked on the
	 * page. The sheet prints what the module decided and adds nothing.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { LevyLetter } from '$lib/levy-letter';

	let { letter }: { letter: LevyLetter } = $props();
</script>

<article class="print-doc levy-letter-doc" aria-labelledby="levy-letter-title">
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
		<h1 id="levy-letter-title">{$copy.levyLetterTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.levyLetterSubtitle, {
				plan: building.plan,
				amount: money(letter.trust.assessedCents)
			})}
		</p>
	</div>

	<dl class="ll-address">
		<dt>{fill($copy.levyLetterTo, { lot: letter.unitId })}</dt>
		<dd>{letter.owner}</dd>
		<dd>{building.address}, {$copy.payLot} {letter.unitId}</dd>
		<dd>{building.city}, {building.province} {building.postal}</dd>
	</dl>

	<p class="ll-intro">
		{fill($copy.levyLetterIntro, {
			amount: money(letter.trust.assessedCents),
			approved: letter.approved,
			project: letter.project,
			share: money(letter.assessedCents)
		})}
	</p>

	<table class="ll-table">
		<caption class="sr-only">{$copy.levyLetterTitle}</caption>			<thead>
				<tr>
					<th scope="col">{$copy.accColAccount}</th>
					<th scope="col" class="num">{$copy.accColAmount}</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<th scope="row">{$copy.levyLetterShare}</th>
					<td class="num">{money(letter.assessedCents)}</td>
				</tr>
				<tr>
					<th scope="row">{$copy.finesSheetPaid}</th>
					<td class="num">{money(letter.paidCents)}</td>
				</tr>
				<tr>
					<th scope="row">{$copy.accStillOwing}</th>
					<td class="num">{money(letter.owingCents)}</td>
				</tr>
			</tbody>
			<tfoot>
				<tr>
					<th scope="row">{$copy.levyLetterAsk}</th>
					<td class="num">{money(letter.askCents)}</td>
				</tr>
			</tfoot>
	</table>

	{#if letter.planCents !== null}
		<p class="ll-plan">
			{fill($copy.levyLetterPlanLine, {
				amount: money(letter.planCents),
				months: String(Math.ceil(letter.owingCents / letter.planCents))
			})}
		</p>
	{/if}

	{#if letter.daysLate !== null}
		<p class="ll-days">
			{fill($copy.levyLetterDays, {
				date: formatDate(letter.dueIso, $locale, { dateStyle: 'long' }),
				days: String(letter.daysLate)
			})}
		</p>
	{/if}

	{#if letter.deadline}
		<p class="ll-deadline">
			{fill($copy.levyLetterDeadline, {
				date: formatDate(letter.deadline, $locale, { dateStyle: 'long' })
			})}
		</p>
	{:else}
		<p class="ll-deadline">{$copy.levyLetterNoDeadline}</p>
	{/if}

	<section class="ll-trust">
		<h2>{$copy.levyLetterTrust}</h2>
		<p>
			{fill($copy.levyLetterTrustLine, {
				assessed: money(letter.trust.assessedCents),
				collected: money(letter.trust.collectedCents),
				paid: money(letter.trust.paidCents),
				cash: money(letter.trust.cashCents),
				remaining: money(letter.trust.remainingCents)
			})}
		</p>
		{#if !letter.trustBalanced}
			<p class="ll-gap">
				{fill($copy.levyLetterTrustGap, { difference: money(letter.differenceCents) })}
			</p>
		{/if}
	</section>

	<p class="print-note">{$copy.levyLetterNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.levyLetterFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.levy-letter-doc {
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
	.ll-address {
		margin: 12px 0 0;
		font-size: 9pt;
	}
	.ll-address dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.ll-address dd {
		margin: 1px 0 0;
	}
	.ll-intro {
		margin: 10px 0 0;
	}
	.ll-table {
		width: 100%;
		margin-top: 8px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8.4pt;
	}
	.ll-table th,
	.ll-table td {
		padding: 3px 4px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
	}
	.ll-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.5pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.ll-table tbody th {
		width: 30%;
		font-weight: 600;
	}
	.ll-table .num {
		width: 24%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.ll-table tfoot th,
	.ll-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 4px;
		font-weight: 700;
		font-size: 8.6pt;
	}
	.ll-plan,
	.ll-days,
	.ll-deadline {
		margin: 7px 0 0;
		font-size: 8.8pt;
	}
	.ll-plan,
	.ll-days {
		color: #3f4a55;
	}
	.ll-deadline {
		font-weight: 600;
	}
	.ll-trust {
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid #dfe4e8;
	}
	.ll-trust h2 {
		margin: 0 0 2px;
		font-family: inherit;
		font-size: 10pt;
	}
	.ll-trust p {
		margin: 2px 0 0;
		font-size: 8.6pt;
	}
	.ll-gap {
		color: #9a3412;
		font-weight: 600;
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
		.levy-letter-doc {
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
		.ll-table {
			min-width: 460px;
		}
	}
</style>
