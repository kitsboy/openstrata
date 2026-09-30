import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Docs cross-link checker.
 *
 * The docs and `llms.txt` are part of the product: an agent (or a human)
 * following a dead link there gets a 404 with the site's name on it. This
 * checker walks every markdown link in `docs/*.md`, `docs/diligence/*.md` and
 * `static/llms.txt`, and fails when a site link points at a route the sitemap
 * does not know (i.e. a page that no longer exists or was renamed) or when a
 * relative file link points at nothing on disk.
 *
 * Anchors (`/page#section`) are checked to the page, not the heading —
 * headings move; the sitemap is the authority on what exists.
 */

const ROOT = resolve(process.cwd());

/** Absolute site URLs' origin, so `https://openstrata.giveabit.io/docs` → `/docs`. */
const SITE_ORIGIN = 'https://openstrata.giveabit.io';

function walkMarkdown(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...walkMarkdown(full));
		} else if (entry.endsWith('.md')) {
			out.push(full);
		}
	}
	return out;
}

const docFiles = walkMarkdown(join(ROOT, 'docs'));

/**
 * The routes that exist, walked from `src/routes` — the filesystem is what
 * actually serves, so it is the authority. Directories with a `+page.svelte`
 * or a `+server.ts` are routes; `[name]` segments are dynamic and match any
 * single request segment (`/rss/[category].xml` serves `/rss/bitcoin.xml`).
 */
function routePaths(): Set<string> {
	const routesDir = join(ROOT, 'src', 'routes');
	const out = new Set<string>();
	const walk = (dir: string) => {
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) {
				walk(full);
			} else if (entry === '+page.svelte' || entry === '+server.ts') {
				const rel = dir.slice(routesDir.length) || '/';
				out.add(rel.replace(/\/$/, '') || '/');
			}
		}
	};
	walk(routesDir);
	expect(out.size).toBeGreaterThan(10);
	return out;
}

const routes = routePaths();

/** Does a request path match a route, allowing dynamic `[segment]`s? */
function routeExists(request: string): boolean {
	if (routes.has(request)) return true;
	const segs = request.split('/').filter(Boolean);
	return [...routes].some((route) => {
		const rSegs = route.split('/').filter(Boolean);
		if (rSegs.length !== segs.length) return false;
		return rSegs.every((seg, i) => seg === segs[i] || seg.startsWith('['));
	});
}

function checkLink(file: string, target: string): string | null {
	// Off-site links are not ours to verify here.
	if (/^(https?:)?\/\//.test(target)) {
		if (!target.startsWith(SITE_ORIGIN)) return null;
		const path = target.slice(SITE_ORIGIN.length).split('?')[0] || '/';
		return routeExists(path.replace(/\/$/, '') || '/') ? null : `site route gone: ${path}`;
	}
	if (target.startsWith('mailto:')) return null;

	// Site-absolute link.
	if (target.startsWith('/')) {
		const path = target.split('#')[0].split('?')[0] || '/';
		return routeExists(path) ? null : `site route gone: ${path}`;
	}

	// Relative file link (docs → docs).
	const clean = target.split('#')[0];
	if (!clean) return null; // pure anchor
	const resolved = resolve(dirname(file), clean);
	return existsSync(resolved) ? null : `missing file: ${clean}`;
}

function linksIn(file: string): Array<{ target: string; line: number }> {
	const text = readFileSync(file, 'utf8');
	return [...text.matchAll(/\]\(([^)\s]+)[^)]*\)/g)]
		.map((m) => ({ target: m[1], line: text.slice(0, m.index ?? 0).split('\n').length }))
		.filter(({ target }) => !target.startsWith('<'));
}

describe('docs cross-links', () => {
	it('found the docs corpus', () => {
		expect(docFiles.length).toBeGreaterThan(10);
	});

	it('every docs link resolves to a route or file', () => {
		const broken: string[] = [];
		for (const file of docFiles) {
			for (const { target, line } of linksIn(file)) {
				const problem = checkLink(file, target);
				if (problem) broken.push(`${file}:${line} → ${target} (${problem})`);
			}
		}
		expect(broken).toEqual([]);
	});

	it('llms.txt links resolve to live routes', () => {
		const llms = readFileSync(join(ROOT, 'static', 'llms.txt'), 'utf8');
		const broken: string[] = [];
		for (const { target, line } of linksIn(join(ROOT, 'static', 'llms.txt'))) {
			const problem = checkLink(join(ROOT, 'static', 'llms.txt'), target);
			if (problem) broken.push(`static/llms.txt:${line} → ${target} (${problem})`);
		}
		expect(broken).toEqual([]);
		void llms;
	});
});
