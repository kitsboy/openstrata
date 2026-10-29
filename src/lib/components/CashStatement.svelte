<script lang="ts">
	/**
	 * The operating account on one printed page.
	 *
	 * The Journal tab answers "what moved and what does the chain say" on screen.
	 * This is the same book as the page a council files: the account named, its
	 * opening balance, every entry with its movement, running balance and hash,
	 * the closing balance, and the chain head — so a reader can check the paper
	 * against the ledger without the app open.
	 *
	 * Paper values, not theme tokens, like every printable sheet here: dark mode
	 * cannot change what a council hands round. The rules live in
	 * `cash-statement.ts`; this component formats what it is given.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import type { CashStatement } from '$lib/cash-statement';

	let {
		sheet,
		asOf,
		openingDate,
		ties = false
	}: {
		sheet: CashStatement;
		asOf: string;
		openingDate: string;
		/** The close ties to the funds tab; a stopped period cannot make that claim. */
		ties?: boolean;
	} = $props();

	const long = { day: 'numeric', month: 'long', year: 'numeric' } as const;
	const opened = $derived(formatDate(openingDate, $locale, long));
	const closed = $derived(formatDate(asOf, $locale, long));
	const from = $derived(formatDate(sheet.rows.at(0)?.entry.date ?? openingDate, $locale, long));

	/** A column with no movement prints a dash, so a zero is never a gap. */
	function signed(cents: number): string {
		if (cents === 0) return '—';
		return cents > 0 ? `+${money(cents)}` : `−${money(-cents)}`;
	}
</script>

