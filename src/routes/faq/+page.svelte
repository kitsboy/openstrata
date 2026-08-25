<script lang="ts">
	import { faqItems } from '$lib/data';
	import { copy } from '$lib/i18n';

	const categories = [...new Set(faqItems.map((item) => item.category))];

	let openIndex = $state<string | null>(null);
</script>

<svelte:head>
	<title>{$copy.faqTitle} — OpenStrata</title>
	<meta name="description" content={$copy.faqIntro} />
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700">{$copy.faqTitle}</span>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.faqTitle}</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.faqIntro}</p>
	</div>
</section>

<div class="mx-auto max-w-4xl px-6 py-12">
	{#each categories as category}
		<section class="mb-12 last:mb-0">
			<h2 class="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900">
				<span class="h-2 w-2 rounded-full bg-brand-500"></span>
				{category}
			</h2>
			<div class="space-y-3">
				{#each faqItems.filter((item) => item.category === category) as item, i}
					{@const uid = `${category}-${i}`}
					<article class="glass-card rounded-2xl overflow-hidden">
						<button
							class="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-brand-50/30 transition-colors"
							aria-expanded={openIndex === uid}
							onclick={() => (openIndex = openIndex === uid ? null : uid)}
						>
							<h3 class="font-semibold text-slate-800">{item.q}</h3>
							<span class="shrink-0 text-slate-400 transition-transform {openIndex === uid ? 'rotate-180' : ''}" aria-hidden="true">▼</span>
						</button>
						{#if openIndex === uid}
							<div class="px-5 pb-5 border-t border-border pt-4 animate-slide-up">
								<p class="text-sm leading-relaxed text-slate-600">{item.a}</p>
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</section>
	{/each}

	<div class="mt-8 rounded-2xl border-l-4 border-l-brand-500 bg-surface-2 p-6">
		<p class="text-sm leading-relaxed text-slate-600">
			<strong>{$copy.generalInfo}</strong> {$copy.legalLibraryNotice}
		</p>
	</div>
</div>
