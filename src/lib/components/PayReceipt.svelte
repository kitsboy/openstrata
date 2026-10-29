<script lang="ts">
	/**
	 * One payment as one printed page.
	 *
	 * The tape on `/pay` is a screen record; this is the copy an owner keeps. It
	 * is a white sheet on screen as well, so a treasurer sees the page before it
	 * goes to paper, and every colour here is a paper value rather than a theme
	 * token — dark mode cannot change what the receipt looks like.
	 *
	 * The arithmetic is `pay-receipt.ts`; this component supplies the catalog's
	 * names and the locale's formatting, so the model can be tested without one.
	 */
	import { copy, fill, formatDate, locale } from '$lib/i18n';
	import { money, satsLabel } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { ReceiptFacts } from '$lib/pay-receipt';

	let { receipt }: { receipt: ReceiptFacts } = $props();

	const date = $derived(formatDate(receipt.date, $locale, { dateStyle: 'long' }));
</script>

<article class="print-doc receipt-doc" aria-labelledby="receipt-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<div>
				<p class="print-org">{building.name}</p>
				<p class="print-org-line">{building.legalName}</p>
				<p class="print-org-line">
					{building.address}, {building.city}, {building.province}
					{building.postal}
				</p>
				<p class="print-org-line">Strata Plan {building.plan}</p>
			</div>
		</div>
		<dl class="print-ref">
			<dt>{$copy.payColDate}</dt>
			<dd>{date}</dd>
			<dt>{$copy.payLot}</dt>
			<dd>{receipt.unitId}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="receipt-title">{$copy.payReceiptTitle}</h1>
		<p class="print-subtitle">{fill($copy.payReceiptFor, { unit: receipt.unitId })}</p>
	</div>

	<div class="receipt-amount">
		<p class="receipt-amount-label">{$copy.payReceiptAmount}</p>
		<p class="receipt-amount-value">{money(receipt.cents)}</p>
		<p class="receipt-amount-who">{receipt.owner} · {$copy.payLot} {receipt.unitId}</p>
	</div>

	<dl class="receipt-facts">
		<div>
			<dt>{$copy.payReceiptPaidBy}</dt>
			<dd>{receipt.owner}</dd>
		</div>
		<div>
			<dt>{$copy.payColRail}</dt>
			<dd>{receipt.rail}</dd>
		</div>
		<div>
			<dt>{$copy.payColReference}</dt>
			<dd class="mono">{receipt.reference}</dd>
		</div>
		{#if receipt.txid}
			<div class="wide">
				<dt>{$copy.receiptTxid}</dt>
				<dd class="mono break">{receipt.txid}</dd>
			</div>
		{/if}
		{#if receipt.rateCents && receipt.sats !== null}
			<div>
				<dt>{$copy.receiptRate}</dt>
				<dd>{money(receipt.rateCents)}</dd>
			</div>
			<div>
				<dt>{$copy.receiptSats}</dt>
				<dd class="mono">{receipt.btc} BTC · {satsLabel(receipt.sats)}</dd>
			</div>
		{/if}
		<div>
			<dt>{$copy.accFundOperating}</dt>
			<dd>{money(receipt.split.operatingCents)}</dd>
		</div>
		<div>
			<dt>{$copy.accContingencyReserve}</dt>
			<dd>{money(receipt.split.reserveCents)}</dd>
		</div>
	</dl>

	{#if receipt.rateCents === null && (receipt.rail === 'Bitcoin' || receipt.rail === 'Lightning')}
		<!-- The rate was never on the record. Saying so is the honest page; a
		     rate recomputed today would be a number nobody paid. -->
		<p class="receipt-note">{fill($copy.payReceiptRateLost, { date })}</p>
	{/if}

	<p class="receipt-note">{receipt.note}</p>

	<p class="print-basis">{$copy.payReceiptBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.yearSheetFooter, { name: building.name, date })}</p>
	</footer>
</article>

<style>
	.receipt-doc {
		width: 100%;
		max-width: 48rem;
		margin: 0 auto;
		padding: 2.25rem 2.5rem 1.75rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 10.5pt;
		line-height: 1.45;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 2rem;
	}
	.print-org {
		margin: 0;
		font-size: 15pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 2px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 7px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 9pt;
		font-weight: 500;
	}
	.print-rule {
		height: 2px;
		margin: 14px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 19pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 10pt;
	}
	.receipt-amount {
		margin: 16px 0 0;
		padding: 14px 16px;
		border: 1px solid #dfe4e8;
		border-radius: 8px;
		background: #f7f9fa;
	}
	.receipt-amount-label {
		margin: 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.5pt;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.receipt-amount-value {
		margin: 4px 0 0;
		font-size: 26pt;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}
	.receipt-amount-who {
		margin: 6px 0 0;
		color: #5a6672;
		font-size: 9pt;
	}
	.receipt-facts {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 10px 24px;
		margin: 16px 0 0;
	}
	.receipt-facts > div {
		min-width: 0;
		padding-bottom: 7px;
		border-bottom: 1px solid #e8ecef;
	}
	.receipt-facts .wide {
		grid-column: 1 / -1;
	}
	.receipt-facts dt {
		margin: 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.receipt-facts dd {
		margin: 2px 0 0;
		font-size: 10pt;
		font-variant-numeric: tabular-nums;
	}
	.receipt-facts .mono {
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8.5pt;
	}
	.receipt-facts .break {
		overflow-wrap: anywhere;
	}
	.receipt-note {
		margin: 12px 0 0;
		color: #3f4a55;
		font-size: 9pt;
		line-height: 1.5;
	}
	.print-basis {
		margin: 12px 0 0;
		padding: 7px 10px;
		border-left: 3px solid #f0801a;
		background: #fdf6ef;
		color: #3f4a55;
		font-size: 8.5pt;
	}
	.print-foot {
		margin-top: 14px;
		padding-top: 7px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media (max-width: 640px) {
		.receipt-doc {
			padding: 1.5rem 1.25rem;
			border-radius: 10px;
			font-size: 10pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 10px;
		}
		.print-ref {
			text-align: left;
		}
		.receipt-facts {
			grid-template-columns: 1fr;
		}
	}
</style>
