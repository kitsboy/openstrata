<script lang="ts">
	/**
	 * The bylaw hearing as a one-page minute.
	 *
	 * The module decides whether the meeting was quorate and on the right day, and
	 * whether the fine's process holds; the sheet prints those decisions and the
	 * vote as cast. A motion that did not carry prints no amount and no posting,
	 * because a record that showed a fine after a lost vote is the worst kind of
	 * wrong.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { HearingMinutes } from '$lib/hearing-minutes';

	let { minutes }: { minutes: HearingMinutes } = $props();

	const long = (day: string) => formatDate(day, $locale, { dateStyle: 'long' });

	function defectLabel(): string {
		if (minutes.defect === 'not-heard') return $copy.minutesNotHeard;
		if (minutes.defect === 'no-quorum')
			return fill($copy.minutesNoQuorum, {
				present: formatNumber(minutes.present, $locale),
				seats: formatNumber(minutes.seats, $locale),
				need: formatNumber(minutes.quorum, $locale)
			});
		if (minutes.defect === 'vote')
			return fill($copy.minutesFailed, {
				yes: formatNumber(minutes.vote.yes, $locale),
				no: formatNumber(minutes.vote.no, $locale),
				abstain: formatNumber(minutes.vote.abstain, $locale)
			});
		return fill($copy.minutesProcess, {
			defect: minutes.processDefect === 'window'
				? $copy.finesSheetDefectWindow
				: minutes.processDefect === 'vote'
					? $copy.finesSheetDefectVote
					: $copy.finesSheetDefectPosting
		});
	}
</script>

<article class="print-doc minutes-doc" aria-labelledby="minutes-title">
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
			<dd>{minutes.reference}</dd>
			<dt>{$copy.payLot}</dt>
			<dd>{minutes.lot}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="minutes-title">{$copy.minutesDocTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.minutesDocSubtitle, {
				date: long(minutes.meetingIso),
				plan: building.plan
			})}
		</p>
	</div>

	<dl class="hm-facts">
		<dt>{$copy.finesSheetBylaw}</dt>
		<dd>{minutes.bylaw}</dd>
		<dt>{$copy.hearingNoticeServed}</dt>
		<dd>{long(minutes.noticeIso)}</dd>
		<dt>{$copy.hearingNoticeWindow}</dt>
		<dd>{long(minutes.windowCloses)}</dd>
		<dt>{$copy.hearingNoticeHearing}</dt>
		<dd>{long(minutes.hearingIso)}</dd>
		<dt>{$copy.minutesChair}</dt>
		<dd>{minutes.chair}</dd>
		<dt>{$copy.minutesPresentLabel}</dt>
		<dd>
			{fill($copy.minutesPresent, {
				present: formatNumber(minutes.present, $locale),
				seats: formatNumber(minutes.seats, $locale),
				quorum: formatNumber(minutes.quorum, $locale)
			})}
		</dd>
	</dl>

	<section class="hm-decision">
		<h2>{$copy.minutesDecision}</h2>
		{#if minutes.valid}
			<p>
				{fill($copy.minutesCarried, {
					yes: formatNumber(minutes.vote.yes, $locale),
					no: formatNumber(minutes.vote.no, $locale),
					abstain: formatNumber(minutes.vote.abstain, $locale)
				})}
			</p>
			<p class="hm-amount">
				{fill($copy.minutesFine, {
					amount: money(minutes.fineCents ?? 0),
					bylaw: minutes.bylaw,
					lot: minutes.lot,
					date: minutes.postedIso ? long(minutes.postedIso) : '—'
				})}
			</p>
			<p>
				{minutes.owingCents > 0
					? fill($copy.minutesOwing, {
							amount: money(minutes.owingCents),
							lot: minutes.lot,
							date: long(building.asOf)
						})
					: fill($copy.minutesOwingNone, {
							lot: minutes.lot,
							date: long(building.asOf)
						})}
			</p>
		{:else}
			<p class="hm-defect">{defectLabel()}</p>
		{/if}
	</section>

	<p class="print-note">{$copy.minutesNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.minutesFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.minutes-doc {
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
	.hm-facts {
		display: grid;
		grid-template-columns: 8rem 1fr;
		gap: 2px 10px;
		margin: 14px 0 0;
		font-size: 8.8pt;
	}
	.hm-facts dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding-top: 2px;
	}
	.hm-facts dd {
		margin: 0;
	}
	.hm-decision {
		margin-top: 14px;
		padding-top: 8px;
		border-top: 1px solid #dfe4e8;
	}
	.hm-decision h2 {
		margin: 0 0 3px;
		font-family: inherit;
		font-size: 10pt;
	}
	.hm-decision p {
		margin: 0 0 3px;
		font-size: 8.8pt;
	}
	.hm-amount {
		font-weight: 600;
	}
	.hm-defect {
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
		.minutes-doc {
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
		.hm-facts {
			grid-template-columns: 1fr;
		}
	}
</style>
