import { navItems } from '$lib/nav';
import { blogPosts } from '$lib/blog';
import { faqItems, rssFeeds } from '$lib/data';
import { legalSources } from '$lib/legal';
import { printDocuments } from '$lib/documents';
import { manualSections } from '$lib/manual';
import { templates } from '$lib/templates';
import { strataToolModules } from '$lib/strata-tool';
import { units } from '$lib/demo/building';
import { sections as taxSections } from '$lib/demo/tax';
import { bookStatement } from '$lib/ledger-statement';
import { money } from '$lib/demo/format';
import type { Translation } from '$lib/i18n';

export type SearchGroup =
	| 'pages'
	| 'units'
	| 'ledger'
	| 'tax'
	| 'posts'
	| 'faq'
	| 'templates'
	| 'documents'
	| 'manual'
	| 'legal'
	| 'feeds'
	| 'tools'
	| 'tasks';

export type SearchEntry = {
	group: SearchGroup;
	title: string;
	description: string;
	href: string;
};

/** One home for the ten group eyebrows. The search modal renders these as the
 * per-result chips, and the empty-state hint is tested against them, so the
 * placeholder copy and the results always name the same things. */
export function searchGroupLabels(t: Translation): Record<SearchGroup, string> {
	return {
		pages: t.searchPages,
		units: t.searchUnits,
		ledger: t.searchLedger,
		tax: t.searchTax,
		posts: t.searchPosts,
		faq: t.searchFaq,
		templates: t.searchTemplates,
		documents: t.searchDocuments,
		manual: t.searchManual,
		legal: t.searchLegal,
		feeds: t.primarySources,
		tools: t.strataTool,
		tasks: t.tasksTitle
	};
}

/** The one- or two-word labels the scoping chips use. Long names like
 * "Print-ready documents" do not fit a chip row, so the chips carry short
 * forms and the full label stays on the per-result eyebrows. */
export function searchGroupShort(t: Translation): Record<SearchGroup, string> {
	return {
		pages: t.searchShortPages,
		units: t.searchShortUnits,
		ledger: t.searchShortLedger,
		tax: t.searchShortTax,
		posts: t.searchShortPosts,
		faq: t.searchShortFaq,
		templates: t.searchShortTemplates,
		documents: t.searchShortDocuments,
		manual: t.searchShortManual,
		legal: t.searchShortLegal,
		feeds: t.searchShortFeeds,
		tools: t.searchShortTools,
		tasks: t.searchShortTasks
	};
}

/** Which groups the index actually carries entries for, in index order.
 * The scoping chips render from this, so a future group cannot gain a chip
 * and then filter down to nothing. */
export function groupsInIndex(index: SearchEntry[]): SearchGroup[] {
	const order: SearchGroup[] = [
		'pages',
		'units',
		'ledger',
		'tax',
		'documents',
		'manual',
		'posts',
		'faq',
		'templates',
		'legal',
		'feeds',
		'tools',
		'tasks'
	];
	const present = new Set(index.map((entry) => entry.group));
	return order.filter((group) => present.has(group));
}

/** Search within one group only. Scope first, then rank — a chip narrows the
 * corpus so results that would have missed the global cut still surface. */
export function scopeIndex(
	index: SearchEntry[],
	query: string,
	group: SearchGroup,
	limit = 12
): SearchEntry[] {
	return searchIndex(
		index.filter((entry) => entry.group === group),
		query,
		limit
	);
}

/** The canonical, shareable URL for a query — what the modal builds, what the
 * /search page reads, and what a council bookmarks or sends. One builder so
 * they can never disagree about encoding. */
export function searchShareHref(query: string): string {
	return `/search?q=${encodeURIComponent(query.trim())}`;
}

function norm(value: string): string {
	return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Build the searchable index. Pass the active translation object so localized titles resolve. */
export function buildSearchIndex(t: Translation): SearchEntry[] {  const pages: SearchEntry[] = navItems.map((item) => ({
    group: 'pages',
    title: item.label,
    description: t.subtitle,
    href: item.href
  }));

  // Pages deliberately outside the header nav: the bar stays short, but search
  // still reaches them. `How your money is held` is the one a treasurer hunts
  // for by name, so it is indexed even though it has no menu entry.
  pages.push({
    group: 'pages',
    title: t.custodyLink,
    description: t.custodyMetaDescription,
    href: '/custody'
  });

	// The building itself. A council hunting "305" or an owner's surname is
	// looking for the lot's own sheet, not the /units list, so each lot opens its
	// page rather than the register.
	const lots: SearchEntry[] = units.map((unit) => ({
		group: 'units',
		title: `${t.payLot} ${unit.id} — ${unit.type}`,
		description: [
			unit.owner,
			unit.occupancy === 'tenant' && unit.tenant ? unit.tenant : null,
			`${unit.sqft} sqft`
		]
			.filter(Boolean)
			.join(' · '),
		href: `/units/${unit.id}`
	}));

	// The journal. Each entry opens the drawer it names, by the hash the statement
	// chains it to — so the link and the row are the same entry, not a search for
	// a memo that may read alike elsewhere.
	const ledger: SearchEntry[] = bookStatement().map((row) => ({
		group: 'ledger',
		title: row.entry.memo,
		description: `${row.entry.date} · ${money(row.cash)} · ${row.entry.postedBy}`,
		href: `/accounting?tab=journal#entry-${row.hash}`
	}));

	// The tax desk's sections, by the agency that wants them and the day they are
	// due. The page already anchors every section, so a result lands on it.
	const tax: SearchEntry[] = taxSections.map((section) => ({
		group: 'tax',
		title: section.title,
		description: `${section.agency} · ${section.statusLabel} · ${section.deadline}`,
		href: `/tax#${section.id}`
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

	// Print-ready documents. These are the pages a council hunts for by name
	// ("Form B"), and before this they were only reachable if you already knew
	// the /documents page existed.
	const docs: SearchEntry[] = printDocuments.map((doc) => ({
		group: 'documents',
		title: doc.title,
		description: doc.purpose,
		href: `/documents?doc=${doc.slug}`
	}));

	// The manual hub — the long-form answers a new council asks for.
	const manual: SearchEntry[] = manualSections.map((section) => ({
		group: 'manual',
		title: section.title,
		description: section.desc,
		href: section.href
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

	// The dashboard's one task list — the thing a returning council opens first.
	// Same destination the task rows link to, so search and the list agree.
	const tasks: SearchEntry[] = [
		{
			group: 'tasks',
			title: t.tasksTitle,
			description: t.tasksHint,
			href: '/'
		}
	];

	return [
		...pages,
		...lots,
		...ledger,
		...tax,
		...docs,
		...manual,
		...posts,
		...faq,
		...tpls,
		...legal,
		...feeds,
		...tools,
		...tasks
	];
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
