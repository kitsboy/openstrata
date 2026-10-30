<script lang="ts">
	/**
	 * The AGM notice as a letter an owner receives.
	 *
	 * The packet is the council's working paper and the proxy is the return; this
	 * is the statutory notice itself, addressed to the owners, with the meeting,
	 * the agenda and the motions that will be put. The window and the budget year
	 * come from `agm-notice`, so the letter cannot claim a deadline the packet
	 * does not.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building } from '$lib/demo/building';
	import { NOTICE_WINDOWS } from '$lib/documents';
	import type { AgmNotice } from '$lib/agm-notice';

	let { notice }: { notice: AgmNotice } = $props();

	const meetingLabel = $derived(
		formatDate(notice.meetingIso, $locale, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
	const issuedLabel = $derived(formatDate(notice.issued, $locale, { dateStyle: 'long' }));
	const noticeByLabel = $derived(formatDate(notice.noticeBy, $locale, { dateStyle: 'long' }));
	const budgetLabel = $derived(formatDate(notice.budgetYearEnd, $locale, { dateStyle: 'long' }));
</script>

<article class="print-doc agm-letter-doc" aria-labelledby="agm-notice-title">
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
			<dt>{$copy.ffCertReference}</dt>
			<dd>{notice.reference}</dd>
			<dt>{$copy.agmNoticeIssued}</dt>
			<dd>{notice.issued}</dd>
			<dt>{$copy.agmNoticeDueBy}</dt>
			<dd>{notice.noticeBy}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="agm-notice-title">{$copy.agmNoticeTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.agmNoticeSubtitle, { plan: building.plan, building: building.name })}
		</p>
	</div>

	<p class="agm-to">{fill($copy.agmNoticeTo, { corporation: building.legalName })}</p>
	<p class="agm-line">
		{fill($copy.agmNoticeLine, { corporation: building.legalName })}
	</p>

	<table class="agm-facts">
		<tbody>
			<tr>
				<th scope="row">{$copy.meetPacketDate}</th>
				<td>{meetingLabel}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.meetPacketTime}</th>
				<td>{notice.time}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.meetPacketPlace}</th>
				<td>{notice.place}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.meetPacketGiven}</th>
				<td class:late={!notice.met}>
					{fill(notice.met ? $copy.agmNoticeGiven : $copy.agmNoticeLate, {
						date: issuedLabel,
						days: formatNumber(notice.days, $locale),
						window: formatNumber(NOTICE_WINDOWS.agm, $locale)
					})}
				</td>
			</tr>
		</tbody>
	</table>

	<h2 class="agm-heading">{$copy.meetPacketAgenda}</h2>
	<ol class="agm-agenda">
		{#each notice.agenda as item}
			<li>{item}</li>
		{/each}
	</ol>

	<h2 class="agm-heading">{$copy.agmNoticeMotions}</h2>
	<ul class="agm-motions">
		{#each notice.resolutions as resolution}
			<li>
				<p class="motion-text">
					{fill(resolution.text, { yearEnd: budgetLabel })}
				</p>
				<p class="motion-vote">
					{fill($copy.agmNoticeVote, { vote: resolution.vote })}
				</p>
			</li>
		{/each}
	</ul>

	<p class="agm-quorum">
		{fill($copy.agmNoticeQuorum, {
			need: formatNumber(notice.quorumNeed, $locale),
			lots: formatNumber(notice.lots, $locale)
		})}
	</p>
	<p class="agm-proxy">{fill($copy.agmNoticeProxy, { date: noticeByLabel })}</p>

	<p class="print-note">
		{fill($copy.agmNoticeBasis, {
			window: formatNumber(NOTICE_WINDOWS.agm, $locale),
			yearEnd: budgetLabel
		})}
	</p>

	<table class="agm-sign">
		<tbody>
			<tr>
				<th scope="row">{$copy.meetProxySignature}</th>
				<td class="blank"></td>
				<th scope="row">{$copy.meetProxyDated}</th>
				<td class="blank short"></td>
			</tr>
		</tbody>
	</table>
	<p class="agm-role">{fill($copy.ffCertSecretary, { plan: building.plan })}</p>

	<footer class="print-foot">
		<p>{fill($copy.agmNoticeFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.agm-letter-doc {
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
		line-height: 1.36;
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
	.agm-to {
		margin: 10px 0 0;
		font-weight: 600;
	}
	.agm-line {
		margin: 3px 0 0;
	}
	.agm-facts {
		width: 100%;
		margin-top: 10px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 9pt;
	}
	.agm-facts th,
	.agm-facts td {
		padding: 3px 6px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.agm-facts th {
		width: 22%;
		background: #f7f9fa;
		color: #3f4a55;
		font-weight: 600;
	}
	.agm-facts td.late {
		color: #a12a2a;
		font-weight: 600;
	}
	.agm-heading {
		margin: 12px 0 4px;
		font-size: 8pt;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.agm-agenda {
		margin: 0;
		padding-left: 18px;
		font-size: 9pt;
	}
	.agm-agenda li {
		padding: 1px 0;
	}
	.agm-motions {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 9pt;
	}
	.agm-motions li {
		padding: 4px 0;
		border-bottom: 1px solid #eceff2;
	}
	.agm-motions li:last-child {
		border-bottom: 0;
	}
	.motion-text {
		margin: 0;
	}
	.motion-vote {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.2pt;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.agm-quorum {
		margin: 10px 0 0;
		font-size: 9pt;
	}
	.agm-proxy {
		margin: 3px 0 0;
		color: #4b5563;
		font-size: 8.8pt;
	}
	.print-note {
		margin: 10px 0 2px;
		padding: 6px 9px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 8.4pt;
	}
	.agm-sign {
		width: 100%;
		margin-top: 12px;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 8.6pt;
	}
	.agm-sign th,
	.agm-sign td {
		padding: 4px 6px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: bottom;
	}
	.agm-sign th {
		width: 15%;
		background: #f7f9fa;
		color: #3f4a55;
		font-weight: 600;
	}
	.agm-sign .blank {
		width: 35%;
		height: 22px;
	}
	.agm-sign .blank.short {
		width: 24%;
	}
	.agm-role {
		margin: 3px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
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
		.agm-letter-doc {
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
