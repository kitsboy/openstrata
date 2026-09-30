<script lang="ts">
	import { payerUnitId } from '$lib/demo/payer';
	import { balance, building, getUnit } from '$lib/demo/building';
	import { money } from '$lib/demo/format';
	import Icon from './Icon.svelte';

	const unit = $derived(getUnit($payerUnitId));
	const due = $derived(balance(unit));
	const pastDue = $derived(due.arrears + due.late + due.fine + due.levy > 0);
</script>

<div class="border-t border-slate-800 bg-slate-900 text-white">
	<div class="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
		<span class="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Pay fees</span>
		<a href="/pay?unit={unit.id}" class="shrink-0 text-sm font-semibold text-white no-underline hover:text-brand-200">
			Lot {unit.id}
			<span class="text-white/50">·</span>
			{due.total === 0 ? 'October is paid' : money(due.total)}
			<span class="font-normal text-white/50">{pastDue ? 'to clear the lot' : due.total === 0 ? '' : 'due Oct 1'}</span>
		</a>
		<a
			href="/pay?unit={unit.id}&rail=etransfer"
			class="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white no-underline hover:bg-white/15"
		>E-transfer</a>
		<a
			href="/pay?unit={unit.id}&rail=bitcoin"
			class="inline-flex shrink-0 items-center gap-1 rounded-full bg-bitcoin/20 px-3 py-1 text-xs font-semibold text-bitcoin no-underline hover:bg-bitcoin/30"
		>
			<Icon name="bitcoin" class="h-3.5 w-3.5" />
			Bitcoin
		</a>
		<a
			href="/pay?unit={unit.id}&rail=lightning"
			class="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-200 no-underline hover:bg-amber-300/25"
		>
			<Icon name="lightning" class="h-3.5 w-3.5" />
			Lightning
		</a>
		<span class="shrink-0 text-[10px] text-white/35">{building.plan} · demo invoices, do not send funds</span>
	</div>
</div>
