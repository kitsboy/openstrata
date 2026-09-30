<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import {
		categoryMeta,
		eventsInMonth,
		eventsOn,
		highlightDates,
		monthGrid,
		weekdayLabels,
		type CalCategory
	} from '$lib/demo/schedule';

	let year = $state(2026);
	let month = $state(9);
	let selected = $state('2026-09-30');
	let filter = $state<'all' | CalCategory>('all');

	const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const grid = $derived(monthGrid(year, month));
	const monthEvents = $derived(eventsInMonth(year, month).filter((event) => filter === 'all' || event.category === filter));
	const dayEvents = $derived(eventsOn(selected).filter((event) => filter === 'all' || event.category === filter));

	function shift(delta: number) {
		const next = new Date(year, month - 1 + delta, 1);
		year = next.getFullYear();
		month = next.getMonth() + 1;
		selected = `${year}-${String(month).padStart(2, '0')}-01`;
	}

	function jump(date: string) {
		const [y, m] = date.split('-').map(Number);
		year = y;
		month = m;
		selected = date;
	}

	const categories = Object.entries(categoryMeta) as Array<[CalCategory, (typeof categoryMeta)[CalCategory]]>;
</script>

<svelte:head>
	<title>Calendar — Evergreen House</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="April 2026 through the May 2027 AGM"
		title="Calendar"
		lede="Fees on the 1st, council on the third Tuesday, CRA dates on the day they actually fall, and the inspections that keep Form B boring. September 30 is today in this sample."
	/>

	<div class="mb-4 flex gap-2 overflow-x-auto">
		{#each highlightDates as item}
			<button class="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600" onclick={() => jump(item.date)}>
				{item.label}
			</button>
		{/each}
	</div>

	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<button class="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold" onclick={() => shift(-1)}>Previous</button>
			<h2 class="min-w-40 text-center text-lg font-bold text-slate-900">{names[month - 1]} {year}</h2>
			<button class="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold" onclick={() => shift(1)}>Next</button>
		</div>
		<div class="flex gap-1 overflow-x-auto">
			<button class="rounded-full px-3 py-1 text-xs font-semibold {filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-border'}" onclick={() => (filter = 'all')}>All</button>
			{#each categories as [id, meta]}
				<button class="rounded-full px-3 py-1 text-xs font-semibold {filter === id ? 'bg-slate-900 text-white' : 'bg-white border border-border text-slate-600'}" onclick={() => (filter = id)}>
					{meta.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
		<div class="rounded-2xl border border-border bg-white p-3 sm:p-4">
			<div class="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
				{#each weekdayLabels as day}
					<div class="py-1">{day}</div>
				{/each}
			</div>
			<div class="mt-1 grid grid-cols-7 gap-1">
				{#each grid as cell}
					<button
						class="min-h-16 rounded-lg border p-1 text-left {cell.inMonth ? 'bg-white' : 'bg-slate-50 text-slate-300'} {selected === cell.date ? 'border-slate-900 ring-1 ring-slate-900' : 'border-transparent'}"
						onclick={() => (selected = cell.date)}
					>
						<span class="text-xs font-semibold {cell.date === '2026-09-30' ? 'text-rose-600' : ''}">{Number(cell.date.slice(-2))}</span>
						<div class="mt-1 flex flex-wrap gap-0.5">
							{#each eventsOn(cell.date).slice(0, 3) as event}
								<span class="h-1.5 w-1.5 rounded-full {categoryMeta[event.category].dot}"></span>
							{/each}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div>
			<h2 class="font-bold text-slate-900">{selected}</h2>
			{#if dayEvents.length === 0}
				<p class="mt-2 text-sm text-slate-500">Nothing dated. Fees, if this is another month’s 1st, show when that month is open.</p>
			{/if}
			<ul class="mt-3 space-y-3">
				{#each dayEvents as event}
					<li class="rounded-2xl border border-border bg-white p-4">
						<span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase {categoryMeta[event.category].pill}">{categoryMeta[event.category].label}</span>
						<p class="mt-2 font-semibold text-slate-900">{event.title}</p>
						<p class="mt-1 text-sm leading-relaxed text-slate-600">{event.detail}</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<section class="mt-8">
		<h2 class="font-bold text-slate-900">Everything in {names[month - 1]}</h2>
		<ul class="mt-3 divide-y divide-border rounded-2xl border border-border bg-white">
			{#each monthEvents as event}
				<li>
					<button class="flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50" onclick={() => (selected = event.date)}>
						<span class="w-24 shrink-0 text-sm font-semibold tabular-nums text-slate-500">{event.date.slice(5)}</span>
						<span>
							<span class="block text-sm font-semibold text-slate-900">{event.title}</span>
							<span class="block text-xs text-slate-500">{categoryMeta[event.category].label}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</section>
</div>
