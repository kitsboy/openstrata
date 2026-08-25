<script lang="ts">
	import { blogPosts } from '$lib/blog';
	import Icon from '$lib/components/Icon.svelte';
	import { copy, locale, formatDate } from '$lib/i18n';

	const posts = blogPosts;
</script>

<svelte:head>
	<title>{$copy.blogPageTitle}</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-amber-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.blogTitle}</h1>
		<p class="mt-3 text-lg text-slate-600">{$copy.blogIntro}</p>
	</div>
</section>

<div class="mx-auto max-w-4xl px-6 py-12">
	<div class="space-y-6">
		{#each posts as post}
			<article class="glass-card rounded-2xl p-6 hover:border-brand-200 transition-all group">
				<div class="flex items-center gap-3 mb-3">
					<span class="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-bold text-brand-700">{post.tag}</span>
					<time class="text-xs text-slate-400" datetime={post.date}>{formatDate(post.date, $locale, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
				</div>
				<h2 class="text-xl font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{post.title}</h2>
				<p class="mt-3 text-slate-500 leading-relaxed">{post.excerpt}</p>
				<a href="/rss" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 no-underline hover:text-brand-700">{$copy.readMore} →</a>
			</article>
		{/each}
	</div>

	<div class="mt-12 glass-card rounded-2xl p-8 text-center border-dashed">
		<Icon name="rss" class="h-8 w-8 text-brand-500 mx-auto mb-3" />
		<h2 class="font-bold text-slate-800">{$copy.subscribeRss}</h2>
		<p class="mt-2 text-sm text-slate-500">{$copy.subscribeRssHint}</p>
		<a href="/rss" class="mt-4 inline-block text-sm font-semibold text-brand-600 no-underline hover:underline">{$copy.viewRssApi} →</a>
	</div>
</div>