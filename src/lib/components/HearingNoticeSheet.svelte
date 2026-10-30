<script lang="ts">
	/**
	 * The notice of a bylaw complaint, on one page, as the owner receives it.
	 *
	 * The letter prints the complaint's dates, the evidence it rests on, the
	 * response window, the hearing, and the most the bylaw allows — or the fine
	 * the council has already decided. A notice the complaint cannot support is
	 * withheld with the reason, not printed as a demand. All of that arithmetic
	 * belongs to `hearing-notice`.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { HearingNotice } from '$lib/hearing-notice';

	let { notice }: { notice: HearingNotice } = $props();

	const long = (iso: string) => formatDate(iso, $locale, { dateStyle: 'long' });
	const ref = $derived(notice.reference);
	const reason = $derived(
		notice.defect === 'sequence' ? $copy.hearingNoticeSequence : $copy.hearingNoticeNoEvidence
	);
</script>

<article class="print-doc hearing-doc" aria-labelledby="hearing-title">
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
			<dt>{$copy.hearingNoticeReference}</dt>
			<dd>{ref}</dd>
			<dt>{$copy.hearingNoticeServed}</dt>
			<dd>{notice.noticeIso}</dd>
			<dt>{$copy.hearingNoticeHearing}</dt>
			<dd>{notice.hearingIso}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="hearing-title">{$copy.hearingNoticeTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.hearingNoticeSubtitle, { plan: building.plan, building: building.name })}
		</p>
	</div>

	<p class="hearing-to">{fill($copy.hearingNoticeTo, { lot: notice.lot })}</p>
	<p class="hearing-intro">
		{fill($copy.hearingNoticeIntro, {
			lot: notice.lot,
			bylaw: notice.bylaw,
			role: notice.complainantRole
		})}
	</p>

	{#if !notice.issuable}
		<p class="hearing-warning">{fill($copy.hearingNoticeWithheld, { reason })}</p>
	{:else}
		{#if !notice.inOrder}
			<p class="hearing-warning">
				{fill($copy.hearingNoticeOutOfOrder, {
					hearing: long(notice.hearingIso),
					window: long(notice.windowCloses)
				})}
			</p>
		{/if}

		<dl class="hearing-facts">
			<dt>{$copy.hearingNoticeReceived}</dt>
			<dd>{long(notice.receivedIso)}</dd>
			<dt>{$copy.hearingNoticeWindow}</dt>
			<dd>{long(notice.windowCloses)}</dd>
			<dt>{$copy.hearingNoticeHearing}</dt>
			<dd>{long(notice.hearingIso)}</dd>
			<dt>{$copy.hearingNoticeTime}</dt>
			<dd>{notice.hearingTime}</dd>
			<dt>{$copy.hearingNoticePlace}</dt>
			<dd>{notice.hearingPlace}</dd>
		</dl>

		<h2 class="hearing-h2">{$copy.hearingNoticeEvidence}</h2>
		<ul class="hearing-evidence">
			{#each notice.evidence as item}
				<li>
					<span class="hearing-date">{item.date}</span>
					<span>{item.what}</span>
				</li>
			{/each}
		</ul>

		<h2 class="hearing-h2">{$copy.hearingNoticeAmount}</h2>
		<p class="hearing-amount">
			{#if notice.amount.kind === 'levied'}
				{fill($copy.hearingNoticeLevied, {
					amount: money(notice.amount.cents),
					date: long(notice.amount.date)
				})}
			{:else}
				{fill($copy.hearingNoticeMaximum, {
					amount: money(notice.amount.cents),
					rate: money(notice.ceilingPerDayCents),
					days: formatNumber(notice.days, $locale)
				})}
			{/if}
		</p>

		<h2 class="hearing-h2">{$copy.hearingNoticeRights}</h2>
		<p class="hearing-body">
			{fill($copy.hearingNoticeRightsBody, { date: long(notice.windowCloses) })}
		</p>
	{/if}

	<p class="print-note">
		{fill($copy.hearingNoticeBasis, { window: formatNumber(notice.windowDays, $locale) })}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.hearingNoticeFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.hearing-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.8pt;
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
	.hearing-to {
		margin: 14px 0 0;
		font-weight: 700;
	}
	.hearing-intro {
		margin: 4px 0 0;
	}
	.hearing-warning {
		margin: 9px 0 0;
		padding: 6px 9px;
		border: 1px solid #d9a3a3;
		border-radius: 5px;
		background: #fdf3f3;
		color: #8a1f1f;
		font-size: 8.6pt;
		font-weight: 600;
	}
	.hearing-facts {
		display: grid;
		grid-template-columns: 34mm 1fr;
		gap: 2px 10px;
		margin: 10px 0 0;
		font-size: 9pt;
	}
	.hearing-facts dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.2pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding-top: 1px;
	}
	.hearing-facts dd {
		margin: 0;
	}
	.hearing-h2 {
		margin: 13px 0 3px;
		font-size: 10.5pt;
		font-weight: 700;
	}
	.hearing-evidence {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 9pt;
	}
	.hearing-evidence li {
		display: grid;
		grid-template-columns: 22mm 1fr;
		gap: 8px;
		padding: 2px 0;
		border-bottom: 1px solid #eceff2;
	}
	.hearing-date {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.4pt;
		white-space: nowrap;
	}
	.hearing-amount {
		margin: 0;
		font-size: 9.4pt;
	}
	.hearing-body {
		margin: 0;
		font-size: 9pt;
	}
	.print-note {
		margin: 12px 0 2px;
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
		.hearing-doc {
			padding: 1.4rem 1.15rem;
			border-radius: 10px;
			font-size: 9.6pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 8px;
		}
		.print-ref {
			text-align: left;
		}
		.hearing-facts {
			grid-template-columns: 28mm 1fr;
		}
		.hearing-evidence li {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
