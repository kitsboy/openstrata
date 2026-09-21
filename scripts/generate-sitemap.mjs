#!/usr/bin/env node
/**
 * Generates static/sitemap.xml from the canonical route list.
 * Run before every build (npm run build runs this first via "prebuild").
 *
 * `/search` is the shareable search page — listed so a shared link is at least
 * crawlable, though the page itself sends `noindex, follow` (each query is a
 * soft-404 for a crawler; the route is not).
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
  '/search',
  '/spec',
  '/templates',
  '/documents',
  '/tools',
  '/tools/wizard',
  '/privacy',
  '/terms'
];

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
