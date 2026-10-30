#!/usr/bin/env node
/**
 * Generates static/sitemap.xml from the canonical route list.
 * Run before every build (npm run build runs this first via "prebuild").
 *
 * Only indexable routes belong here. `/search` is deliberately absent: the page
 * sends `noindex, follow` (each query string is a soft-404 for a crawler), and
 * asking a crawler to index a page that tells it not to is a contradiction
 * Search Console reports as a sitemap error.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://openstrata.giveabit.io';
const TODAY = new Date().toISOString().slice(0, 10);

/** Single source of truth for public routes (mirrors src/lib/nav.ts + extras). */
const routes = [
  '/',
  '/about',
  '/blog',
  '/changelog',
  '/compliance',
  '/custody',
  '/docs',
  '/docs/manual',
  '/docs/manual/welcome',
  '/docs/manual/getting-started',
  '/faq',
  '/legal',
  '/pitch',
  '/roadmap',
  '/rss',
  '/rss.xml',
  '/spec',
  '/templates',
  '/documents',
  '/tools',
  '/tools/wizard',
  '/units',
  '/accounting',
  '/pay',
  '/tax',
  '/calendar',
  '/meetings',
  '/privacy',
  '/terms'
];

// Every lot has its own sheet at /units/[lot] — four floors of ten, the same ids
// `demo/building` builds. They are real pages linked from /units, and search
// results open them by lot, so they belong in the sitemap rather than only in
// the app's route table.
for (const floor of [1, 2, 3, 4]) {
  for (let index = 1; index <= 10; index += 1) {
    routes.push(`/units/${floor}${String(index).padStart(2, '0')}`);
  }
}

const urls = routes
  .map(
    (route) => `  <url>
    <loc>${SITE}${route}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(root, 'static', 'sitemap.xml'), xml);
console.log(`sitemap.xml generated: ${routes.length} routes`);
