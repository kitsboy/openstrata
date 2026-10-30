<script lang="ts">
	/**
	 * One lot's lien file, as a page.
	 *
	 * The order and the arithmetic belong to `lien-status`: a vote is not a lien
	 * until a registration is recorded, the amount is only money that has fallen
	 * due, and legal spend is printed but never totalled into the debt. The sheet
	 * prints the module's decisions and the council's own rule about how it votes.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { LienStatus } from '$lib/lien-status';

	let { lien }: { lien: LienStatus } = $props();

	function stepLabel(key: LienStatus['steps'][number]['key']): string {
		if (key === 'demand') return $copy.lienStatusStepDemand;
		if (key === 'opinion') return $copy.lienStatusStepOpinion;
		if (key === 'vote') return $copy.lienStatusStepVote;
		return $copy.lienStatusStepRegistration;
	}
</script>

<article class="print-doc lien-doc" aria-labelledby="lien-title">
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
			<dd>{lien.reference}</dd>
			<dt>{$copy.payColDate}</dt>
			<dd>{lien.asOf}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="lien-title">{$copy.lienStatusTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.lienStatusSubtitle, { plan: building.plan, lot: lien.unitId })}
		</p>
	</div>

	<dl class="ln-address">
		<dt>{fill($copy.lienStatusTo, { lot: lien.unitId })}</dt>
		<dd>{lien.owner}</dd>
		<dd>{building.address}, {$copy.payLot} {lien.unitId}</dd>
	</dl>

	<p class="ln-summary">
		{fill($copy.lienStatusSummary, {
			date: formatDate(lien.steps[0].dateIso ?? lien.asOf, $locale, { dateStyle: 'long' }),
			amount: money(lien.securedCents),
			days: formatNumber(lien.daysSinceDemand, $locale)
		})}
		{#if lien.registered}
			{fill($copy.lienStatusRegistered, {
				date: formatDate(lien.registrationIso ?? lien.asOf, $locale, { dateStyle: 'long' })
			})}
		{:else if lien.voteOutcome === 'decline'}
			{$copy.lienStatusVotedDecline}
		{:else if lien.voteOutcome === 'file'}
			{$copy.lienStatusVotedFile}
		{:else}
			{$copy.lienStatusNotVoted}
		{/if}
	</p>

	<section class="ln-section">
		<h2>{$copy.lienStatusAmountHeading}</h2>
		<table class="ln-table">
			<caption class="sr-only">{$copy.lienStatusAmountHeading}</caption>
			<tbody>
				<tr>
					<th scope="row">{$copy.lnColFees}</th>
					<td class="num">{money(lien.parts.feesCents)}</td>
				</tr>
				<tr>
					<th scope="row">{$copy.accColLate}</th>
					<td class="num">{money(lien.parts.lateCents)}</td>
				</tr>
				<tr>
					<th scope="row">{$copy.accColLevy}</th>
					<td class="num">{money(lien.parts.levyCents)}</td>
				</tr>
				{#if lien.parts.fineCents > 0}
					<tr>
						<th scope="row">{$copy.accColFine}</th>
						<td class="num">{money(lien.parts.fineCents)}</td>
					</tr>
				{/if}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row">{$copy.accColTotal}</th>
					<td class="num">{money(lien.securedCents)}</td>
				</tr>
			</tfoot>
		</table>
		{#if lien.notYetDueCents > 0}
			<p class="ln-notdue">
				{fill($copy.lienStatusNotDue, {
					amount: money(lien.notYetDueCents),
					date: formatDate(lien.notYetDueIso ?? lien.asOf, $locale, { dateStyle: 'long' })
				})}
			</p>
		{/if}
	</section>

	<section class="ln-section">
		<h2>{$copy.lienStatusStepsHeading}</h2>
		<table class="ln-table ln-steps">
			<caption class="sr-only">{$copy.lienStatusStepsHeading}</caption>
			<thead>
				<tr>
					<th scope="col">{$copy.lienStatusColStep}</th>
					<th scope="col">{$copy.payColDate}</th>
					<th scope="col">{$copy.lienStatusColState}</th>
				</tr>
			</thead>
			<tbody>
				{#each lien.steps as entry (entry.key)}
					<tr>
						<th scope="row">{stepLabel(entry.key)}</th>
						<td class="date">
							{entry.dateIso
								? formatDate(entry.dateIso, $locale, { dateStyle: 'medium' })
								: '—'}
						</td>
						<td class="state">
							{#if entry.state === 'ahead' && entry.days !== null}
								{fill($copy.lienStatusAheadIn, { days: formatNumber(entry.days, $locale) })}
							{:else}
								{entry.state === 'done' ? $copy.lienStatusDone : $copy.lienStatusWaiting}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<p class="ln-vote">
			{fill($copy.lienStatusVoteRule, {
				seats: formatNumber(lien.seats, $locale),
				quorum: formatNumber(lien.quorum, $locale)
			})}
		</p>
	</section>

	<section class="ln-section ln-effect">
		<h2>{$copy.lienStatusEffectHeading}</h2>
		<p>{fill($copy.lienStatusEffect, { amount: money(lien.securedCents) })}</p>
		{#if lien.formFWithheld}
			<p class="ln-formf">{$copy.lienStatusFormF}</p>
		{/if}
		<p>
			{fill($copy.lienStatusLegal, {
				spent: money(lien.legal.spentCents),
				budget: money(lien.legal.budgetCents)
			})}
		</p>
	</section>

	<p class="print-note">{$copy.lienStatusNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.lienStatusFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.lien-doc {
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
	.ln-address {
		margin: 12px 0 0;
		font-size: 9pt;
	}
	.ln-address dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.ln-address dd {
		margin: 1px 0 0;
	}
	.ln-summary {
		margin: 10px 0 0;
	}
	.ln-section {
		margin-top: 11px;
		padding-top: 7px;
		border-top: 1px solid #dfe4e8;
	}
	.ln-section h2 {
		margin: 0 0 2px;
		font-size: 10pt;
	}
	.ln-table {
		width: 100%;
		margin-top: 4px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8.6pt;
	}
	.ln-table th,
	.ln-table td {
		padding: 3px 4px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
	}
	.ln-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 6.5pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.ln-table tbody th {
		width: 46%;
		font-weight: 600;
	}
	.ln-table .num {
		width: 26%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.ln-table tfoot th,
	.ln-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 4px;
		font-weight: 700;
		font-size: 8.8pt;
	}
	.ln-steps thead th:first-child {
		width: 38%;
	}
	.ln-steps thead th:nth-child(2) {
		width: 26%;
	}
	.ln-steps .date {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.8pt;
		white-space: nowrap;
	}
	.ln-steps .state {
		font-variant-numeric: tabular-nums;
	}
	.ln-notdue,
	.ln-vote {
		margin: 5px 0 0;
		color: #5a6672;
		font-size: 8pt;
	}
	.ln-effect p {
		margin: 2px 0 0;
		font-size: 8.6pt;
	}
	.ln-formf {
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
		.lien-doc {
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
		.ln-table {
			min-width: 460px;
		}
	}
</style>
