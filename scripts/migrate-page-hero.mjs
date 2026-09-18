#!/usr/bin/env node
/**
 * One-off codemod: swap every top-level page header's hand-rolled Tailwind
 * gradient for the shared `.page-hero` band defined in src/app.css.
 *
 * Why: each page grew its own gradient, and several ended in `to-white`
 * (`from-brand-50 via-white`, `to-white`, `from-amber-50/50 to-white`) — which
 * paints a bright band straight across dark mode. One token-mixed class flips
 * with the theme by construction, and gives every tab the same header language.
 *
 * Only touches `<section class="border-b border-border bg-gradient-to-...">`
 * opening tags — the header band. Inner markup is untouched.
 */
import fs from 'node:fs';
import path from 'node:path';

const routesDir = path.join(process.cwd(), 'src', 'routes');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walk(entryPath)
      : entryPath.endsWith('.svelte')
        ? [entryPath]
        : [];
  });
}

const HEADER = /<section class="border-b border-border bg-gradient-to-[^"]*">/g;
const replaced = [];

for (const file of walk(routesDir)) {
  const source = fs.readFileSync(file, 'utf8');
  if (!HEADER.test(source)) continue;
  HEADER.lastIndex = 0;
  const next = source.replace(HEADER, '<section class="page-hero">');
  const count = (source.match(HEADER) ?? []).length;
  fs.writeFileSync(file, next);
  replaced.push(`${path.relative(process.cwd(), file)} (${count})`);
}

if (replaced.length === 0) throw new Error('No page header bands matched — did the pattern change?');
console.log(`Migrated ${replaced.length} page header bands to .page-hero:`);
for (const entry of replaced) console.log(`- ${entry}`);
