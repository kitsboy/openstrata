<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import QrPay from '$lib/components/QrPay.svelte';
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

	let rail = $state('lightning');
	let seconds = $state(15 * 60);
	let copied = $state('');

	$effect(() => {
		const requested = $page.url.searchParams.get('rail');
		const unit = $page.url.searchParams.get('unit');
		if (requested) rail = requested;
		if (unit && isUnitId(unit)) payerUnitId.set(unit);
	});

	onMount(() => {
		const timer = setInterval(() => {
			seconds = Math.max(0, seconds - 1);
		}, 1000);
		return () => clearInterval(timer);
	});

	const unit = $derived(getUnit($payerUnitId));
	const due = $derived(balance(unit));
	const quote = $derived(btcQuote(Math.max(due.total, 0), BTC_CAD_CENTS));
	const reference = $derived(payReference(unit.id));
	const clock = $derived(`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);
	const vendor = books.ap[0];

	function chooseUnit(id: string) {
		if (isUnitId(id)) payerUnitId.set(id);
	}

	async function copy(label: string, value: string) {
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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="Same balance, five ways to pay it"
		title="Pay a strata lot"
		lede="Bitcoin and Lightning sit beside e-transfer on every bill. The lot does not change rails to be a full owner. PAD and cheque stay for the people who already use them. Every destination on this page is a demo and cannot be paid."
	/>

	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<label class="block text-sm font-semibold text-slate-700">
			Lot
			<select
				class="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium sm:w-96"
				value={unit.id}
				onchange={(event) => chooseUnit((event.currentTarget as HTMLSelectElement).value)}
			>
				{#each units as lot}
					<option value={lot.id}>{lot.id} · {lot.owner} · {money(balance(lot).total)}</option>
				{/each}
			</select>
		</label>
		<div class="text-sm text-slate-500">
			CAD lock {clock}
			<button class="ml-2 font-semibold text-brand-700" onclick={() => (seconds = 15 * 60)}>Reset demo lock</button>
			<p>Rate on this screen: {money(BTC_CAD_CENTS)} per bitcoin. It does not move while you read.</p>
		</div>
	</div>

	<div class="grid gap-3 rounded-2xl border border-border bg-white p-5 sm:grid-cols-3 lg:grid-cols-6">
		<div><p class="text-xs text-slate-400">October fee</p><p class="font-semibold tabular-nums">{money(due.october)}</p></div>
		<div><p class="text-xs text-slate-400">Fees behind</p><p class="font-semibold tabular-nums">{money(due.arrears)}</p></div>
		<div><p class="text-xs text-slate-400">Late</p><p class="font-semibold tabular-nums">{money(due.late)}</p></div>
		<div><p class="text-xs text-slate-400">Fine</p><p class="font-semibold tabular-nums">{money(due.fine)}</p></div>
		<div><p class="text-xs text-slate-400">Levy</p><p class="font-semibold tabular-nums">{money(due.levy)}</p></div>
		<div><p class="text-xs text-slate-400">Ask for</p><p class="text-lg font-bold tabular-nums">{money(due.total)}</p></div>
	</div>
	<p class="mt-2 text-sm text-slate-500">
		Reference <span class="font-mono font-semibold text-slate-800">{reference}</span>.
		Of the monthly fee, {money(due.operatingPart)} is operating and {money(due.crfPart)} is reserve. The owner sends one amount.
	</p>

	<div class="mt-6 grid gap-4 lg:grid-cols-3">
		{#each rails.filter((item) => item.id === 'etransfer' || item.id === 'bitcoin' || item.id === 'lightning') as item}
			<article class="rounded-2xl border bg-white p-5 {rail === item.id ? 'border-slate-900 ring-2 ring-slate-900' : 'border-border'}">
				<div class="flex items-center gap-2">
					{#if item.id === 'bitcoin'}<Icon name="bitcoin" class="h-5 w-5 text-bitcoin" />{/if}
					{#if item.id === 'lightning'}<Icon name="lightning" class="h-5 w-5 text-amber-500" />{/if}
					<h2 class="text-lg font-bold text-slate-900">{item.name}</h2>
				</div>
				<p class="mt-1 text-sm text-slate-500">{item.summary}</p>
				{#if due.total === 0}
					<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Nothing to collect on this lot.</p>
				{:else if item.id === 'etransfer'}
					<dl class="mt-4 space-y-2 text-sm">
						<div><dt class="text-xs text-slate-400">Send to</dt><dd class="font-mono">{building.payTo.etransfer}</dd></div>
						<div><dt class="text-xs text-slate-400">Amount</dt><dd class="text-xl font-bold tabular-nums">{money(due.total)}</dd></div>
						<div><dt class="text-xs text-slate-400">Message</dt><dd class="font-mono">{reference}</dd></div>
					</dl>
					<button class="mt-3 text-sm font-semibold text-brand-700" onclick={() => copy('e-transfer', `${building.payTo.etransfer} ${money(due.total)} ${reference}`)}>
						{copied === 'e-transfer' ? 'Copied' : 'Copy the instructions'}
					</button>
				{:else}
					<dl class="mt-4 space-y-2 text-sm">
						<div><dt class="text-xs text-slate-400">CAD</dt><dd class="text-xl font-bold tabular-nums">{money(due.total)}</dd></div>
						<div><dt class="text-xs text-slate-400">Exact amount</dt><dd class="font-mono">{quote.btc} BTC · {satsLabel(quote.sats)}</dd></div>
						<div>
							<dt class="text-xs text-slate-400">{item.id === 'bitcoin' ? 'Watch-only address' : 'Invoice'}</dt>
							<dd class="break-all font-mono text-xs">{item.id === 'bitcoin' ? building.payTo.bitcoin : building.payTo.lightning}</dd>
						</div>
						{#if item.id === 'lightning'}
							<div><dt class="text-xs text-slate-400">Standing offer</dt><dd class="break-all font-mono text-xs">{building.payTo.bolt12}</dd></div>
						{/if}
					</dl>
					<button
						class="mt-3 text-sm font-semibold text-brand-700"
						onclick={() => copy(item.id, item.id === 'bitcoin' ? building.payTo.bitcoin : building.payTo.lightning)}
					>
						{copied === item.id ? 'Copied' : 'Copy the demo string'}
					</button>
					{#key `${item.id}-${due.total}`}
						<div class="mt-4">
							<QrPay
								rail={item.id === 'bitcoin' ? 'onchain' : 'lightning'}
								payload={item.id === 'bitcoin' ? building.payTo.bitcoin : building.payTo.lightning}
							/>
							<p class="mt-2 text-center text-xs text-slate-500">Demo code. Do not pay it.</p>
						</div>
					{/key}
				{/if}
				<ol class="mt-4 list-decimal space-y-1 pl-4 text-sm leading-relaxed text-slate-600">
					{#each item.steps as step}
						<li>{step}</li>
					{/each}
				</ol>
			</article>
		{/each}
	</div>

	<div class="mt-4 grid gap-4 md:grid-cols-2">
		{#each rails.filter((item) => item.id === 'pad' || item.id === 'cheque') as item}
			<article class="rounded-2xl border border-border bg-white p-5">
				<h2 class="font-bold text-slate-900">{item.name}</h2>
				<p class="mt-1 text-sm text-slate-500">{item.summary}</p>
				<ol class="mt-3 list-decimal space-y-1 pl-4 text-sm text-slate-600">
					{#each item.steps as step}
						<li>{step}</li>
					{/each}
				</ol>
			</article>
		{/each}
	</div>

	<section class="mt-8 rounded-2xl border border-border bg-white p-5">
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
		<div class="mt-3 overflow-x-auto rounded-2xl border border-border bg-white">
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

	<section class="mt-8 rounded-2xl border border-border bg-slate-900 p-5 text-white">
		<h2 class="font-bold">Council paying a vendor</h2>
		<p class="mt-2 text-sm leading-relaxed text-white/75">
			{vendor.vendor} is owed {money(vendor.cents)} for {vendor.memo.toLowerCase()}, due {vendor.due}.
			The ordinary way out is an e-transfer from the operating account, after the treasurer matches the invoice to account 6250.
			Bitcoin and Lightning are on the card because the vendor may ask. They are not the default, and they are never paid from the reserve or the levy trust.
			A bitcoin payment would be a PSBT signed 3 of 5 on hardware wallets. This software watches. It does not hold a key.
		</p>
	</section>
</div>
