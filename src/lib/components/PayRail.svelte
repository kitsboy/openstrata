<script lang="ts">
	/**
	 * The pay dock. It sits under the topbar on every page and it is the one
	 * piece of chrome whose whole job is to answer "what do I owe, and how do I
	 * pay it" — so the amount leads and the rails follow.
	 *
	 * Everything here is painted from the `slab` role tokens rather than from
	 * `bg-slate-900` + `text-white`. That was the bug a reader hit: the dark
	 * theme remaps the slate ramp so `slate-900` becomes #f1f5f9 (which is what
	 * keeps ink readable on dark paper), so as a FILL it turned this bar
	 * near-white under a white label — 1.05:1, an invisible dock. The slab is a
	 * role, not a ramp step, so it cannot be flipped by accident, and every ink
	 * used on it (`slab-ink`, `slab-muted`, `slab-faint`, `slab-accent`) is a
	 * pair scripts/audit-contrast.mjs holds to 4.5:1 in both themes.
	 *
	 * The faint micro-copy is `text-slab-faint`, not `text-white/35`: an
	 * opacity-modified white is colour-mixed toward transparent, which moves it
	 * off the token entirely — it measured 3.1:1 at 10px.
	 */
	import { payerUnitId } from '$lib/demo/payer';
	import { balance, building, getUnit } from '$lib/demo/building';
	import { money } from '$lib/demo/format';
	import Icon from './Icon.svelte';

	const unit = $derived(getUnit($payerUnitId));
	const due = $derived(balance(unit));
	const pastDue = $derived(due.arrears + due.late + due.fine + due.levy > 0);
	const settled = $derived(due.total === 0);
</script>

<div class="border-t border-slab-line bg-slab text-slab-ink">
	<div class="slab-scroll mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2 sm:px-6">
		<span class="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slab-faint">Pay fees</span>

		<a
			href="/pay?unit={unit.id}"
			class="flex shrink-0 items-baseline gap-2 text-slab-ink no-underline hover:underline"
		>
			<span class="text-xs font-semibold text-slab-muted">Lot {unit.id}</span>
			<span class="text-lg font-extrabold leading-none tabular-nums">
				{settled ? 'October is paid' : money(due.total)}
			</span>
		</a>

		{#if settled}
			<span class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
				Nothing outstanding
			</span>
		{:else}
			<span
				class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold {pastDue
					? 'bg-rose-50 text-rose-950'
					: 'bg-slab-raised text-slab-muted'}"
			>
				{pastDue ? 'Arrears on this lot' : 'Due Oct 1'}
			</span>
		{/if}

		<span class="h-5 w-px shrink-0 bg-slab-line" aria-hidden="true"></span>

		<nav class="flex shrink-0 items-center gap-1.5" aria-label="Pay this lot">
			<a
				href="/pay?unit={unit.id}&rail=etransfer"
				class="rounded-full bg-slab-raised px-3 py-1.5 text-xs font-semibold text-slab-ink no-underline transition-colors hover:bg-slab-line"
			>E-transfer</a>
			<a
				href="/pay?unit={unit.id}&rail=bitcoin"
				class="inline-flex items-center gap-1 rounded-full bg-slab-raised px-3 py-1.5 text-xs font-semibold text-slab-ink no-underline transition-colors hover:bg-slab-line"
			>
				<Icon name="bitcoin" class="h-3.5 w-3.5 text-slab-accent" />
				Bitcoin
			</a>
			<a
				href="/pay?unit={unit.id}&rail=lightning"
				class="inline-flex items-center gap-1 rounded-full bg-slab-raised px-3 py-1.5 text-xs font-semibold text-slab-ink no-underline transition-colors hover:bg-slab-line"
			>
				<Icon name="lightning" class="h-3.5 w-3.5 text-slab-accent" />
				Lightning
			</a>
		</nav>

		<a
			href="/pay?unit={unit.id}"
			class="ml-auto shrink-0 rounded-full bg-slab-raised px-3 py-1.5 text-xs font-bold text-slab-ink no-underline transition-colors hover:bg-slab-line"
		>Pay this lot</a>

		<span
			class="shrink-0 rounded-full bg-slab-raised px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slab-muted"
		>
			{building.plan} · demo invoices, do not send funds
		</span>
	</div>
</div>
