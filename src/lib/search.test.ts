import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchIndex } from '$lib/search';
import { english } from '$lib/i18n';

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

	it('finds tool modules by plain-language query', () => {
		const index = buildSearchIndex(english);
		const results = searchIndex(index, 'reconciliation');
		expect(results.length).toBeGreaterThan(0);
	});

	it('ranks exact title matches first', () => {
		const index = buildSearchIndex(english);
		const results = searchIndex(index, 'faq');
		expect(results[0].group).toBe('pages');
		expect(results[0].title.toLowerCase()).toBe('faq');
	});
});
