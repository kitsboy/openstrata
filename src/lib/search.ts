import { navItems } from '$lib/nav';
import { blogPosts } from '$lib/blog';
import { faqItems, rssFeeds } from '$lib/data';
import { legalSources } from '$lib/legal';
import { templates } from '$lib/templates';
import { strataToolModules } from '$lib/strata-tool';
import type { Translation } from '$lib/i18n';

export type SearchGroup = 'pages' | 'posts' | 'faq' | 'templates' | 'legal' | 'feeds' | 'tools';

export type SearchEntry = {
	group: SearchGroup;
	title: string;
	description: string;
	href: string;
};

function norm(value: string): string {
	return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Build the searchable index. Pass the active translation object so localized titles resolve. */
export function buildSearchIndex(t: Translation): SearchEntry[] {
	const pages: SearchEntry[] = navItems.map((item) => ({
		group: 'pages',
		title: item.label,
		description: t.subtitle,
		href: item.href
	}));

	const posts: SearchEntry[] = blogPosts.map((post) => ({
		group: 'posts',
		title: post.title,
		description: post.excerpt,
		href: `/blog#${post.slug}`
	}));  const faq: SearchEntry[] = faqItems.map((item) => ({
    group: 'faq',
    title: item.q,
    description: item.a,
    href: '/faq'
  }));

	const tpls: SearchEntry[] = templates.map((tpl) => ({
		group: 'templates',
		title: t[tpl.title],
		description: t[tpl.descriptionKey],
		href: '/templates'
	}));

	const legal: SearchEntry[] = legalSources.map((source) => ({
		group: 'legal',
		title: source.title,
		description: `${source.kind} · ${source.authority}`,
		href: source.url
	}));

	const feeds: SearchEntry[] = rssFeeds.map((feed) => ({
		group: 'feeds',
		title: feed.title,
		description: feed.source,
		href: feed.url
	}));

	const tools: SearchEntry[] = strataToolModules.map((mod) => ({
		group: 'tools',
		title: mod.title,
		description: `${mod.domain} · ${mod.desc}`,
		href: mod.href ?? '/tools'
	}));

	return [...pages, ...posts, ...faq, ...tpls, ...legal, ...feeds, ...tools];
}

/** Rank entries by title/exact-prefix matches first, then description matches. */
export function searchIndex(index: SearchEntry[], query: string, limit = 12): SearchEntry[] {
	const q = norm(query.trim());
	if (!q) return [];
	const scored: Array<{ entry: SearchEntry; score: number }> = [];
	for (const entry of index) {
		const title = norm(entry.title);
		const description = norm(entry.description);
		let score = -1;
		if (title === q) score = 100;
		else if (title.startsWith(q)) score = 80;
		else if (title.includes(q)) score = 60;
		else if (description.includes(q)) score = 35;
		if (score >= 0) scored.push({ entry, score });
	}
	return scored
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((item) => item.entry);
}
