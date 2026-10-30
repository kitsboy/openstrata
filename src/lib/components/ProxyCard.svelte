<script lang="ts">
	/**
	 * The page an owner fills in and sends back.
	 *
	 * A meeting package that prints the notice, the agenda and the quorum maths
	 * but not the proxy card leaves the reader to invent the form. This is the
	 * card, blank on purpose, with the two facts that decide whether it counts:
	 * the day it must reach the secretary, and the quorum it contributes to. Both
	 * come from `proxy-card`, which takes them from the same meeting arithmetic
	 * the packet prints.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building } from '$lib/demo/building';
	import { nextAgm, quorum } from '$lib/demo/meetings';
	import { NOTICE_WINDOWS } from '$lib/documents';
	import { proxyDeadline } from '$lib/proxy-card';

	const deadline = $derived(proxyDeadline(nextAgm.iso, quorum.agmNeed, NOTICE_WINDOWS.agm));
	const meetingLabel = $derived(formatDate(nextAgm.iso, $locale, { dateStyle: 'long' }));
	const dueLabel = $derived(formatDate(deadline.dueBy, $locale, { dateStyle: 'long' }));
</script>

<article class="print-doc proxy-doc" aria-labelledby="proxy-card-title">
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
			<dt>{$copy.meetPacketDate}</dt>
			<dd>{nextAgm.iso}</dd>
			<dt>{$copy.meetProxyDueLabel}</dt>
			<dd>{deadline.dueBy}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="proxy-card-title">{$copy.meetProxyHeading}</h1>
		<p class="print-subtitle">{fill($copy.meetProxySubtitle, { date: meetingLabel })}</p>
	</div>

	<table class="proxy-form">
		<tbody>
			<tr>
				<th scope="row">{$copy.payLot}</th>
				<td class="blank"></td>
				<th scope="row">{$copy.accColOwner}</th>
				<td class="blank wide"></td>
			</tr>
			<tr>
				<th scope="row">{$copy.meetProxyAppointee}</th>
				<td class="blank wide" colspan="3"></td>
			</tr>
		</tbody>
	</table>

	<p class="proxy-line">{fill($copy.meetProxyAppoint, { date: meetingLabel })}</p>

	<p class="proxy-direction-label">{$copy.meetProxyDirection}</p>
	<ul class="proxy-directions">
		<li><span class="box" aria-hidden="true"></span>{$copy.meetProxyFor}</li>
		<li><span class="box" aria-hidden="true"></span>{$copy.meetProxyAgainst}</li>
		<li><span class="box" aria-hidden="true"></span>{$copy.meetProxyAbstain}</li>
	</ul>
	<p class="proxy-note">{$copy.meetProxyDiscretion}</p>

	<table class="proxy-form signatures">
		<tbody>
			<tr>
				<th scope="row">{$copy.meetProxySignature}</th>
				<td class="blank wide"></td>
				<th scope="row">{$copy.meetProxyDated}</th>
				<td class="blank"></td>
			</tr>
		</tbody>
	</table>

	<p class="proxy-due">
		{fill($copy.meetProxyDue, {
			date: dueLabel,
			days: formatNumber(deadline.days, $locale)
		})}
	</p>

	<p class="print-note">
		{fill($copy.meetProxyBasis, {
			date: dueLabel,
			need: formatNumber(deadline.quorumNeed, $locale),
			lots: formatNumber(quorum.lots, $locale)
		})}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.meetProxyFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.proxy-doc {
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
		line-height: 1.38;
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
	.proxy-form {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		margin-top: 14px;
		font-size: 9pt;
	}
	.proxy-form th,
	.proxy-form td {
		padding: 4px 6px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: bottom;
		overflow-wrap: anywhere;
	}
	.proxy-form th {
		width: 16%;
		color: #3f4a55;
		font-weight: 600;
		background: #f7f9fa;
	}
	.proxy-form .blank {
		width: 18%;
		height: 26px;
	}
	.proxy-form .blank.wide {
		width: 50%;
	}
	.proxy-form.signatures .blank.wide {
		width: 40%;
	}
	.proxy-line {
		margin: 8px 0 0;
		font-size: 9.2pt;
	}
	.proxy-direction-label {
		margin: 14px 0 4px;
		font-size: 8pt;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.proxy-directions {
		display: flex;
		gap: 2.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 9.4pt;
	}
	.proxy-directions li {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.box {
		display: inline-block;
		width: 13px;
		height: 13px;
		border: 1px solid #14181c;
	}
	.proxy-note {
		margin: 5px 0 0;
		color: #4b5563;
		font-size: 8.6pt;
	}
	.proxy-due {
		margin: 14px 0 0;
		padding: 6px 9px;
		border-left: 3px solid #f0801a;
		background: #fdf6ef;
		font-size: 9.4pt;
		font-weight: 600;
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
		.proxy-doc {
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
