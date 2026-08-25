import { rssFeeds, rssItems } from '$lib/data';

export const prerender = true;

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
	return feed ? feed.url : 'https://openstrata.giveabit.io/';
}

export function GET() {
	const channelLink = 'https://openstrata.giveabit.io/rss';
	const items = rssItems
		.map((item) => {
			const pubDate = new Date(`${item.date}T12:00:00Z`).toUTCString();
			const link = feedLink(item.feed);
			return [
				'<item>',
				`<title>${escapeXml(item.title)}</title>`,
				`<link>${escapeXml(link)}</link>`,
				`<guid isPermaLink="false">openstrata-${item.id}</guid>`,
				`<pubDate>${pubDate}</pubDate>`,
				`<description>${escapeXml(item.excerpt)}</description>`,
				'</item>'
			].join('\n');
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OpenStrata — Strata Operations, Compliance &amp; Sovereign Finance</title>
    <link>${channelLink}</link>
    <description>BC strata compliance, governance, market data, and Bitcoin sovereignty updates from Give A Bit.</description>
    <language>en</language>
    <atom:link href="https://openstrata.giveabit.io/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
