<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import QrPay from '$lib/components/QrPay.svelte';
	import { copy } from '$lib/i18n';
	import { books } from '$lib/demo/books';
	import {
		BTC_CAD_CENTS,
		balance,
		building,
		getUnit,
		isUnitId,
		payReference,
		units
	} from '$lib/demo/building';
	import { btcQuote, money, satsLabel } from '$lib/demo/format';
	import { howMatchingWorks, rails, receipts } from '$lib/demo/payments';
	import { payerUnitId } from '$lib/demo/payer';
	import {
		DEFAULT_SHEET_RAIL,
		LOCK_SECONDS,
		SHEET_RAILS,
		lockClock,
		lockState,
		sheetRail,
		type SheetRail
	} from '$lib/pay-sheet';

	/** The sheet: one amount, three large choices, PAD and cheque tucked below. */
	const railIcon: Record<SheetRail, 'mail' | 'bitcoin' | 'lightning'> = {
		etransfer: 'mail',
		bitcoin: 'bitcoin',
		lightning: 'lightning'
	};

	/**
	 * One writer per value, and the sheet is it. An earlier version also reseeded
	 * `rail` from `?rail=` in an `$effect`, which looked harmless and was not: a
	 * click wrote the rail and began the URL write, then the effect re-ran against
	 * the URL *as it still was* and put the old rail back — the tick and the URL
	 * said e-Transfer while the panel showed Lightning's invoice. So the URL is an
	 * output here, plus a seed on arrival (below), and never a second writer: the
	 * tick, the rows, the QR and the copy button all read this one value.
	 */
	let rail = $state<SheetRail>(DEFAULT_SHEET_RAIL);
	let seconds = $state(LOCK_SECONDS);
	let copied = $state('');

	onMount(() => {
		// A link arrives asking for the rail and the lot a treasurer agreed to.
		const params = new URL(location.href).searchParams;
		rail = sheetRail(params.get('rail'));
		const lot = params.get('unit');
		if (lot && isUnitId(lot)) payerUnitId.set(lot);

		const timer = setInterval(() => {
			seconds = Math.max(0, seconds - 1);
		}, 1000);
		return () => clearInterval(timer);
	});

	const unit = $derived(getUnit($payerUnitId));
	const due = $derived(balance(unit));
	const quote = $derived(btcQuote(Math.max(due.total, 0), BTC_CAD_CENTS));
	const reference = $derived(payReference(unit.id));
	const clock = $derived(lockClock(seconds));
	const lock = $derived(lockState(seconds));
	const chosen = $derived(rails.find((item) => item.id === rail));
	const choices = $derived(
		SHEET_RAILS.map((id) => rails.find((item) => item.id === id)).filter(
			(item) => item !== undefined
		)
	);
	const tucked = $derived(rails.filter((item) => item.id === 'pad' || item.id === 'cheque'));
	/** Only the parts that are actually owed: an empty lot should not list zeros. */
	const parts = $derived(
		[
			{ label: 'October fee', cents: due.october },
			{ label: 'Fees behind', cents: due.arrears },
			{ label: 'Late fee', cents: due.late },
			{ label: 'Fine', cents: due.fine },
			{ label: 'Parkade levy', cents: due.levy }
		].filter((part) => part.cents !== 0)
	);
	const vendor = books.ap[0];

	/** Deep-linkable, so a treasurer can send a lot the exact rail they agreed. */
	function sync(nextUnit: string, nextRail: SheetRail) {
		const params = new URLSearchParams({ unit: nextUnit, rail: nextRail });
		void goto(`${$page.url.pathname}?${params.toString()}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	/** The only writer of `rail`; `sync` then makes the URL agree with it. */
	function pick(next: SheetRail) {
		rail = next;
		sync(unit.id, next);
	}

	function chooseUnit(id: string) {
		if (!isUnitId(id)) return;
		payerUnitId.set(id);
		sync(id, rail);
	}

	function resetLock() {
		seconds = LOCK_SECONDS;
	}

	async function copyPayload(label: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copied = label;
		} catch {
			copied = '';
		}
	}
</script>

<svelte:head>
	<title>Pay — Evergreen House</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="Same balance, five ways to pay it"
		title="Pay a strata lot"
		lede="One amount, then the rail the owner already trusts. Bitcoin and Lightning sit beside e-transfer on every bill — paying in bitcoin does not make an owner less of a full owner. PAD and cheque stay at the bottom for the people who use them. Every destination on this page is a demo and cannot be paid."
	/>

	<!-- The sheet. One amount, three choices, and the picked one in full. -->
	<section class="sheet" aria-labelledby="sheet-heading">
		<h2 class="sr-only" id="sheet-heading">{$copy.payAmountDue} — {$copy.payLot} {unit.id}</h2>

		<div class="sheet-head">
			<label class="sheet-lot">
				<span>{$copy.payLot}</span>
				<select
					value={unit.id}
					onchange={(event) => chooseUnit((event.currentTarget as HTMLSelectElement).value)}
				>
					{#each units as lot (lot.id)}
						<option value={lot.id}>{lot.id} · {lot.owner} · {money(balance(lot).total)}</option>
					{/each}
				</select>
			</label>

			<!-- A stamp, not a control: it says how long the fiat amounts are good for. -->
			<p class="sheet-stamp" data-state={lock}>
				{#if lock === 'locked'}
					<span>{$copy.payRateLocked}</span> <b>{clock}</b>
				{:else}
					<span>{$copy.payRateExpired}</span>
				{/if}
				<button
					type="button"
					class="sheet-stamp-reset"
					aria-label={$copy.payResetLock}
					title={$copy.payResetLock}
					onclick={resetLock}
				><Icon name="refresh" class="h-3 w-3" /></button>
			</p>
		</div>

		<div class="sheet-amount">
			<p class="sheet-amount-label">{$copy.payAmountDue}</p>
			<p class="sheet-amount-value">{money(due.total)}</p>
			<p class="sheet-amount-who">
				{unit.id} · {unit.owner} · {building.plan} · {building.address}
			</p>
			<p class="sheet-amount-ref">
				{$copy.payReference} <code>{reference}</code>
			</p>
			{#if parts.length}
				<dl class="sheet-parts">
					{#each parts as part (part.label)}
						<div><dt>{part.label}</dt><dd>{money(part.cents)}</dd></div>
					{/each}
					<div><dt>{$copy.payAmountDue}</dt><dd>{money(due.total)}</dd></div>
				</dl>
				<p class="sheet-amount-foot">
					Of the monthly fee, {money(due.operatingPart)} is operating and {money(due.crfPart)} is
					reserve. The owner sends one amount.
				</p>
			{/if}
		</div>

		<fieldset class="sheet-choices">
			<legend class="sr-only">{$copy.payChooseRail}</legend>
			{#each choices as item (item.id)}
				<label class="sheet-choice" data-picked={rail === item.id}>
					<input
						class="sr-only"
						type="radio"
						name="pay-rail"
						value={item.id}
						checked={rail === item.id}
						onchange={() => pick(item.id as SheetRail)}
					/>
					<span class="sheet-choice-glyph">
						<Icon name={railIcon[item.id as SheetRail]} class="h-5 w-5" />
					</span>
					<span>
						<span class="sheet-choice-name">{item.name}</span>
						<span class="sheet-choice-note">{item.summary}</span>
					</span>
					{#if rail === item.id}
						<span class="sheet-choice-tick"><Icon name="check" class="h-4 w-4" /></span>
					{/if}
				</label>
			{/each}
		</fieldset>

		<div class="sheet-panel">
			<p class="sheet-panel-head">
				<span class="sheet-panel-glyph"><Icon name={railIcon[rail]} class="h-4 w-4" /></span>
				{chosen?.name}
			</p>

			{#if due.total === 0}
				<p class="sheet-note" data-tone="ok">
					<Icon name="check" class="h-4 w-4" /> {$copy.payNothingDue}
				</p>
			{:else if rail === 'etransfer'}
				<dl class="sheet-rows">
					<div class="sheet-row">
						<dt>{$copy.paySendTo}</dt>
						<dd class="mono">{building.payTo.etransfer}</dd>
					</div>
					<div class="sheet-row">
						<dt>{$copy.payAmountDue}</dt>
						<dd class="amount">{money(due.total)}</dd>
					</div>
					<div class="sheet-row">
						<dt>{$copy.payMessage}</dt>
						<dd class="mono">{reference}</dd>
					</div>
				</dl>
				<button
					type="button"
					class="sheet-copy"
					onclick={() =>
						copyPayload(
							'etransfer',
							`${building.payTo.etransfer} ${money(due.total)} ${reference}`
						)}
				>
					<Icon name="file" class="h-3.5 w-3.5" />
					{copied === 'etransfer' ? $copy.walletCopied : $copy.payCopyInstructions}
				</button>
			{:else}
				<dl class="sheet-rows">
					<div class="sheet-row">
						<dt>{$copy.payAmountDue}</dt>
						<dd class="amount">{money(due.total)}</dd>
					</div>
					<div class="sheet-row">
						<dt>{rail === 'bitcoin' ? 'Exact bitcoin' : 'Exact lightning amount'}</dt>
						<dd class="mono" data-stale={lock === 'expired'}>
							{quote.btc} BTC · {satsLabel(quote.sats)}
						</dd>
					</div>
					<div class="sheet-row">
						<dt>{rail === 'bitcoin' ? 'Watch-only address' : 'Invoice'}</dt>
						<dd class="mono">
							{rail === 'bitcoin' ? building.payTo.bitcoin : building.payTo.lightning}
						</dd>
					</div>
					{#if rail === 'lightning'}
						<div class="sheet-row">
							<dt>Standing offer</dt>
							<dd class="mono">{building.payTo.bolt12}</dd>
						</div>
					{/if}
				</dl>

				{#if lock === 'expired'}
					<!-- A stale rate must not look live: say so, and offer the re-price. -->
					<p class="sheet-note" data-tone="stale">
						<Icon name="alert" class="h-4 w-4" /> {$copy.payRateExpired}
						<button type="button" class="sheet-note-action" onclick={resetLock}
							>{$copy.payResetLock}</button
						>
					</p>
				{/if}

				{#key `${rail}-${due.total}-${reference}`}
					<div class="sheet-qr">
						<QrPay
							rail={rail === 'bitcoin' ? 'onchain' : 'lightning'}
							payload={rail === 'bitcoin' ? building.payTo.bitcoin : building.payTo.lightning}
						/>
						<p class="sheet-qr-note">
							{$copy.payRateLine.replace('{rate}', money(BTC_CAD_CENTS))}
						</p>
					</div>
				{/key}
			{/if}

			<ol class="sheet-steps">
				{#each chosen?.steps ?? [] as step}
					<li>{step}</li>
				{/each}
			</ol>
		</div>
	</section>

	<!-- Tucked under the sheet: the two rails nobody has to be sold on. -->
	<details class="sheet-more">
		<summary>{$copy.payOtherWays}</summary>
		<p class="sheet-more-hint">{$copy.payOtherWaysHint}</p>
		<div class="sheet-more-grid">
			{#each tucked as item (item.id)}
				<article>
					<h3>{item.name}</h3>
					<p class="sheet-more-summary">{item.summary}</p>
					<ol>
						{#each item.steps as step}
							<li>{step}</li>
						{/each}
					</ol>
				</article>
			{/each}
		</div>
	</details>

	<section class="mt-8 rounded-2xl border border-border bg-surface-2 p-5">
		<h2 class="font-bold text-slate-900">How a payment finds its lot</h2>
		<ol class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
			{#each howMatchingWorks as step}
				<li>{step}</li>
			{/each}
		</ol>
	</section>

	<section class="mt-8">
		<h2 class="font-bold text-slate-900">September receipt tape</h2>
		<p class="mt-1 text-sm text-slate-500">A sample of the month, not a second copy of the cash total. The fund statement is the number that has to tie.</p>
		<div class="mt-3 overflow-x-auto rounded-2xl border border-border bg-surface-2">
			<table class="w-full min-w-[680px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-3 py-3">Date</th>
						<th class="px-3 py-3">Lot</th>
						<th class="px-3 py-3">Rail</th>
						<th class="px-3 py-3">Reference</th>
						<th class="px-3 py-3 text-right">Amount</th>
					</tr>
				</thead>
				<tbody>
					{#each receipts as row}
						<tr class="border-b border-border">
							<td class="px-3 py-2">{row.date}</td>
							<td class="px-3 py-2">{row.unitId} {row.owner}</td>
							<td class="px-3 py-2 font-semibold">{row.method}</td>
							<td class="px-3 py-2 font-mono text-xs">{row.reference}</td>
							<td class="px-3 py-2 text-right tabular-nums">{money(row.cents)}</td>
						</tr>
						<tr class="border-b border-border">
							<td></td>
							<td class="px-3 pb-3 text-xs text-slate-500" colspan="4">{row.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="mt-8 rounded-2xl border border-slab-line bg-slab p-5 text-slab-ink">
		<h2 class="font-bold">Council paying a vendor</h2>
		<p class="mt-2 text-sm leading-relaxed text-slab-muted">
			{vendor.vendor} is owed {money(vendor.cents)} for {vendor.memo.toLowerCase()}, due {vendor.due}.
			The ordinary way out is an e-transfer from the operating account, after the treasurer matches the invoice to account 6250.
			Bitcoin and Lightning are on the card because the vendor may ask. They are not the default, and they are never paid from the reserve or the levy trust.
			A bitcoin payment would be a PSBT signed 3 of 5 on hardware wallets. This software watches. It does not hold a key.
		</p>
	</section>
</div>

<style>
	/* The sheet is built from tokens only: no literal fill, so it flips with the
	   theme like every other card, and every ink here is a step the contrast
	   audit already holds in both themes. */

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.sheet {
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--paper);
		box-shadow: var(--shadow-card);
		overflow: hidden;
	}

	.sheet-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px 14px;
		padding: 13px 18px;
		border-bottom: 1px solid var(--line);
		background: var(--color-surface-2);
	}

	.sheet-lot {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.sheet-lot select {
		max-width: 100%;
		padding: 7px 10px;
		border: 1px solid var(--line);
		border-radius: 9px;
		color: var(--ink);
		background: var(--paper);
		font-size: 12.5px;
		font-weight: 700;
		letter-spacing: normal;
		text-transform: none;
	}

	/* The rate lock, as a stamp: quiet until it is wrong. */
	.sheet-stamp {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin: 0;
		padding: 5px 7px 5px 10px;
		border: 1px solid var(--line);
		border-radius: 999px;
		color: var(--muted);
		background: var(--paper);
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 10.5px;
		font-variant-numeric: tabular-nums;
	}
	.sheet-stamp b {
		color: var(--ink);
		font-weight: 700;
	}
	.sheet-stamp[data-state='expired'] {
		color: var(--warning-text);
		border-color: color-mix(in srgb, var(--warning-text) 34%, transparent);
	}
	.sheet-stamp-reset {
		display: inline-grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		color: inherit;
		background: transparent;
		transition: background 0.18s ease;
	}
	.sheet-stamp-reset:hover {
		background: var(--color-surface-3);
	}

	.sheet-amount {
		padding: 24px 18px 18px;
	}
	.sheet-amount-label {
		margin: 0;
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.sheet-amount-value {
		margin: 6px 0 0;
		font-size: clamp(38px, 8vw, 52px);
		font-weight: 800;
		letter-spacing: -2px;
		line-height: 1;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.sheet-amount-who {
		margin: 10px 0 0;
		font-size: 13px;
		color: var(--muted);
	}
	.sheet-amount-ref {
		margin: 3px 0 0;
		font-size: 12px;
		color: var(--muted);
	}
	.sheet-amount-ref code {
		color: var(--ink);
		font-family: 'DM Mono', ui-monospace, monospace;
		font-weight: 700;
	}
	.sheet-parts {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
		margin: 16px 0 0;
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}
	.sheet-parts div {
		display: flex;
		align-items: baseline;
		gap: 7px;
	}
	.sheet-parts dt {
		font-size: 11.5px;
		color: var(--muted);
	}
	.sheet-parts dd {
		margin: 0;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.sheet-amount-foot {
		margin: 10px 0 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--muted);
	}

	/* Three large choices. Real radios under styled labels, so keyboard and
	   screen-reader behaviour is the browser's rather than ours. */
	.sheet-choices {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		margin: 0;
		padding: 0 18px 18px;
		border: 0;
	}
	.sheet-choice {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 11px;
		min-height: 118px;
		padding: 14px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--paper);
		cursor: pointer;
		transition:
			border-color 0.18s ease,
			box-shadow 0.18s ease,
			transform 0.18s ease;
	}
	.sheet-choice:hover {
		border-color: color-mix(in srgb, var(--brand-text) 45%, var(--line));
		transform: translateY(-1px);
	}
	.sheet-choice[data-picked='true'] {
		border-color: var(--brand-text);
		box-shadow: inset 0 0 0 1px var(--brand-text);
		background: color-mix(in srgb, var(--brand-text) 5%, var(--paper));
	}
	.sheet-choice:has(input:focus-visible) {
		outline: 3px solid var(--brand-text);
		outline-offset: 3px;
	}
	/* A wrapper rather than a class passed into <Icon>: Svelte cannot see a scoped
	   class that only ever lands on another component's element, and it reports
	   the rule as unused (a warning this repo keeps at zero). The icons are drawn
	   in currentColor, so the wrapper carries it. */
	.sheet-choice-glyph {
		display: inline-flex;
		margin-top: 1px;
		color: var(--brand-text);
	}
	.sheet-choice-name {
		display: block;
		font-size: 15px;
		font-weight: 800;
		color: var(--ink);
	}
	.sheet-choice-note {
		display: block;
		margin-top: 4px;
		font-size: 12px;
		line-height: 1.45;
		color: var(--muted);
	}
	.sheet-choice-tick {
		position: absolute;
		top: 12px;
		right: 12px;
		color: var(--brand-text);
	}

	.sheet-panel {
		padding: 18px;
		border-top: 1px solid var(--line);
		background: var(--color-surface-2);
	}
	.sheet-panel-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-size: 15px;
		font-weight: 800;
		color: var(--ink);
	}
	.sheet-panel-glyph {
		display: inline-flex;
		color: var(--brand-text);
	}
	.sheet-rows {
		display: grid;
		gap: 12px 20px;
		margin: 14px 0 0;
	}
	.sheet-row {
		min-width: 0;
	}
	.sheet-row dt {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.sheet-row dd {
		margin: 4px 0 0;
		font-size: 13.5px;
		color: var(--ink);
		overflow-wrap: anywhere;
	}
	.sheet-row dd.amount {
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.8px;
		font-variant-numeric: tabular-nums;
	}
	.sheet-row dd.mono {
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 12px;
	}
	.sheet-row dd[data-stale='true'] {
		color: var(--warning-text);
	}
	.sheet-steps {
		margin: 16px 0 0;
		padding-left: 18px;
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--muted);
	}
	.sheet-note {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin: 14px 0 0;
		padding: 10px 12px;
		border-radius: 10px;
		font-size: 12.5px;
		font-weight: 600;
	}
	.sheet-note[data-tone='ok'] {
		color: var(--color-emerald-950);
		background: var(--color-emerald-50);
	}
	.sheet-note[data-tone='stale'] {
		color: var(--warning-text);
		background: color-mix(in srgb, var(--warning-text) 10%, var(--paper));
	}
	.sheet-note-action {
		margin-left: auto;
		padding: 5px 10px;
		border: 1px solid currentColor;
		border-radius: 8px;
		color: inherit;
		background: transparent;
		font-size: 11.5px;
		font-weight: 800;
	}
	.sheet-copy {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin-top: 16px;
		padding: 10px 14px;
		border: 1px solid var(--color-slab-line);
		border-radius: 10px;
		color: var(--color-slab-ink);
		background: var(--color-slab);
		font-size: 12px;
		font-weight: 800;
	}
	.sheet-qr {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--paper);
	}
	.sheet-qr-note {
		margin: 0;
		max-width: 34ch;
		text-align: center;
		font-size: 11px;
		line-height: 1.5;
		color: var(--muted);
	}

	.sheet-more {
		margin-top: 14px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--color-surface-2);
	}
	.sheet-more > summary {
		padding: 14px 18px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 800;
		color: var(--ink);
	}
	.sheet-more-hint {
		margin: 0 18px 10px;
		font-size: 12.5px;
		color: var(--muted);
	}
	.sheet-more-grid {
		display: grid;
		gap: 14px;
		padding: 0 18px 18px;
	}
	.sheet-more-grid h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 800;
		color: var(--ink);
	}
	.sheet-more-summary {
		margin: 4px 0 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--muted);
	}
	.sheet-more-grid ol {
		margin: 10px 0 0;
		padding-left: 18px;
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--muted);
	}

	@media (min-width: 720px) {
		.sheet-rows {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.sheet-more-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 719px) {
		.sheet-choices {
			grid-template-columns: minmax(0, 1fr);
		}
		.sheet-choice {
			min-height: 0;
		}
		.sheet-stamp {
			width: 100%;
			justify-content: space-between;
		}
	}
	@media print {
		.sheet {
			box-shadow: none;
		}
		.sheet-choices {
			display: none;
		}
	}
</style>
