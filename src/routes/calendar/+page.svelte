<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Next30 from '$lib/components/Next30.svelte';
	import YearCalendarSheet from '$lib/components/YearCalendar.svelte';
	import RenewalCalendarSheet from '$lib/components/RenewalCalendarSheet.svelte';
	import { renewalYear } from '$lib/demo/renewals';
	import {
		categoryMeta,
		events,
		eventsInMonth,
		eventsOn,
		highlightDates,
		monthGrid,
		type CalCategory
	} from '$lib/demo/schedule';
	import { yearCalendar } from '$lib/year-calendar';
	import { building } from '$lib/demo/building';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';

	let year = $state(2026);
	let month = $state(9);
	let selected = $state('2026-09-30');
	let filter = $state<'all' | CalCategory>('all');

	/**
	 * The year on one sheet, built from the same schedule this page draws month by
	 * month. The fiscal year comes from the building's own record, not from the
	 * month currently open, so paging through the calendar never changes the paper.
	 */
	const fiscalStartYear = Number(building.fiscalStart.slice(0, 4));
	const yearSheet = yearCalendar(fiscalStartYear, events);

	/**
	 * The renewals the registers already carry dates for, behind a button. One
	 * printed artifact at a time: opening the renewal sheet takes the year calendar
	 * off the paper rather than printing two sheets from one press.
	 */
	const renewalSheet = renewalYear(building.asOf);
	let renewalsOpen = $state(false);

	/** Month names and weekday heads come from Intl, not a hard-coded list. */
	const monthName = $derived(
		formatDate(`${year}-${String(month).padStart(2, '0')}-01`, $locale, { month: 'long' })
	);
	const weekdayHeads = $derived(
		Array.from({ length: 7 }, (_, i) =>
			formatDate(new Date(2026, 8, 6 + i), $locale, { weekday: 'narrow' })
		)
	);
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

	const categoryLabel = $derived<Record<CalCategory, string>>({
		fees: $copy.calCatFees,
		council: $copy.calCatCouncil,
		cra: $copy.calCatCra,
		'bc-tax': $copy.calCatBcTax,
		maintenance: $copy.calCatMaintenance,
		insurance: $copy.calCatInsurance,
		compliance: $copy.calCatCompliance,
		payroll: $copy.calCatPayroll
	});

	const categories = Object.entries(categoryMeta) as Array<[CalCategory, (typeof categoryMeta)[CalCategory]]>;
</script>

<svelte:head>
	<title>{$copy.calPageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 print:px-0 print:py-0">
	<!-- The month view is what the reader works in; the year sheet below is the
	     page's one printed artifact, so everything above it carries `no-print`. -->
	<div class="no-print">
	<PageHeader kicker={$copy.calKicker} title={$copy.calHeading} lede={$copy.calLede} />

	<Next30 />

	<div class="mb-4 flex gap-2 overflow-x-auto">
		{#each highlightDates as item}
			<button class="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-slate-600" onclick={() => jump(item.date)}>
				{item.label}
			</button>
		{/each}
	</div>

	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<button class="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold" onclick={() => shift(-1)}>{$copy.calPrevious}</button>
			<h2 class="min-w-40 text-center text-lg font-bold text-slate-900">{monthName} {formatNumber(year, $locale, { useGrouping: false })}</h2>
			<button class="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold" onclick={() => shift(1)}>{$copy.calNext}</button>
		</div>
		<div class="flex gap-1 overflow-x-auto">
			<button class="rounded-full px-3 py-1 text-xs font-semibold {filter === 'all' ? 'bg-slab text-slab-ink' : 'bg-surface-2 border border-border'}" onclick={() => (filter = 'all')}>{$copy.calAllDates}</button>
			{#each categories as [id, meta]}
				<button class="rounded-full px-3 py-1 text-xs font-semibold {filter === id ? 'bg-slab text-slab-ink' : 'bg-surface-2 border border-border text-slate-600'}" onclick={() => (filter = id)}>
					{categoryLabel[id]}
				</button>
			{/each}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
		<div class="rounded-2xl border border-border bg-surface-2 p-3 sm:p-4">
			<div class="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
				{#each weekdayHeads as day}
					<div class="py-1">{day}</div>
				{/each}
			</div>
			<div class="mt-1 grid grid-cols-7 gap-1">
				{#each grid as cell}
					<button
						class="min-h-16 rounded-lg border p-1 text-left {cell.inMonth ? 'bg-surface-2' : 'bg-slate-50 text-slate-400'} {selected === cell.date ? 'border-slate-900 ring-1 ring-slate-900' : 'border-transparent'}"
						onclick={() => (selected = cell.date)}
					>
						<span class="text-xs font-semibold {cell.date === '2026-09-30' ? 'text-rose-600' : ''}">{formatNumber(Number(cell.date.slice(-2)), $locale, { useGrouping: false })}</span>
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
			<h2 class="font-bold text-slate-900">{formatDate(selected, $locale, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
			{#if dayEvents.length === 0}
				<p class="mt-2 text-sm text-slate-500">{$copy.calNothingDated}</p>
			{/if}
			<ul class="mt-3 space-y-3">
				{#each dayEvents as event}
					<li class="rounded-2xl border border-border bg-surface-2 p-4">
						<span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase {categoryMeta[event.category].pill}">{categoryLabel[event.category]}</span>
						<p class="mt-2 font-semibold text-slate-900">{event.title}</p>
						<p class="mt-1 text-sm leading-relaxed text-slate-600">{event.detail}</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<section class="mt-8">
		<h2 class="font-bold text-slate-900">{fill($copy.calEverythingIn, { month: monthName })}</h2>
		<ul class="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface-2">
			{#each monthEvents as event}
				<li>
					<button class="flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50" onclick={() => (selected = event.date)}>
						<span class="w-24 shrink-0 text-sm font-semibold tabular-nums text-slate-500">{formatDate(event.date, $locale, { month: 'short', day: 'numeric' })}</span>
						<span>
							<span class="block text-sm font-semibold text-slate-900">{event.title}</span>
							<span class="block text-xs text-slate-500">{categoryLabel[event.category]}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</section>
	</div>

	<section class="mt-10 print:mt-0" aria-labelledby="year-cal-heading">
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3 no-print">
			<div>
				<h2 id="year-cal-heading" class="text-xl font-bold text-slate-900">{$copy.yearCalHeading}</h2>
				<p class="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{$copy.yearCalLede}</p>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				{#if renewalsOpen}
					<button
						class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
						onclick={() => (renewalsOpen = false)}>{$copy.renewalCalHide}</button
					>
					<button
						class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
						onclick={() => window.print()}>{$copy.renewalCalPrint}</button
					>
				{:else}
					<button
						class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
						onclick={() => (renewalsOpen = true)}>{$copy.renewalCalShow}</button
					>
					<button
						class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
						onclick={() => window.print()}>{$copy.yearCalPrint}</button
					>
				{/if}
				<span class="text-xs text-slate-500">
					{renewalsOpen ? $copy.renewalCalPrintNote : $copy.yearCalPrintNote}
				</span>
			</div>
		</div>
		{#if renewalsOpen}
			<p class="mb-4 max-w-3xl text-sm leading-relaxed text-slate-600 no-print">{$copy.renewalCalLede}</p>
			<RenewalCalendarSheet calendar={renewalSheet} />
		{:else}
			<YearCalendarSheet calendar={yearSheet} />
		{/if}
	</section>
</div>
