<script lang="ts">
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { money } from '$lib/demo/format';
	import {
		balance,
		building,
		floorsDesc,
		formF,
		getUnit,
		haystack,
		headcount,
		isUnitId,
		tone,
		toneStyles,
		units,
		type Unit
	} from '$lib/demo/building';
	import { payerUnitId } from '$lib/demo/payer';

	let selectedId = $state('305');
	let floor = $state<'all' | number>('all');
	let focus = $state('all');
	let query = $state('');

	$effect(() => {
		const lot = $page.url.searchParams.get('lot');
		const toneQuery = $page.url.searchParams.get('tone');
		if (lot && isUnitId(lot)) selectedId = lot;
		if (toneQuery) focus = toneQuery;
	});

	const selected = $derived(getUnit(selectedId));
	const due = $derived(balance(selected));

	function matches(unit: Unit): boolean {
		if (floor !== 'all' && unit.floor !== floor) return false;
		if (focus === 'formk' && unit.formK !== 'missing') return false;
		if (focus === 'arrears' && unit.feeArrearsMonths === 0 && unit.lateOwing === 0) return false;
		if (focus === 'levy' && unit.levyOwing === 0) return false;
		if (focus === 'vacant' && unit.occupancy !== 'vacant') return false;
		if (focus === 'short-term' && unit.occupancy !== 'short-term') return false;
		if (focus === 'withheld' && formF(unit) !== 'withheld') return false;
		if (query.trim() && !haystack(unit).includes(query.trim().toLowerCase())) return false;
		return true;
	}

	const visible = $derived(units.filter(matches));

	function choose(id: string) {
		selectedId = id;
		payerUnitId.set(id);
	}

	const filters = [
		['all', 'All lots'],
		['arrears', 'Fees behind'],
		['formk', 'Form K missing'],
		['levy', 'Levy balance'],
		['withheld', 'Form F withheld'],
		['vacant', 'Vacant'],
		['short-term', 'Short-term']
	] as const;
</script>

