import { rssFeeds, rssItems } from '$lib/data';
import { blogPosts } from '$lib/blog';

export const SITE = 'https://openstrata.giveabit.io';

export type FeedCategory = (typeof rssFeeds)[number]['category'];

export function feedCategories(): FeedCategory[] {
	return [...new Set(rssFeeds.map((f) => f.category))];
}

export function categorySlug(category: FeedCategory): string {
	return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function slugToCategory(slug: string): FeedCategory | undefined {
	return feedCategories().find((category) => categorySlug(category) === slug);
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function feedLink(feedId: string): string {
	const feed = rssFeeds.find((f) => f.id === feedId);
	return feed ? feed.url : `${SITE}/`;
}

function itemXml(title: string, link: string, guid: string, date: string, description: string): string {
	const pubDate = new Date(`${date}T12:00:00Z`).toUTCString();
	return [
		'<item>',
		`<title>${escapeXml(title)}</title>`,
		`<link>${escapeXml(link)}</link>`,
		`<guid isPermaLink="false">${escapeXml(guid)}</guid>`,
		`<pubDate>${pubDate}</pubDate>`,
		`<description>${escapeXml(description)}</description>`,
		'</item>'
	].join('\n');
}

/** Build a complete RSS document; pass a category to scope it to that feed. */
export function buildFeed(category?: FeedCategory): string {
	const channelLink = `${SITE}/rss`;
	const selfHref = category ? `${SITE}/rss/${categorySlug(category)}.xml` : `${SITE}/rss.xml`;

	const ownItems = blogPosts
		.filter((post) => !post.external)
		.map((post) =>
			itemXml(post.title, `${SITE}/blog#${post.slug}`, `openstrata-post-${post.slug}`, post.date, post.excerpt)
		);

	const feedItems = rssItems
		.filter((item) => {
			if (!category) return true;
			const feed = rssFeeds.find((f) => f.id === item.feed);
			return feed?.category === category;
		})
		.map((item) =>
			itemXml(item.title, feedLink(item.feed), `openstrata-${item.id}`, item.date, item.excerpt)
		);

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OpenStrata — Strata Operations, Compliance &amp; Sovereign Finance${category ? ` (${escapeXml(category)})` : ''}</title>
    <link>${channelLink}</link>
    <description>BC strata compliance, governance, market data, and Bitcoin sovereignty updates from Give A Bit.</description>
    <language>en</language>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml" />
    ${ownItems}
    ${feedItems}
  </channel>
</rss>`;
}
