<script lang="ts">
	import { donateInfo } from '$lib/data';
	import Icon from './Icon.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let tab: 'btc' | 'ln' = $state('btc');
	let copied = $state(false);
	let btcRate = $state(98420);
	let cadRate = $state(1.38);

	$effect(() => {
		if (!open) return;
		const interval = setInterval(() => {
			btcRate += (Math.random() - 0.5) * 120;
			cadRate = 1.35 + Math.random() * 0.08;
		}, 3000);
		return () => clearInterval(interval);
	});

	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm"
		onclick={close}
		role="presentation"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="relative w-full max-w-md rounded-2xl glass-card p-6 animate-slide-up shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="donate-title"
			aria-modal="true"
			tabindex="-1"
		>
			<button
				class="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
				onclick={close}
				aria-label="Close"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
			</button>

			<div class="flex items-center gap-3 mb-6">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-bitcoin/10 text-bitcoin">
					<Icon name="bitcoin" class="h-7 w-7" />
				</div>
				<div>
					<h2 id="donate-title" class="text-xl font-bold text-slate-800">Sovereign Donations</h2>
					<p class="text-sm text-slate-500">Support Hermes Strata development</p>
				</div>
			</div>

			<div class="flex rounded-xl bg-slate-100 p-1 mb-6">
				<button
					class="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all
						{tab === 'btc' ? 'bg-white text-bitcoin shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
					onclick={() => (tab = 'btc')}
				>
					<Icon name="bitcoin" class="h-4 w-4" />
					Bitcoin
				</button>
				<button
					class="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all
						{tab === 'ln' ? 'bg-white text-lightning shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
					onclick={() => (tab = 'ln')}
				>
					<Icon name="lightning" class="h-4 w-4" />
					Lightning
				</button>
			</div>

			<div class="rounded-xl border border-border bg-surface-3 p-4 mb-4">
				<div class="flex justify-between text-xs text-slate-500 mb-1">
					<span>Live BTC/CAD</span>
					<span class="live-dot flex items-center gap-1">
						<span class="h-1.5 w-1.5 rounded-full bg-success"></span>
						Real-time
					</span>
				</div>
				<div class="text-2xl font-bold text-slate-800 stat-flash">
					${(btcRate * cadRate).toLocaleString('en-CA', { maximumFractionDigits: 0 })}
					<span class="text-sm font-normal text-slate-400">CAD</span>
				</div>
				<div class="text-xs text-slate-400 mt-1">₿{btcRate.toLocaleString('en-CA', { maximumFractionDigits: 0 })} USD · 1 CAD = {(1 / cadRate).toFixed(4)} USD</div>
			</div>

			{#if tab === 'btc'}
				<div class="space-y-4">
					<div class="flex justify-center">
						<div class="rounded-xl border-2 border-dashed border-slate-200 bg-white p-4">
							<svg viewBox="0 0 100 100" class="h-32 w-32">
								<rect width="100" height="100" fill="white"/>
								{#each Array(8) as _, row}
									{#each Array(8) as _, col}
										{@const on = (row * 8 + col + row) % 3 !== 0}
										{#if on}
											<rect x={10 + col * 10} y={10 + row * 10} width="8" height="8" fill="#1e293b" rx="1"/>
										{/if}
									{/each}
								{/each}
								<rect x="35" y="35" width="30" height="30" rx="4" fill="#f7931a"/>
							</svg>
						</div>
					</div>
					<div>
						<span class="text-xs font-medium text-slate-500 uppercase tracking-wide">On-chain Address</span>
						<div class="mt-1.5 flex gap-2">
							<code class="flex-1 rounded-lg bg-slate-100 px-3 py-2.5 text-xs text-slate-700 break-all font-mono">
								{donateInfo.bitcoin}
							</code>
							<button
								class="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
								onclick={() => copy(donateInfo.bitcoin)}
							>
								{copied ? '✓' : 'Copy'}
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="space-y-4">
					<div class="flex justify-center">
						<div class="rounded-xl border-2 border-lightning/30 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
							<svg viewBox="0 0 100 100" class="h-32 w-32">
								<rect width="100" height="100" fill="#fffbeb"/>
								{#each Array(10) as _, row}
									{#each Array(10) as _, col}
										{@const on = (row * 3 + col * 7) % 5 < 3}
										{#if on}
											<rect x={5 + col * 9} y={5 + row * 9} width="7" height="7" fill="#1e293b" rx="1"/>
										{/if}
									{/each}
								{/each}
								<rect x="38" y="38" width="24" height="24" rx="3" fill="#fbbf24"/>
								<path d="M48 42 L44 56 H50 L46 68 L56 50 H50 Z" fill="white"/>
							</svg>
						</div>
					</div>
					<p class="text-center text-sm text-slate-600">
						Scan with any Lightning wallet · 15-min CAD rate lock
					</p>
					<div>
						<span class="text-xs font-medium text-slate-500 uppercase tracking-wide">LNURL</span>
						<div class="mt-1.5 flex gap-2">
							<code class="flex-1 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-slate-700 break-all font-mono border border-amber-200">
								{donateInfo.lightning}
							</code>
							<button
								class="shrink-0 rounded-lg bg-lightning px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
								onclick={() => copy(donateInfo.lightning)}
							>
								{copied ? '✓' : 'Copy'}
							</button>
						</div>
					</div>
				</div>
			{/if}

			<p class="mt-6 text-center text-xs text-slate-400">
				Questions? <a href="mailto:hello@giveabit.io" class="text-brand-600 hover:underline">hello@giveabit.io</a>
			</p>
		</div>
	</div>
{/if}