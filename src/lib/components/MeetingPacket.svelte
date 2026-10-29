<script lang="ts">
	/**
	 * One meeting on one printed page.
	 *
	 * The meetings page explains the rules; this sheet is what a council actually
	 * hands round: the notice, the agenda, the minutes of the last meeting and the
	 * quorum maths, set at print size rather than shrunk to fit. It is built from
	 * the same records the page reads, and `meeting-packet.ts` does the only two
	 * calculations — the last lawful day for notice, and the majority that makes a
	 * quorum.
	 *
	 * Paper values, not theme tokens, like every printable sheet here: dark mode
	 * cannot change what a council hands to a neighbour.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building, councilSeats } from '$lib/demo/building';
	import { lastCouncil, nextAgm, nextCouncil, quorum } from '$lib/demo/meetings';
	import { NOTICE_WINDOWS } from '$lib/documents';
	import { packetMaths } from '$lib/meeting-packet';

	const maths = $derived(
		packetMaths({
			meetingIso: nextCouncil.iso,
			noticeWindowDays: NOTICE_WINDOWS.council,
			seats: councilSeats.length
		})
	);

	const noticeBy = $derived(formatDate(maths.noticeBy, $locale, { dateStyle: 'long' }));
</script>

<article class="print-doc packet-doc" aria-labelledby="packet-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<BrandMark size={34} />
			<div>
				<p class="print-org">{building.name}</p>
				<p class="print-org-line">{building.legalName}</p>
				<p class="print-org-line">{building.address}, {building.city}, {building.province} {building.postal}</p>
				<p class="print-org-line">Strata Plan {building.plan}</p>
			</div>
		</div>
		<dl class="print-ref">
			<dt>{$copy.meetNextMeeting}</dt>
			<dd>{nextCouncil.iso}</dd>
			<dt>{$copy.meetPacketGiven}</dt>
			<dd>{maths.noticeBy}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="packet-title">{$copy.meetPacketHeading}</h1>
		<p class="print-subtitle">{nextCouncil.date} · {nextCouncil.time} · {nextCouncil.place}</p>
	</div>

	<div class="packet-body">
		<section>
			<h2 class="print-h2">{$copy.meetPacketNotice}</h2>
			<p class="print-p">{$copy.meetPacketNoticeLine}</p>
			<table class="packet-table">
				<tbody>
					<tr>
						<th scope="row">{$copy.meetPacketDate}</th>
						<td>{nextCouncil.date}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.meetPacketTime}</th>
						<td>{nextCouncil.time}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.meetPacketPlace}</th>
						<td>{nextCouncil.place}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.meetPacketGiven}</th>
						<td>
							{fill($copy.meetPacketGivenLine, {
								date: noticeBy,
								days: formatNumber(maths.days, $locale),
								window: formatNumber(NOTICE_WINDOWS.council, $locale)
							})}
						</td>
					</tr>
				</tbody>
			</table>
		</section>

		<section>
			<h2 class="print-h2">{$copy.meetPacketAgenda}</h2>
			<!-- The agenda's one-line notes stay on screen. A packet has to fit on
			     one sheet at print size, and the titles are the agenda; the detail is
			     what the console is for. -->
			<ol class="packet-agenda">
				{#each nextCouncil.agenda as item}
					<li>{item.item}</li>
				{/each}
			</ol>
		</section>

		<section>
			<h2 class="print-h2">{fill($copy.meetMinutes, { date: lastCouncil.date })}</h2>
			<p class="packet-attendance">{lastCouncil.attendance}</p>
			<ul class="packet-minutes">
				{#each lastCouncil.minutes as line}
					<li>{line}</li>
				{/each}
			</ul>
		</section>

		<section class="packet-quorum">
			<h2 class="print-h2">{$copy.meetCouncilQuorum}</h2>
			<p class="packet-quorum-need">
				{fill($copy.meetOfFive, { need: formatNumber(maths.quorumNeed, $locale) })}
			</p>
			<p class="packet-rule">{quorum.councilRule}</p>
			<p class="packet-rule"><strong>{$copy.meetNoShow}.</strong> {quorum.adjourn}</p>
		</section>

		<p class="print-note">
			{fill($copy.meetPacketNextAgm, {
				date: nextAgm.date,
				statutory: nextAgm.statutory,
				need: formatNumber(quorum.agmNeed, $locale),
				lots: formatNumber(quorum.lots, $locale)
			})}
		</p>
	</div>

	<footer class="print-foot">
		<p>{fill($copy.meetPacketFooter, { name: building.name })}</p>
	</footer>
</article>

<style>
	.packet-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.5pt;
		line-height: 1.38;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
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
		margin: 1px 0 5px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8.6pt;
		font-weight: 500;
	}
	.print-rule {
		height: 2px;
		margin: 12px 0 12px;
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
		font-size: 9.6pt;
	}
	.packet-body {
		margin-top: 8px;
	}
	.print-h2 {
		margin: 11px 0 4px;
		font-size: 10pt;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		break-after: avoid;
	}
	.print-p {
		margin: 0 0 6px;
	}
	.packet-table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 9pt;
	}
	.packet-table td {
		overflow-wrap: anywhere;
	}
	.packet-table th,
	.packet-table td {
		padding: 3px 6px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: top;
	}
	.packet-table th {
		width: 24%;
		color: #3f4a55;
		font-weight: 600;
		background: #f7f9fa;
	}
	.packet-agenda {
		margin: 0;
		padding-left: 1.35rem;
	}
	.packet-agenda li {
		margin: 0 0 2px;
		font-size: 9.2pt;
		break-inside: avoid;
	}
	.packet-attendance {
		margin: 0 0 3px;
		color: #4b5563;
		font-size: 8.8pt;
	}
	.packet-minutes {
		margin: 0;
		padding-left: 1.15rem;
	}
	.packet-minutes li {
		margin: 0 0 2px;
		font-size: 8.8pt;
		break-inside: avoid;
	}
	.packet-quorum {
		margin-top: 4px;
		padding: 6px 9px;
		border-left: 3px solid #f0801a;
		background: #fdf6ef;
	}
	.packet-quorum-need {
		margin: 0;
		font-size: 14pt;
		font-weight: 700;
		line-height: 1.1;
	}
	.packet-rule {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 8.8pt;
	}
	.print-note {
		margin: 10px 0 2px;
		padding: 6px 9px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 8.6pt;
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
		.packet-doc {
			padding: 1.4rem 1.15rem;
			border-radius: 10px;
			font-size: 9.2pt;
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
