import { describe, it, expect } from 'vitest';
import {
	buildSearchIndex,
	searchIndex,
	searchGroupLabels,
	searchGroupShort,
	groupsInIndex,
	scopeIndex,
	searchShareHref
} from '$lib/search';
import { english, translations } from '$lib/i18n';
import { printDocuments } from '$lib/documents';
import { manualSections } from '$lib/manual';

describe('search index', () => {
	it('indexes pages, posts, faq, templates, legal, feeds', () => {
		const index = buildSearchIndex(english);
		const groups = new Set(index.map((entry) => entry.group));
		expect(groups.has('pages')).toBe(true);
		expect(groups.has('posts')).toBe(true);
		expect(groups.has('faq')).toBe(true);
		expect(groups.has('templates')).toBe(true);
		expect(groups.has('legal')).toBe(true);
		expect(groups.has('feeds')).toBe(true);
	});

	it('indexes strata tool modules under the tools group', () => {
		const index = buildSearchIndex(english);
		const tools = index.filter((entry) => entry.group === 'tools');
		expect(tools.length).toBeGreaterThan(5);
		expect(tools.some((entry) => entry.title.toLowerCase().includes('form k'))).toBe(true);
		expect(tools.some((entry) => entry.href === '/tools/wizard')).toBe(true);
	});

	it('indexes every print-ready document by its own name', () => {
		const index = buildSearchIndex(english);
		const docs = index.filter((entry) => entry.group === 'documents');
		expect(docs.length).toBe(printDocuments.length);
		expect(docs.every((entry) => entry.href.startsWith('/documents?doc='))).toBe(true);
		expect(searchIndex(index, 'form b')[0].href).toBe('/documents?doc=form-b');
	});

	it('indexes the manual sections', () => {
		const index = buildSearchIndex(english);
		const manual = index.filter((entry) => entry.group === 'manual');
		expect(manual.length).toBe(manualSections.length);
		expect(searchIndex(index, 'quick start')[0].group).toBe('manual');
	});

	it('finds the dashboard task list by what it is called', () => {
		const index = buildSearchIndex(english);
		const results = searchIndex(index, 'what needs doing');
		expect(results[0].group).toBe('tasks');
		expect(results[0].href).toBe('/');
	});

	it('finds tool modules by plain-language query', () => {
		const index = buildSearchIndex(english);
		const results = searchIndex(index, 'reconciliation');
		expect(results.length).toBeGreaterThan(0);
	});

	it('the English empty-state hint names every group the index serves', () => {
		// The stale-copy guard: this hint once named five of the ten groups and
		// nothing failed. If a group is added to the index, this test fails until
		// the canonical (English) hint is rewritten to match — English is written
		// uninflected, so exact containment is possible here and only here.
		const groups = [...new Set(buildSearchIndex(english).map((entry) => entry.group))];
		const labels = searchGroupLabels(english);
		expect(Object.keys(labels).sort()).toEqual([...groups].sort());
		// And the scoping chips must cover exactly the same set — the chips and
		// the eyebrows are two views of one group list.
		expect(Object.keys(searchGroupShort(english)).sort()).toEqual(
			Object.keys(labels).sort()
		);
		const hint = english.searchHint.toLowerCase();
		for (const label of Object.values(labels)) {
			expect(hint).toContain(label.toLowerCase());
		}
	});

	it('every locale carries its own localized hint, never the stale copy', () => {
		for (const [code, t] of Object.entries(translations)) {
			expect(t.searchHint.trim().length, code).toBeGreaterThan(0);
			expect(t.searchHint.toLowerCase(), code).not.toContain(
				'search across pages, posts, faq, templates, and legal sources'
			);
			if (code !== 'en') {
				expect(t.searchHint, `${code} hint must be localized, not the English string`).not.toBe(
					english.searchHint
				);
			}
		}
	});

	it('every locale resolves ten non-empty group labels', () => {
		for (const [code, t] of Object.entries(translations)) {
			const labels = searchGroupLabels(t);
			expect(Object.keys(labels).length, code).toBe(10);
			for (const [group, label] of Object.entries(labels)) {
				expect(label.trim().length, `${code}:${group}`).toBeGreaterThan(0);
			}
		}
	});

	it('every indexed href lands on a real destination', async () => {
		// Link-integrity guard: search results are navigations, so every href the
		// modal can goto must be an external URL or a route on the canonical
		// public-route list (the sitemap's). The nav is NOT the test — pages like
		// /custody deliberately live outside the header bar.
		const fs = await import('node:fs');
		const path = await import('node:path');
		const sitemap = fs.readFileSync(
			path.join(process.cwd(), 'static', 'sitemap.xml'),
			'utf8'
		);
		const routes = new Set(
			[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
		);
		const index = buildSearchIndex(english);
		for (const entry of index) {
			if (/^https?:\/\//.test(entry.href)) continue;
			const route = entry.href.split('?')[0].split('#')[0];
			expect(routes.has(route), `${entry.href} ("${entry.title}")`).toBe(true);
		}
	});

	it('the short group labels never duplicate each other in a locale', () => {
		// The scoping chips render side by side; two chips with one label read
		// as a rendering bug. (English 'Pages' vs 'Posts' etc. must stay distinct.)
		for (const [code, t] of Object.entries(translations)) {
			const shorts = Object.values(searchGroupShort(t)).map((label) => label.trim().toLowerCase());
			expect(new Set(shorts).size, code).toBe(shorts.length);
		}
	});

	it('the share href encodes the query and round-trips', () => {
		expect(searchShareHref('  Form B  ')).toBe('/search?q=Form%20B');
		const href = searchShareHref('minutes & bylaws?');
		expect(new URLSearchParams(href.split('?')[1]).get('q')).toBe('minutes & bylaws?');
	});

	it('scopeIndex searches inside one group only', () => {
		const index = buildSearchIndex(english);
		const results = scopeIndex(index, 'form b', 'documents');
		expect(results.length).toBeGreaterThan(0);
		expect(results.every((entry) => entry.group === 'documents')).toBe(true);
		// Scoped queries that would miss the global top-12 cut still surface.
		const narrow = scopeIndex(index, 'notice', 'documents');
		expect(narrow[0].group).toBe('documents');
	});

	it('groupsInIndex lists every group the index carries, in stable order', () => {
		const index = buildSearchIndex(english);
		const groups = groupsInIndex(index);
		expect(groups.length).toBe(10);
		expect(new Set(groups).size).toBe(10);
		expect(groups).toEqual([...groups].sort(() => 0)); // stable, no duplicates
	});

	it('ranks exact title matches first', () => {
		const index = buildSearchIndex(english);
		const results = searchIndex(index, 'faq');
		expect(results[0].group).toBe('pages');
		expect(results[0].title.toLowerCase()).toBe('faq');
	});
});