<article class="print-doc cash-doc" aria-labelledby="cash-statement-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<BrandMark size={30} />
			<div>
				<p class="print-org">{building.name}</p>
				<p class="print-org-line">{building.legalName}</p>
				<p class="print-org-line">{building.address}, {building.city}, {building.province} {building.postal}</p>
				<p class="print-org-line">Strata Plan {building.plan}</p>
			</div>
		</div>
		<dl class="print-ref">
			<dt>{$copy.yearSheetFiscal}</dt>
			<dd>{building.fiscalLabel}</dd>
			<dt>{$copy.yearSheetBooksTo}</dt>
			<dd>{formatDate(asOf, $locale, { dateStyle: 'medium' })}</dd>
			<dt>{$copy.accCashStatementAccount}</dt>
			<dd>{sheet.account}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="cash-statement-title">{$copy.accCashStatementTitle}</h1>
		<p class="print-subtitle">
			{#if sheet.rows.length === 0}
				{sheet.account} {building.banks.operating.name}
			{:else}
				{fill($copy.accCashStatementSubtitle, {
					account: sheet.account,
					name: building.banks.operating.name,
					from,
					to: closed
				})}
			{/if}
		</p>
	</div>

	{#if sheet.rows.length === 0}
		<!-- A month before the journal begins has no statement to print: no opening,
		     no closing and no head, only the reason there is nothing here. -->
		<p class="print-note">
			{fill($copy.accCashStatementNoEntry, { date: closed, first: opened })}
		</p>
	{:else}
		<div class="cash-cards">
			<div class="cash-card">
				<p class="cash-card-label">{$copy.accCashStatementOpening}</p>
				<p class="cash-card-figure">{money(sheet.opening)}</p>
				<p class="cash-card-note">{opened}</p>
			</div>
			<div class="cash-card">
				<p class="cash-card-label">{$copy.accCashStatementMovement}</p>
				<p class="cash-card-figure">{signed(sheet.moved)}</p>
				<p class="cash-card-note">
					{fill($copy.accCashStatementEntries, {
						moved: formatNumber(sheet.movedEntries, $locale),
						entries: formatNumber(sheet.rows.length, $locale)
					})}
				</p>
			</div>
			<div class="cash-card">
				<p class="cash-card-label">{$copy.accCashStatementClosing}</p>
				<p class="cash-card-figure">{money(sheet.closing)}</p>
				<p class="cash-card-note">{closed}</p>
			</div>
		</div>

		<div class="cash-table-wrap">
			<table class="cash-table">
				<caption class="sr-only">{$copy.accCashStatementTitle}</caption>
				<thead>
					<tr>
						<th scope="col" class="date">{$copy.payColDate}</th>
						<th scope="col" class="entry">{$copy.accColEntry}</th>
						<th scope="col" class="acct">{$copy.accCashStatementAccount}</th>
						<th scope="col" class="num">{$copy.accCashStatementMovement}</th>
						<th scope="col" class="num">{$copy.accColRunning}</th>
					</tr>
				</thead>
				<tbody>
					{#each sheet.rows as row (row.hash)}
						<tr>
							<td class="date">
								{formatDate(row.entry.date, $locale, {
									day: 'numeric',
									month: 'short',
									year: 'numeric'
								})}
							</td>
							<th scope="row" class="entry">
								<span class="entry-memo">{row.entry.memo}</span>
								<span class="entry-hash">{row.hash}</span>
							</th>
							<td class="acct">{row.accounts.length > 0 ? row.accounts.join(' · ') : '—'}</td>
							<td class="num">{signed(row.movement)}</td>
							<td class="num balance">{money(row.balance)}</td>
						</tr>
					{/each}
					<tr class="cash-total">
						<th scope="row" colspan="2" class="entry">{$copy.accCashStatementClosing}</th>
						<td class="acct"></td>
						<td class="num">{signed(sheet.moved)}</td>
						<td class="num balance">{money(sheet.closing)}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="print-note">
			{ties
				? $copy.accCashStatementTie
				: fill($copy.accCashStatementPeriod, { date: closed })}
		</p>

		<div class="cash-chain">
			<p class="print-basis">{$copy.accCashStatementChain}</p>
			<p class="cash-head">
				<span class="cash-head-label">{$copy.accCashStatementHead}</span>
				<span class="cash-head-genesis">{sheet.genesis}</span>
				<span class="cash-head-arrow" aria-hidden="true">→</span>
				<code>{sheet.head}</code>
			</p>
		</div>
	{/if}

	<p class="print-basis">
		{fill($copy.accCashStatementBasis, { account: sheet.account })}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.accCashStatementFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.cash-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 1.8rem 2.1rem 1rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9pt;
		line-height: 1.35;
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
		font-size: 13.5pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		flex: 0 1 auto;
		max-width: 58mm;
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 4px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.6pt;
		overflow-wrap: anywhere;
	}
	.print-rule {
		height: 2px;
		margin: 9px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 16pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9pt;
	}

	.cash-cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
		margin: 10px 0 4px;
	}
	.cash-card {
		padding: 6px 9px;
		border: 1px solid #dfe4e8;
		border-radius: 6px;
		background: #f7f9fa;
	}
	.cash-card-label {
		margin: 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.cash-card-figure {
		margin: 2px 0 0;
		font-size: 13pt;
		font-weight: 700;
		line-height: 1.15;
		font-variant-numeric: tabular-nums;
	}
	.cash-card-note {
		margin: 1px 0 0;
		color: #5a6672;
		font-size: 6.6pt;
	}

	.cash-table-wrap {
		margin: 10px 0 0;
		overflow-x: auto;
	}
	.cash-table {
		width: 100%;
		min-width: 540px;
		border-collapse: collapse;
		font-size: 7.4pt;
		table-layout: fixed;
	}
	.cash-table thead th {
		padding: 4px 6px;
		border-bottom: 1px solid #c9cfd4;
		background: #f7f9fa;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-align: left;
		text-transform: uppercase;
	}
	.cash-table td,
	.cash-table tbody th {
		padding: 3px 6px;
		border-bottom: 1px solid #e8ecef;
		text-align: left;
		vertical-align: top;
	}
	.cash-table tbody th {
		font-weight: 400;
	}
	.cash-table .date {
		width: 21mm;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.cash-table .acct {
		width: 18mm;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.6pt;
		white-space: nowrap;
	}
	.cash-table .num {
		width: 25mm;
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.cash-table .balance {
		font-weight: 700;
	}
	.cash-table .entry-memo {
		display: block;
		color: #14181c;
	}
	.cash-table .entry-hash {
		display: block;
		margin-top: 1px;
		color: #7a858f;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.02em;
	}
	.cash-table .cash-total td,
	.cash-table .cash-total .entry {
		border-top: 1px solid #9aa5ad;
		border-bottom: 1px solid #9aa5ad;
		font-weight: 700;
	}
	.cash-table .cash-total .entry {
		font-size: 7.4pt;
	}

	.cash-chain {
		margin-top: 6px;
	}
	.cash-head {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 5px;
		margin: 4px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
	}
	.cash-head-label {
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.cash-head-genesis {
		color: #9aa5ad;
	}
	.cash-head code {
		color: #14181c;
		font-size: 7.2pt;
		font-weight: 700;
	}
	.print-note {
		margin: 6px 0 0;
		padding: 4px 7px;
		border: 1px solid #e4d8c8;
		border-radius: 4px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.4pt;
	}
	.print-basis {
		margin: 4px 0 0;
		color: #5a6672;
		font-size: 7pt;
		line-height: 1.35;
	}
	.print-foot {
		margin-top: 6px;
		padding-top: 4px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media print {
		.cash-table-wrap {
			overflow: visible;
		}
		.cash-table {
			min-width: 0;
		}
	}

	@media (max-width: 640px) {
		.cash-doc {
			padding: 1.2rem 1rem;
			border-radius: 10px;
			font-size: 8pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 6px;
		}
		.print-ref {
			text-align: left;
		}
		.cash-table {
			min-width: 480px;
		}
	}
</style>
