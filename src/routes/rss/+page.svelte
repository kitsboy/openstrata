<script lang="ts">
	import { rssFeeds, rssItems, apiEndpoints } from '$lib/data';
	import Icon from '$lib/components/Icon.svelte';

	let selectedCategory = $state('All');
	let apiTab = $state<'rest' | 'webhooks' | 'feeds'>('rest');

	const categories = $derived(['All', ...new Set(rssFeeds.map((f) => f.category))]);

	const filteredFeeds = $derived(
		selectedCategory === 'All'
			? rssFeeds
			: rssFeeds.filter((f) => f.category === selectedCategory)
	);

	const filteredItems = $derived(
		selectedCategory === 'All'
			? rssItems
			: rssItems.filter((item) => {
					const feed = rssFeeds.find((f) => f.id === item.feed);
					return feed?.category === selectedCategory;
				})
	);

	const restEndpoints = $derived(apiEndpoints.filter((e) => !e.path.includes('webhook') && !e.path.includes('feeds')));
	const webhookEndpoints = $derived(apiEndpoints.filter((e) => e.path.includes('webhook')));
	const feedEndpoints = $derived(apiEndpoints.filter((e) => e.path.includes('feeds') || e.path.includes('market')));
</script>

<svelte:head>
	<title>RSS Feeds & API — Hermes Strata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="max-w-3xl">
			<div class="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700 mb-4">
				<Icon name="rss" class="h-3.5 w-3.5" />
				GROWABLE FEED INFRASTRUCTURE
			</div>
			<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">RSS, Social & API Hub</h1>
			<p class="mt-4 text-lg text-slate-600 leading-relaxed">
				Aggregate BC housing regulations, CRT decisions, rental market data, Bitcoin protocol news,
				and Twitter/X lists. Expose everything through a clean REST API for your strata stack.
			</p>
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-6 py-12">
	<!-- Category filter -->
	<div class="flex flex-wrap gap-2 mb-8">
		{#each categories as cat}
			<button
				class="rounded-full px-4 py-2 text-sm font-semibold transition-all
					{selectedCategory === cat
						? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
						: 'bg-white border border-border text-slate-600 hover:border-brand-300'}"
				onclick={() => (selectedCategory = cat)}
			>
				{cat}
			</button>
		{/each}
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Feed sources -->
		<div class="lg:col-span-1">
			<h2 class="text-lg font-bold text-slate-800 mb-4">Feed Sources</h2>
			<div class="space-y-3">
				{#each filteredFeeds as feed}
					<div class="glass-card rounded-xl p-4">
						<div class="flex items-center justify-between mb-1">
							<span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">{feed.category}</span>
							<span class="text-[10px] text-slate-400">{feed.source}</span>
						</div>
						<h3 class="font-semibold text-sm text-slate-800">{feed.title}</h3>
						<a href={feed.url} class="mt-2 block text-xs text-brand-600 no-underline hover:underline truncate" target="_blank" rel="noopener noreferrer">
							{feed.url}
						</a>
					</div>
				{/each}
			</div>

			<div class="mt-6 glass-card rounded-xl p-5 border-dashed">
				<h3 class="font-semibold text-slate-800 text-sm">Add Custom Feed</h3>
				<p class="mt-1 text-xs text-slate-500">RSS URLs, Twitter/X lists, Nostr relays — plug in via config.yaml</p>
				<code class="mt-3 block rounded-lg bg-slate-100 p-3 text-[10px] font-mono text-slate-600 overflow-x-auto">
					feeds:<br/>
					&nbsp;&nbsp;- url: https://...<br/>
					&nbsp;&nbsp;&nbsp;&nbsp;category: Regulation<br/>
					&nbsp;&nbsp;- twitter_list: strata-bc
				</code>
			</div>
		</div>

		<!-- Feed items -->
		<div class="lg:col-span-2">
			<h2 class="text-lg font-bold text-slate-800 mb-4">Latest Items</h2>
			<div class="space-y-4">
				{#each filteredItems as item}
					{@const feed = rssFeeds.find((f) => f.id === item.feed)}
					<article class="glass-card rounded-xl p-5 hover:border-brand-200 transition-all">
						<div class="flex items-center gap-3 mb-2">
							<span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">{feed?.source}</span>
							<span class="text-xs text-slate-400">{item.date}</span>
							<span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">{feed?.category}</span>
						</div>
						<h3 class="text-base font-bold text-slate-800 leading-snug">{item.title}</h3>
						<p class="mt-2 text-sm text-slate-500 leading-relaxed">{item.excerpt}</p>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- API Section -->
<section class="border-t border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="text-center mb-10">
			<h2 class="text-2xl font-bold text-slate-900">Hermes REST API</h2>
			<p class="mt-2 text-slate-500">Local-first API on your M4 Docker stack · Tailscale-secured</p>
		</div>

		<div class="flex justify-center gap-2 mb-8">
			{#each [['rest', 'REST Endpoints'], ['webhooks', 'Webhooks'], ['feeds', 'Feeds & Market']] as [tab, label]}
				<button
					class="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all
						{apiTab === tab
							? 'bg-brand-600 text-white'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					onclick={() => (apiTab = tab as typeof apiTab)}
				>
					{label}
				</button>
			{/each}
		</div>

		<div class="max-w-4xl mx-auto space-y-3">
			{#each apiTab === 'rest' ? restEndpoints : apiTab === 'webhooks' ? webhookEndpoints : feedEndpoints as endpoint}
				<div class="glass-card rounded-xl p-5 flex items-start gap-4">
					<span class="shrink-0 rounded-lg px-3 py-1 text-xs font-bold font-mono
						{endpoint.method === 'GET' ? 'bg-success/10 text-success' : 'bg-brand-50 text-brand-700'}">
						{endpoint.method}
					</span>
					<div class="flex-1 min-w-0">
						<code class="text-sm font-mono font-semibold text-slate-800">{endpoint.path}</code>
						<p class="mt-1 text-sm text-slate-500">{endpoint.desc}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-10 max-w-4xl mx-auto glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-3">Quick Start</h3>
			<pre class="rounded-xl bg-slate-900 text-slate-100 p-5 text-sm font-mono overflow-x-auto leading-relaxed"><code># Fetch live market rates (BTC/CAD + vacancy)
curl -H "Authorization: Bearer $HERMES_TOKEN" \\
  https://hermes.local/api/v1/market/rates?jurisdiction=BC

# Query Rosa compliance RAG
curl -X GET "https://hermes.local/api/v1/rosa/query?q=EPR+2026+deadline" \\
  -H "Authorization: Bearer $HERMES_TOKEN"

# Subscribe to aggregated RSS output
curl https://hermes.local/api/v1/feeds/rss?categories=Regulation,Legal</code></pre>
		</div>
	</div>
</section>