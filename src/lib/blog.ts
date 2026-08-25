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
	},  {
    slug: 'bitcoin-treasury-rails',
    title: 'Why Strata Corporations Need Bitcoin Treasury Rails',
    date: '2026-04-15',
    excerpt:
      'CRF reserves, invoice verification, and 3-of-5 multisig eliminate single points of failure in strata financial operations.',
    tag: 'Bitcoin'
  },
  {
    slug: 'epr-2026-checklist',
    title: 'EPR 2026: The Strata Checklist Your Council Needs',
    date: '2026-08-12',
    excerpt:
      'Metro Vancouver strata corporations must file Energy Performance Reports by December 31, 2026. Here is what councils need to gather, who signs off, and why the deadline hits resale disclosure.',
    tag: 'Compliance'
  },
  {
    slug: 'three-trust-layers',
    title: 'Three Layers of Trust: Software, Proof, and Portability',
    date: '2026-08-02',
    excerpt:
      'Hermes runs the operations, Satohash anchors every decision to Bitcoin, and the OpenStrata protocol keeps the history portable. Why each layer exists and what it protects.',
    tag: 'OpenStrata'
  },
  {
    slug: 'quorum-and-abstentions',
    title: 'Quorum, Abstentions, and the 30-Minute Rule, Explained',
    date: '2026-07-19',
    excerpt:
      'A plain-language walkthrough of BC quorum rules: what counts, what does not, how the 30-minute rule works, and why the CRT overturns meetings that get this wrong.',
    tag: 'Governance'
  }
].sort((a, b) => (a.date < b.date ? 1 : -1));
