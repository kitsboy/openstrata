<script lang="ts">
	import { onMount } from 'svelte';
	import { faqItems } from '$lib/data';
	import { copy } from '$lib/i18n';

	const categories = [...new Set(faqItems.map((item) => item.category))];

	let openIndex = $state<string | null>(null);
	let faqQuery = $state('');

	const visibleItems = $derived.by(() => {
		const q = faqQuery.trim().toLowerCase();
		if (!q) return faqItems;
		return faqItems.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(q));
	});

	// Deep-link support: /faq#faq-<uid> opens and scrolls to that question.
	onMount(() => {
		const match = /^#faq-(.+)$/.exec(window.location.hash);
		if (!match) return;
		const uid = decodeURIComponent(match[1]);
		openIndex = uid;
		setTimeout(() => {
			document.getElementById(`faq-${uid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, 100);
	});

	function toggle(uid: string) {
		openIndex = openIndex === uid ? null : uid;
		history.replaceState(null, '', openIndex ? `#faq-${uid}` : window.location.pathname);
	}
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
	<label class="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3">
		<span class="text-lg text-slate-400" aria-hidden="true">⌕</span>
		<span class="sr-only">{$copy.search}</span>
		<input
			type="search"
			bind:value={faqQuery}
			placeholder={$copy.search}
			class="w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
		/>
	</label>

	{#each categories as category}
		{#if visibleItems.some((item) => item.category === category)}
		<section class="mb-12 last:mb-0">
			<h2 class="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900">
				<span class="h-2 w-2 rounded-full bg-brand-500"></span>
				{category}
			</h2>
			<div class="space-y-3">
				{#each visibleItems.filter((item) => item.category === category) as item, i}
					{@const uid = `${category}-${i}`}
					<article id="faq-{uid}" class="glass-card rounded-2xl overflow-hidden scroll-mt-24">
						<button
							class="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-brand-50/30 transition-colors"
							aria-expanded={openIndex === uid}
							onclick={() => toggle(uid)}
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
		{/if}
	{/each}

	<div class="mt-8 rounded-2xl border-l-4 border-l-brand-500 bg-surface-2 p-6">
		<p class="text-sm leading-relaxed text-slate-600">
			<strong>{$copy.generalInfo}</strong> {$copy.legalLibraryNotice}
		</p>
	</div>
</div>
