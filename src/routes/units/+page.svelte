<script lang="ts">
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { money } from '$lib/demo/format';
	import { plan } from '$lib/floor-plan';
	import { copy, fill, formatNumber } from '$lib/i18n';
	import {
		balance,
		building,
		formF,
		getUnit,
		haystack,
		headcount,
		isUnitId,
		tone,
		toneStyles,
		type Tone,
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

	// The plan reads the same filter as the list did, so a chip narrows the drawing
	// instead of hiding it behind a second control. A floor with nothing left in
	// view is dropped rather than drawn empty.
	const plans = $derived(plan(units, matches));

	// Only the colours actually on screen, in a fixed order, so the plan explains
	// itself without a key of colours the reader cannot see.
	const legend = $derived(
		(['arrears', 'formk', 'short-term', 'levy', 'vacant', 'tenant', 'owner'] as Tone[])
			.filter((id) => visible.some((unit) => tone(unit) === id))
			.map((id) => ({ id, ...toneStyles[id] }))
	);

	function choose(id: string) {
		selectedId = id;
		payerUnitId.set(id);
	}

	const filters = $derived([
		['all', $copy.unitsFilterAll],
		['arrears', $copy.unitsFilterArrears],
		['formk', $copy.unitsFilterFormK],
		['levy', $copy.unitsFilterLevy],
		['withheld', $copy.unitsFilterWithheld],
		['vacant', $copy.unitsFilterVacant],
		['short-term', $copy.unitsFilterShortTerm]
	] as const);

	const occupancyLabel = $derived(
		selected.occupancy === 'owner'
			? $copy.unitsOccOwner
			: selected.occupancy === 'vacant'
				? $copy.unitsOccVacant
				: selected.occupancy === 'short-term'
					? $copy.unitsOccShortTerm
					: selected.occupancy
	);
</script>

<svelte:head>
	<title>{$copy.unitsPageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker={fill($copy.unitsKicker, { lots: headcount.lots, floors: building.floors })}
		title={$copy.unitsTitle}
		lede={$copy.unitsLede}
	/>

	<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
		<input
			bind:value={query}
			placeholder={$copy.unitsSearchPlaceholder}
			aria-label={$copy.unitsSearchLabel}
			class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm sm:max-w-xs"
		/>
		<div class="flex gap-1 overflow-x-auto">
			{#each [1, 2, 3, 4] as level}
				<button
					class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold {floor === level ? 'bg-slab text-slab-ink' : 'bg-surface-2 border border-border text-slate-600'}"
					onclick={() => (floor = floor === level ? 'all' : level)}
				>{fill($copy.unitsFloor, { n: level })}</button>
			{/each}
		</div>
	</div>
	<div class="mb-6 flex gap-1 overflow-x-auto">
		{#each filters as [id, label]}
			<button
				class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold {focus === id ? 'bg-brand-600 text-white' : 'bg-surface-2 border border-border text-slate-600'}"
				onclick={() => (focus = id)}
			>{label}</button>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_340px]">
		<!-- min-w-0 lets the plan's own scroller do the scrolling: a grid item defaults
		     to min-width auto, so without it the 460px row would push the page wide. -->
		<div class="min-w-0 space-y-3">
			<p class="text-sm leading-relaxed text-slate-600">{$copy.unitsPlanHint}</p>
			{#if legend.length > 0}
				<div class="flex flex-wrap gap-1.5">
					{#each legend as item (item.id)}
						<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold {item.pill}"> {item.label}</span>
					{/each}
				</div>
			{/if}
			{#each plans as level (level.floor)}
				<div class="rounded-2xl border border-border bg-surface-2 p-3">
					<p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
						{fill($copy.unitsPlanLine, {
							n: level.floor,
							lots: level.lots,
							sqft: formatNumber(level.sqft)
						})}
					</p>
					<!-- Scrolls inside its own band rather than squeezing ten lots into a
					     phone: 460px keeps the smallest studio wide enough for its number. -->
					<div class="overflow-x-auto pb-1">
						<div class="min-w-[460px]">
							{#each level.rows as row, rowIndex (row.side)}
								{#if rowIndex === 1}
									<div
										class="flex h-5 items-center gap-2 border-y border-dashed border-border bg-slate-50 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
										aria-hidden="true"
									>
										<span>{$copy.unitsPlanCorridor}</span>
										<span class="flex-1 border-t border-dashed border-slate-300"></span>
										<span>⇅</span>
									</div>
								{/if}
								<div class="flex">
									{#each row.units as unit, index (unit.id)}
										<button
											class="relative border px-2 py-1.5 text-left {toneStyles[tone(unit)].cell} {selectedId === unit.id
												? 'z-10 ring-2 ring-brand-600 ring-inset'
												: ''}"
											style="width: {row.shares[index]}%"
											aria-pressed={selectedId === unit.id}
											aria-label={fill($copy.unitsPlanLotAria, {
												lot: unit.id,
												owner: unit.owner,
												sqft: unit.sqft
											})}
											onclick={() => choose(unit.id)}
										>
											<span class="block text-sm font-bold leading-tight">{unit.id}</span>
											<span class="block text-[10px] leading-tight tabular-nums opacity-70"
												>{formatNumber(unit.sqft)} sqft</span
											>
											<span class="mt-0.5 block text-[10px] leading-snug line-clamp-2">{unit.owner}</span>
										</button>
									{/each}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
			{#if visible.length === 0}
				<p class="rounded-2xl border border-dashed border-border p-6 text-sm text-slate-500">{$copy.unitsNoMatch}</p>
			{/if}
		</div>

		<aside class="h-fit rounded-2xl border border-border bg-surface-2 p-5 lg:sticky lg:top-36">
			<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{fill($copy.unitsLotHeading, { lot: selected.id, n: selected.lot })}</p>
			<h2 class="mt-1 text-2xl font-bold text-slate-900">{selected.owner}</h2>
			<p class="text-sm text-slate-500">{fill($copy.unitsSpec, { type: selected.type, sqft: selected.sqft, floor: selected.floor })}</p>
			{#if selected.role}
				<p class="mt-2 text-sm font-semibold text-brand-700">{selected.role}</p>
			{/if}

			<dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div>
					<dt class="text-xs text-slate-400">{$copy.unitsMonthlyFee}</dt>
					<dd class="font-semibold tabular-nums">{money(due.fee)}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-400">{$copy.unitsToClear}</dt>
					<dd class="font-semibold tabular-nums">{money(due.total)}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-400">{$copy.unitsEntitlement}</dt>
					<dd class="font-semibold tabular-nums">{fill($copy.unitsPoints, { n: selected.entitlement })}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-400">{$copy.accColFormF}</dt>
					<dd class="font-semibold {formF(selected) === 'withheld' ? 'text-rose-700' : 'text-emerald-700'}">{formF(selected)}</dd>
				</div>
			</dl>

			<ul class="mt-4 space-y-1 text-sm text-slate-600">
				<li>{selected.prepaidOctober ? $copy.unitsOctoberPaid : fill($copy.unitsOctoberDue, { amount: money(due.october) })}</li>
				<li>{selected.feeArrearsMonths
					? fill($copy.unitsFeesBehindMonths, { amount: money(due.arrears), n: selected.feeArrearsMonths })
					: fill($copy.unitsFeesBehind, { amount: money(due.arrears) })}</li>
				<li>{fill($copy.unitsLateFees, { amount: money(due.late) })}</li>
				<li>{fill($copy.unitsFines, { amount: money(due.fine) })}</li>
				<li>{fill($copy.unitsLevyOwing, { amount: money(due.levy) })}</li>
				<li>{fill($copy.unitsFeeSplit, { operating: money(due.operatingPart), crf: money(due.crfPart) })}</li>
			</ul>

			<div class="mt-4 space-y-2 text-sm text-slate-600">
				<p><span class="font-semibold text-slate-800">{$copy.unitsLives}</span> {occupancyLabel}{selected.tenant ? ` — ${selected.tenant}` : ''}{selected.tenantSince ? ` ${fill($copy.unitsTenantSince, { date: selected.tenantSince })}` : ''}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsOwnerIsIn}</span> {selected.ownerLives}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsFormK}</span> {selected.formK}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsPaysBy}</span> {selected.payMethod}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsParking}</span> {selected.parking.join(', ')} · {selected.locker}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsPets}</span> {selected.pets}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsEv}</span> {selected.ev ? $copy.unitsEvYes : $copy.unitsEvNo}</p>
				<p class="text-xs text-slate-400">{selected.email} · {selected.phone}</p>
			</div>

			<div class="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
				<p><span class="font-semibold text-slate-800">{$copy.unitsEht}</span> {selected.eht}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsSvt}</span> {selected.svt}</p>
				<p><span class="font-semibold text-slate-800">{$copy.unitsUht}</span> {selected.uht}</p>
			</div>

			<p class="mt-4 text-sm leading-relaxed text-slate-700">{selected.notes}</p>

			{#if selected.id === '201'}
				<p class="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{fill($copy.unitsFormBNote, { requested: 'September 28', due: 'October 5' })}</p>
			{/if}

			<a
				href="/pay?unit={selected.id}"
				class="mt-4 flex items-center justify-center rounded-xl bg-slab px-4 py-3 text-sm font-bold text-slab-ink no-underline transition-colors hover:bg-slab-raised"
				onclick={() => payerUnitId.set(selected.id)}
			>
				{$copy.unitsPayThisLot}
			</a>
			<a
				href="/units/{selected.id}"
				class="mt-2 flex items-center justify-center rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline"
			>
				{$copy.lotSheetOpen}
			</a>
		</aside>
	</div>
</div>