<svelte:head>
	<title>Units — Evergreen House</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="{headcount.lots} strata lots · {building.floors} floors"
		title="Who lives here"
		lede="Pick a lot. The card on the right is the owner file: fees, levy, Form K, and the vacancy-tax notes the secretary actually gets asked for."
	/>

	<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
		<input
			bind:value={query}
			placeholder="Search a name or a lot"
			aria-label="Search lots"
			class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm sm:max-w-xs"
		/>
		<div class="flex gap-1 overflow-x-auto">
			{#each [1, 2, 3, 4] as level}
				<button
					class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold {floor === level ? 'bg-slate-900 text-white' : 'bg-white border border-border text-slate-600'}"
					onclick={() => (floor = floor === level ? 'all' : level)}
				>Floor {level}</button>
			{/each}
		</div>
	</div>
	<div class="mb-6 flex gap-1 overflow-x-auto">
		{#each filters as [id, label]}
			<button
				class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold {focus === id ? 'bg-brand-600 text-white' : 'bg-white border border-border text-slate-600'}"
				onclick={() => (focus = id)}
			>{label}</button>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_340px]">
		<div class="space-y-3">
			{#each floorsDesc as level}
				{@const onFloor = level.units.filter(matches)}
				{#if onFloor.length > 0 && (floor === 'all' || floor === level.floor)}
					<div class="rounded-2xl border border-border bg-white p-3">
						<p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Floor {level.floor}</p>
						<div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
							{#each onFloor as unit}
								<button
									class="rounded-xl border px-2 py-2 text-left {selectedId === unit.id ? 'ring-2 ring-brand-500' : ''} {toneStyles[tone(unit)].cell}"
									onclick={() => choose(unit.id)}
								>
									<span class="block text-sm font-bold">{unit.id}</span>
									<span class="block truncate text-xs">{unit.owner}</span>
									<span class="block text-[11px] tabular-nums">{money(balance(unit).fee)}/mo</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
			{#if visible.length === 0}
				<p class="rounded-2xl border border-dashed border-border p-6 text-sm text-slate-500">No lot matches that filter.</p>
			{/if}
		</div>

		<aside class="h-fit rounded-2xl border border-border bg-white p-5 lg:sticky lg:top-36">
			<p class="text-xs font-bold uppercase tracking-wide text-slate-400">Lot {selected.id} · strata lot {selected.lot}</p>
			<h2 class="mt-1 text-2xl font-bold text-slate-900">{selected.owner}</h2>
			<p class="text-sm text-slate-500">{selected.type} · {selected.sqft} sq ft · floor {selected.floor}</p>
			{#if selected.role}
				<p class="mt-2 text-sm font-semibold text-brand-700">{selected.role}</p>
			{/if}

			<dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div>
					<dt class="text-xs text-slate-400">Monthly fee</dt>
					<dd class="font-semibold tabular-nums">{money(due.fee)}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-400">To clear, including October</dt>
					<dd class="font-semibold tabular-nums">{money(due.total)}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-400">Entitlement</dt>
					<dd class="font-semibold tabular-nums">{selected.entitlement} pts</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-400">Form F</dt>
					<dd class="font-semibold {formF(selected) === 'withheld' ? 'text-rose-700' : 'text-emerald-700'}">{formF(selected)}</dd>
				</div>
			</dl>

			<ul class="mt-4 space-y-1 text-sm text-slate-600">
				<li>October: {selected.prepaidOctober ? 'already paid' : money(due.october)}</li>
				<li>Fees behind: {money(due.arrears)}{selected.feeArrearsMonths ? ` (${selected.feeArrearsMonths} month${selected.feeArrearsMonths === 1 ? '' : 's'})` : ''}</li>
				<li>Late fees: {money(due.late)}</li>
				<li>Fines: {money(due.fine)}</li>
				<li>Levy still owing: {money(due.levy)}</li>
				<li>Of each month’s fee, {money(due.operatingPart)} is operating and {money(due.crfPart)} is reserve.</li>
			</ul>

			<div class="mt-4 space-y-2 text-sm text-slate-600">
				<p><span class="font-semibold text-slate-800">Lives:</span> {selected.occupancy === 'owner' ? 'Owner' : selected.occupancy}{selected.tenant ? ` — ${selected.tenant}` : ''}{selected.tenantSince ? ` since ${selected.tenantSince}` : ''}</p>
				<p><span class="font-semibold text-slate-800">Owner is in:</span> {selected.ownerLives}</p>
				<p><span class="font-semibold text-slate-800">Form K:</span> {selected.formK}</p>
				<p><span class="font-semibold text-slate-800">Pays by:</span> {selected.payMethod}</p>
				<p><span class="font-semibold text-slate-800">Parking / locker:</span> {selected.parking.join(', ')} · {selected.locker}</p>
				<p><span class="font-semibold text-slate-800">Pets:</span> {selected.pets}</p>
				<p><span class="font-semibold text-slate-800">EV:</span> {selected.ev ? 'Charger installed' : 'No charger'}</p>
				<p class="text-xs text-slate-400">{selected.email} · {selected.phone}</p>
			</div>

			<div class="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
				<p><span class="font-semibold text-slate-800">Empty Homes Tax.</span> {selected.eht}</p>
				<p><span class="font-semibold text-slate-800">Speculation tax.</span> {selected.svt}</p>
				<p><span class="font-semibold text-slate-800">Underused housing.</span> {selected.uht}</p>
			</div>

			<p class="mt-4 text-sm leading-relaxed text-slate-700">{selected.notes}</p>

			{#if selected.id === '201'}
				<p class="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">Form B was requested September 28 and is due October 5. The lot is clear, so Form F can go with it.</p>
			{/if}

			<a
				href="/pay?unit={selected.id}"
				class="mt-4 flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white no-underline"
				onclick={() => payerUnitId.set(selected.id)}
			>
				Pay this lot
			</a>
		</aside>
	</div>
</div>
