<script lang="ts">
	import { jobCategories } from '$lib/data';

	let open = $state(false);
	let activeCategory = $state(jobCategories[0].id);

	const activeJobs = $derived(
		jobCategories.find((c) => c.id === activeCategory)?.jobs ?? []
	);

	function toggle() {
		open = !open;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-jobs-dropdown]')) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative" data-jobs-dropdown>
	<button
		class="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-brand-300 hover:text-brand-700 transition-all"
		onclick={toggle}
		aria-expanded={open}
		aria-haspopup="true"
	>
		<svg class="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
		</svg>
		Careers
		<svg class="h-4 w-4 transition-transform {open ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
		</svg>
	</button>

	{#if open}
		<div
			class="absolute bottom-full left-0 mb-2 w-[min(520px,calc(100vw-2rem))] rounded-2xl glass-card shadow-2xl overflow-hidden animate-slide-up z-50"
			role="menu"
		>
			<div class="bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-4 text-white">
				<h3 class="font-bold text-lg">Join the Hermes Team</h3>
				<p class="text-sm text-brand-100 mt-0.5">Building sovereign strata infrastructure for BC and beyond</p>
			</div>

			<div class="flex border-b border-border">
				{#each jobCategories as cat}
					<button
						class="flex-1 px-3 py-3 text-xs font-semibold transition-colors border-b-2
							{activeCategory === cat.id
								? 'border-brand-500 text-brand-700 bg-brand-50'
								: 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}"
						onclick={() => (activeCategory = cat.id)}
						role="menuitem"
					>
						{cat.label}
					</button>
				{/each}
			</div>

			<div class="max-h-72 overflow-y-auto p-2">
				{#each activeJobs as job}
					<a
						href="mailto:hello@giveabit.io?subject=Application: {encodeURIComponent(job.title)}"
						class="block rounded-xl p-4 hover:bg-brand-50 transition-colors group no-underline"
						role="menuitem"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<h4 class="font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">
									{job.title}
								</h4>
								<p class="text-sm text-slate-500 mt-0.5">{job.location}</p>
							</div>
							<span class="shrink-0 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
								{job.type}
							</span>
						</div>
						<p class="text-sm text-brand-600 font-medium mt-2">{job.salary}</p>
					</a>
				{/each}
			</div>

			<div class="border-t border-border bg-surface-3 px-5 py-3 flex items-center justify-between">
				<span class="text-xs text-slate-500">
					{jobCategories.reduce((n, c) => n + c.jobs.length, 0)} open positions
				</span>
				<a
					href="mailto:hello@giveabit.io?subject=General Application"
					class="text-xs font-semibold text-brand-600 hover:text-brand-700 no-underline"
				>
					Apply generally →
				</a>
			</div>
		</div>
	{/if}
</div>