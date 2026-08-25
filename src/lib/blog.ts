import { rssItems } from '$lib/data';

export type BlogPost = {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	tag: string;
	external?: boolean;
};

/** Own editorial posts plus aggregated feed items, newest first. */
export const blogPosts: BlogPost[] = [
	...rssItems.map((item) => ({
		slug: `feed-${item.id}`,
		title: item.title,
		date: item.date,
		excerpt: item.excerpt,
		tag: 'Hermes',
		external: true
	})),
	{
		slug: 'sovereign-data-portability-standard',
		title: 'OpenStrata v0.1: Sovereign Data Portability Standard',
		date: '2026-05-01',
		excerpt:
			'Introducing the open standard for carrying identity, social graph, and strata records across Bitcoin, Lightning, and Nostr.',
		tag: 'OpenStrata'
	},
	{
		slug: 'bitcoin-treasury-rails',
		title: 'Why Strata Corporations Need Bitcoin Treasury Rails',
		date: '2026-04-15',
		excerpt:
			'CRF reserves, invoice verification, and 3-of-5 multisig eliminate single points of failure in strata financial operations.',
		tag: 'Bitcoin'
	}
].sort((a, b) => (a.date < b.date ? 1 : -1));
