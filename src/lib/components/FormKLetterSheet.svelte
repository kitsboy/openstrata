<script lang="ts">
	/**
	 * One Form K reminder, as a letter to the owner.
	 *
	 * The dates and the count are `form-k-letter`'s, which took them from the
	 * register; the sheet adds the reader's words and nothing else. It states no
	 * amount, because the bylaw's money attaches to a short-term stay and not to a
	 * late form — the one place a reminder like this usually goes wrong.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building } from '$lib/demo/building';
	import { FORM_K_DAYS } from '$lib/health';
	import type { FormKLetter } from '$lib/form-k-letter';

	let { letter }: { letter: FormKLetter } = $props();
</script>

<article class="print-doc fk-letter-doc" aria-labelledby="fk-title-{letter.unitId}">
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
		<h1 id="fk-title-{letter.unitId}">{$copy.fkLetterTitle}</h1>
		<p class="print-subtitle">{fill($copy.fkLetterSubject, { lot: letter.unitId })}</p>
	</div>

	<dl class="fk-address">
		<dt>{fill($copy.fkLetterTo, { lot: letter.unitId })}</dt>
		<dd>{letter.owner}</dd>
		<dd>{building.address}, {$copy.payLot} {letter.unitId}</dd>
		<dd>{building.city}, {building.province} {building.postal}</dd>
	</dl>

	<p class="fk-bylaw">{fill($copy.fkLetterBylaw, { days: formatNumber(FORM_K_DAYS, $locale) })}</p>

	<p class="fk-dates">
		{fill($copy.fkLetterDates, {
			tenant: letter.tenant ?? $copy.fkLetterTenantUnknown,
			since: formatDate(letter.since, $locale, { dateStyle: 'long' }),
			closes: formatDate(letter.closes, $locale, { dateStyle: 'long' }),
			days: formatNumber(letter.pastDays, $locale)
		})}
	</p>

	<section class="fk-why">
		<h2>{$copy.fkLetterWhyHeading}</h2>
		<p>{$copy.fkLetterWhy}</p>
		<p class="fk-nofine">{$copy.fkLetterNoFine}</p>
	</section>

	<p class="fk-meeting">
		{#if letter.meetingIso && letter.daysToMeeting !== null}
			{fill($copy.fkLetterMeeting, {
				date: formatDate(letter.meetingIso, $locale, { dateStyle: 'long' }),
				days: formatNumber(letter.daysToMeeting, $locale)
			})}
		{:else}
			{$copy.fkLetterNoMeeting}
		{/if}
	</p>

	<p class="fk-ask">{$copy.fkLetterAsk}</p>

	<p class="print-note">{$copy.fkLetterNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.fkLetterFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.fk-letter-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.6pt;
		line-height: 1.45;
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
		font-size: 9.4pt;
	}
	.fk-address {
		margin: 14px 0 0;
		font-size: 9.2pt;
	}
	.fk-address dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.fk-address dd {
		margin: 1px 0 0;
	}
	.fk-bylaw,
	.fk-dates,
	.fk-meeting,
	.fk-ask {
		margin: 11px 0 0;
	}
	.fk-bylaw {
		padding: 8px 11px;
		border-left: 3px solid #f0801a;
		background: #fdf6ef;
		color: #3f4a55;
		font-size: 9pt;
	}
	.fk-dates {
		font-weight: 600;
	}
	.fk-why {
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid #dfe4e8;
	}
	.fk-why h2 {
		margin: 0 0 2px;
		font-size: 10pt;
	}
	.fk-why p {
		margin: 2px 0 0;
		font-size: 9pt;
	}
	.fk-nofine {
		color: #3f4a55;
		font-style: italic;
	}
	.fk-ask {
		font-weight: 600;
	}
	.print-note {
		margin: 11px 0 2px;
		padding: 5px 8px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.8pt;
		line-height: 1.35;
	}
	.print-foot {
		margin-top: 9px;
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
		.fk-letter-doc {
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
	}
</style>
