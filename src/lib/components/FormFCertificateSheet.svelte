<script lang="ts">
	/**
	 * Form F, the page a buyer's notary files.
	 *
	 * The letterhead, the lot and the owner, the balance on the day it is signed,
	 * every charge that makes the balance up, the state in a stamped line, and a
	 * signature under it. The arithmetic belongs to `form-f-certificate`; this
	 * only sets it. A clear certificate says the lot is clear; a withheld one says
	 * why, and prints the next fee separately because it is not yet due.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { CertificateLine, FormFCertificate } from '$lib/form-f-certificate';

	let { certificate }: { certificate: FormFCertificate } = $props();

	const asOfLabel = $derived(formatDate(certificate.asOf, $locale, { dateStyle: 'long' }));
	const issuedLabel = $derived(formatDate(certificate.issued, $locale, { dateStyle: 'long' }));
	const deliverLabel = $derived(formatDate(certificate.deliverBy, $locale, { dateStyle: 'long' }));

	function monthName(day: string): string {
		return formatDate(`${day.slice(0, 7)}-01`, $locale, { month: 'long' });
	}

	function label(line: CertificateLine): string {
		if (line.kind === 'fee') return fill($copy.lotSheetFee, { month: monthName(line.due) });
		if (line.kind === 'late') return fill($copy.lotSheetLate, { month: monthName(line.due) });
		if (line.kind === 'fine') return $copy.lotSheetFine;
		return $copy.lotSheetLevy;
	}
</script>

<article class:withheld={certificate.state === 'withheld'} class="print-doc ff-doc" aria-labelledby="form-f-title">
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
			<dd>{certificate.reference}</dd>
			<dt>{$copy.ffCertIssued}</dt>
			<dd>{certificate.issued}</dd>
			<dt>{$copy.ffCertDeliverBy}</dt>
			<dd>{certificate.deliverBy}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="form-f-title">{$copy.ffCertTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.ffCertSubtitle, { lot: certificate.unitId, plan: building.plan })}
		</p>
	</div>

	<table class="ff-facts">
		<tbody>
			<tr>
				<th scope="row">{$copy.payLot}</th>
				<td class="lot">{certificate.unitId}</td>
				<th scope="row">{$copy.accColOwner}</th>
				<td>{certificate.owner}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.ffCertBalanceLabel}</th>
				<td colspan="3" class="amount">{money(certificate.owingCents)}</td>
			</tr>
		</tbody>
	</table>

	{#if certificate.owing.length > 0}
		<table class="ff-table">
			<caption class="sr-only">{$copy.ffCertOwing}</caption>
			<thead>
				<tr>
					<th scope="col">{$copy.payColDate}</th>
					<th scope="col">{$copy.yearSheetItem}</th>
					<th scope="col" class="num">{$copy.accColAmount}</th>
				</tr>
			</thead>
			<tbody>
				{#each certificate.owing as line (line.kind + line.due + (line.period ?? ''))}
					<tr>
						<td class="date">{formatDate(line.due, $locale, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
						<td>{label(line)}</td>
						<td class="num">{money(line.cents)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="2">{$copy.accColTotal}</th>
					<td class="num">{money(certificate.owingCents)}</td>
				</tr>
			</tfoot>
		</table>
	{:else}
		<p class="ff-clear">{fill($copy.ffCertNothing, { date: asOfLabel })}</p>
	{/if}

	{#if certificate.next}
		<p class="ff-next">
			{fill($copy.ffCertNext, {
				label: label(certificate.next),
				amount: money(certificate.next.cents),
				date: formatDate(certificate.next.due, $locale, { dateStyle: 'long' })
			})}
		</p>
	{/if}

	<p class="ff-state">
		<span class="stamp">{certificate.state === 'withheld' ? $copy.ffCertWithheld : $copy.ffCertIssuedState}</span>
		<span class="state-note">
			{certificate.state === 'withheld' ? $copy.ffCertWithheldNote : $copy.ffCertClearNote}
		</span>
	</p>

	<table class="ff-sign">
		<tbody>
			<tr>
				<th scope="row">{$copy.meetProxySignature}</th>
				<td class="blank"></td>
				<th scope="row">{$copy.meetProxyDated}</th>
				<td class="blank short"></td>
			</tr>
		</tbody>
	</table>
	<p class="ff-role">{fill($copy.ffCertSecretary, { plan: building.plan })}</p>

	<p class="print-note">{fill($copy.ffCertBasis, { date: deliverLabel })}</p>

	<footer class="print-foot">
		<p>{fill($copy.ffCertFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.ff-doc {
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
	.ff-facts,
	.ff-table,
	.ff-sign {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}
	.ff-facts {
		margin-top: 12px;
		font-size: 9pt;
	}
	.ff-facts th,
	.ff-facts td {
		padding: 4px 6px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: bottom;
		overflow-wrap: anywhere;
	}
	.ff-facts th {
		width: 16%;
		background: #f7f9fa;
		color: #3f4a55;
		font-weight: 600;
	}
	.ff-facts .lot {
		width: 18%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	.ff-facts .amount {
		font-size: 13pt;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.ff-table {
		margin-top: 10px;
		font-size: 8.6pt;
	}
	.ff-table th,
	.ff-table td {
		padding: 3px 5px;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
	}
	.ff-table thead th {
		border-bottom: 1px solid #b9c2ca;
		color: #3f4a55;
		font-size: 7pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.ff-table .date {
		width: 18%;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.8pt;
		white-space: nowrap;
	}
	.ff-table .num {
		width: 18%;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.ff-table tfoot th,
	.ff-table tfoot td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		padding-top: 4px;
		font-weight: 700;
	}
	.ff-clear {
		margin: 12px 0 0;
		padding: 7px 9px;
		border-left: 3px solid #1d7a4f;
		background: #f2faf5;
		font-size: 9.4pt;
	}
	.ff-next {
		margin: 8px 0 0;
		color: #4b5563;
		font-size: 8.6pt;
	}
	.ff-state {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin: 12px 0 0;
	}
	.stamp {
		flex: none;
		padding: 3px 8px;
		border: 1.5px solid #1d7a4f;
		border-radius: 4px;
		color: #1d7a4f;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 9pt;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.withheld .stamp {
		border-color: #a12a2a;
		color: #a12a2a;
	}
	.state-note {
		color: #4b5563;
		font-size: 8.8pt;
	}
	.ff-sign {
		margin-top: 14px;
		font-size: 8.6pt;
	}
	.ff-sign th,
	.ff-sign td {
		padding: 4px 6px;
		border: 1px solid #dfe4e8;
		text-align: left;
		vertical-align: bottom;
	}
	.ff-sign th {
		width: 15%;
		background: #f7f9fa;
		color: #3f4a55;
		font-weight: 600;
	}
	.ff-sign .blank {
		width: 35%;
		height: 24px;
	}
	.ff-sign .blank.short {
		width: 24%;
	}
	.ff-role {
		margin: 3px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
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
		.ff-doc {
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
		.ff-state {
			flex-direction: column;
			gap: 4px;
		}
	}
</style>
