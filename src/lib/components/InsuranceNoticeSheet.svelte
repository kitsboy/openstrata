<script lang="ts">
	/**
	 * What the strata insures, what the owner insures, and what the deductibles
	 * are — as the owner would be told it.
	 *
	 * The module decides whether cover can be confirmed on the letter's own date
	 * and keeps the earthquake deductible a formula while no insured value is on
	 * the books. The sheet prints those decisions and quotes the bylaw's two
	 * halves rather than paraphrasing them.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { OwnerInsuranceNotice } from '$lib/insurance-notice';

	let { notice }: { notice: OwnerInsuranceNotice } = $props();

	const rate = $derived(`${notice.quakeRateBps / 100}%`);
	const days = $derived(formatDate(notice.asOf, $locale, { dateStyle: 'long' }));
</script>

<article class="print-doc insurance-notice-doc" aria-labelledby="insurance-notice-title">
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
			<dd>{notice.reference}</dd>
			<dt>{$copy.payColDate}</dt>
			<dd>{notice.asOf}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="insurance-notice-title">{$copy.insuranceNoticeTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.insuranceNoticeSubtitle, {
				plan: building.plan,
				policy: notice.policy
			})}
		</p>
	</div>

	<dl class="in-address">
		<dt>{fill($copy.insuranceNoticeTo, { lot: notice.unitId })}</dt>
		<dd>{notice.owner}</dd>
		<dd>{building.address}, {$copy.payLot} {notice.unitId}</dd>
		<dd>{building.city}, {building.province} {building.postal}</dd>
	</dl>

	<p class="in-intro">
		{fill($copy.insuranceNoticeIntro, {
			date: days,
			policy: notice.policy,
			broker: notice.broker
		})}
	</p>

	{#if notice.coverCurrent}
		<p class="in-term">
			{fill($copy.insuranceNoticeTerm, {
				start: formatDate(notice.termStart, $locale, { dateStyle: 'long' }),
				end: formatDate(notice.termEnd, $locale, { dateStyle: 'long' }),
				days: String(notice.daysLeft)
			})}
		</p>
	{:else}
		<p class="in-term in-warning">
			{fill($copy.insuranceNoticeExpired, {
				date: formatDate(notice.termEnd, $locale, { dateStyle: 'long' })
			})}
		</p>
	{/if}

	<div class="in-cover">
		<section>
			<h2>{$copy.insuranceNoticeStrata}</h2>
			<p>{notice.strataCover}.</p>
		</section>
		<section>
			<h2>{$copy.insuranceNoticeOwner}</h2>
			<p>{notice.ownerCover}.</p>
		</section>
	</div>

	<section class="in-deductibles">
		<h2>{$copy.insuranceNoticeDeductibles}</h2>
		<p>
			{fill($copy.insuranceNoticeDeductibleBody, {
				water: money(notice.waterDeductibleCents),
				rate,
				minimum: money(notice.quakeMinimumCents)
			})}
		</p>
		{#if notice.quakeDeductibleCents === null}
			<p>{$copy.insuranceNoticeQuakeNoValue}</p>
		{:else}
			<p>{money(notice.quakeDeductibleCents)}</p>
		{/if}
		<p>
			{notice.deductibleCharge === 'bylaw'
				? $copy.insuranceNoticeCharge
				: $copy.insuranceNoticeNoCharge}
		</p>
	</section>

	<p class="print-note">{$copy.insuranceNoticeNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.insuranceNoticeFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.insurance-notice-doc {
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
		font-size: 17pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9.2pt;
	}
	.in-address {
		margin: 12px 0 0;
		font-size: 9pt;
	}
	.in-address dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.in-address dd {
		margin: 1px 0 0;
	}
	.in-intro {
		margin: 10px 0 0;
	}
	.in-term {
		margin: 6px 0 0;
		font-size: 8.8pt;
		color: #3f4a55;
	}
	.in-warning {
		color: #9a3412;
		font-weight: 600;
	}
	.in-cover {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 12px;
	}
	.in-cover section {
		padding: 7px 9px;
		border: 1px solid #dfe4e8;
		border-radius: 6px;
	}
	.in-cover h2,
	.in-deductibles h2 {
		margin: 0 0 3px;
		font-family: inherit;
		font-size: 9.6pt;
	}
	.in-cover p,
	.in-deductibles p {
		margin: 0;
		font-size: 8.6pt;
	}
	.in-deductibles {
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid #dfe4e8;
	}
	.in-deductibles p + p {
		margin-top: 3px;
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
		.insurance-notice-doc {
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
		.in-cover {
			grid-template-columns: 1fr;
		}
	}
</style>
