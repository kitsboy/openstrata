<script lang="ts">
	import '../app.css';
	import { navItems, socialLinks } from '$lib/nav';
	import { page } from '$app/stores';
	import { jurisdictions } from '$lib/data';
	import Icon from '$lib/components/Icon.svelte';
	import JobsDropdown from '$lib/components/JobsDropdown.svelte';
	import DonateModal from '$lib/components/DonateModal.svelte';

	let { children } = $props();
	const currentYear = new Date().getFullYear();
	let donateOpen = $state(false);
	let mobileNavOpen = $state(false);
	let selectedJurisdiction = $state('BC');
</script>

<div class="flex min-h-screen flex-col mesh-bg">
	<header class="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
		<nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
			<a href="/" class="flex items-center gap-3 no-underline group">
				<img
					src="/logo.png"
					alt="Hermes Strata"
					class="h-10 w-10 rounded-lg object-cover shadow-md shadow-black/10 group-hover:shadow-lg transition-shadow"
				/>
				<div>
					<span class="block text-lg font-bold tracking-tight text-slate-800 group-hover:text-brand-700 transition-colors">
						Hermes Strata
					</span>
					<span class="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
						OpenStrata · Give A Bit
					</span>
				</div>
			</a>

			<div class="hidden lg:flex items-center gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="rounded-lg px-3.5 py-2 text-sm font-medium no-underline transition-colors
							{$page.url.pathname === item.href
								? 'bg-brand-50 text-brand-700'
								: 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'}"
					>
						{item.label}
					</a>
				{/each}
			</div>

			<div class="flex items-center gap-3">
				<select
					bind:value={selectedJurisdiction}
					class="hidden sm:block rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
					aria-label="Jurisdiction"
				>
					{#each jurisdictions as j}
						<option value={j.code} disabled={!j.active}>
							{j.flag} {j.code}{!j.active ? ' (soon)' : ''}
						</option>
					{/each}
				</select>

				<button
					class="hidden sm:flex items-center gap-1.5 rounded-lg bg-bitcoin/10 px-3.5 py-2 text-sm font-semibold text-bitcoin hover:bg-bitcoin/20 transition-colors"
					onclick={() => (donateOpen = true)}
				>
					<Icon name="lightning" class="h-4 w-4" />
					Donate
				</button>

				<button
					class="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
					onclick={() => (mobileNavOpen = !mobileNavOpen)}
					aria-label="Toggle menu"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if mobileNavOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
						{/if}
					</svg>
				</button>
			</div>
		</nav>

		{#if mobileNavOpen}
			<div class="lg:hidden border-t border-border bg-white px-6 py-4 space-y-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="block rounded-lg px-4 py-2.5 text-sm font-medium no-underline
							{$page.url.pathname === item.href ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}"
						onclick={() => (mobileNavOpen = false)}
					>
						{item.label}
					</a>
				{/each}
				<button
					class="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-bitcoin/10 px-4 py-2.5 text-sm font-semibold text-bitcoin"
					onclick={() => { donateOpen = true; mobileNavOpen = false; }}
				>
					<Icon name="lightning" class="h-4 w-4" />
					Donate BTC/LN
				</button>
			</div>
		{/if}
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-border bg-white">
		<div class="mx-auto max-w-7xl px-6 py-14">
			<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
				<div class="lg:col-span-1">
					<div class="flex items-center gap-3 mb-4">
						<img
							src="/logo.png"
							alt="Hermes Strata"
							class="h-10 w-10 rounded-lg object-cover shadow-sm"
						/>
						<span class="font-bold text-slate-800">Hermes Strata</span>
					</div>
					<p class="text-sm text-slate-500 leading-relaxed">
						Sovereign strata corporation management for BC, Canada, and beyond.
						Bitcoin treasury rails. Local-first compliance.
					</p>
					<div class="mt-5 flex items-center gap-3">
						{#each socialLinks as link}
							<a
								href={link.href}
								class="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-slate-500 no-underline hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
								target={link.href.startsWith('http') ? '_blank' : undefined}
								rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
								aria-label={link.label}
								title={link.label}
							>
								<Icon name={link.icon} class="h-4 w-4" />
							</a>
						{/each}
					</div>
				</div>

				<div>
					<h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Platform</h4>
					<ul class="space-y-2.5">
						{#each navItems as item}
							<li>
								<a href={item.href} class="text-sm text-slate-500 no-underline hover:text-brand-600 transition-colors">
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Jurisdictions</h4>
					<ul class="space-y-2.5">
						{#each jurisdictions as j}
							<li class="flex items-center gap-2 text-sm {j.active ? 'text-slate-600' : 'text-slate-400'}">
								<span>{j.flag}</span>
								<span>{j.name}</span>
								{#if j.active}
									<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">Live</span>
								{:else}
									<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">Soon</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Get Involved</h4>
					<div class="space-y-4">
						<JobsDropdown />
						<button
							class="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-bitcoin/30 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-semibold text-bitcoin hover:border-bitcoin/50 transition-all"
							onclick={() => (donateOpen = true)}
						>
							<Icon name="bitcoin" class="h-4 w-4" />
							<Icon name="lightning" class="h-4 w-4" />
							Bitcoin & Lightning Donations
						</button>
						<a
							href="mailto:hello@giveabit.io"
							class="flex items-center gap-2 text-sm text-slate-500 no-underline hover:text-brand-600 transition-colors"
						>
							<Icon name="mail" class="h-4 w-4" />
							hello@giveabit.io
						</a>
					</div>
				</div>
			</div>

			<div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
				<p class="text-xs text-slate-400">
					&copy; {currentYear} Give A Bit — Bitcoin Sovereignty First · Hermes Strata Framework v2
				</p>
				<p class="text-xs text-slate-400 text-center sm:text-right max-w-md">
					BC-first MVP. Config-driven expansion to ON, AB, US states, and EU markets.
					Languages: EN · FR · ES · ZH · PT · DE · SW · HI · AR
				</p>
			</div>
		</div>
	</footer>
</div>

<DonateModal bind:open={donateOpen} />