#!/usr/bin/env node
/**
 * One-off codemod: mount a per-section `HeroArt` motif inside every `.page-hero`
 * band, so each tab reads as its own place instead of a sibling of the last one.
 *
 * The motif is chosen by what the section actually is, not by rotation:
 *   /tools            -> modules   the module lattice
 *   /roadmap, /spec   -> chain     blocks linked into a proof chain
 *   /compliance,legal -> scales    statutes and balance
 *   /docs, /templates -> ledger    stacked, ruled documents
 *   /about,/blog      -> network   the community graph
 *   /faq,/rss,/design -> signal    answers radiating outward
 *
 * Idempotent: a page that already mounts <HeroArt> is skipped.
 */
import fs from 'node:fs';
import path from 'node:path';

const TARGETS = [
  ['src/routes/tools/+page.svelte', 'modules'],
  ['src/routes/tools/wizard/+page.svelte', 'modules'],
  ['src/routes/roadmap/+page.svelte', 'chain'],
  ['src/routes/spec/+page.svelte', 'chain'],
  ['src/routes/compliance/+page.svelte', 'scales'],
  ['src/routes/legal/+page.svelte', 'scales'],
  ['src/routes/docs/+page.svelte', 'ledger'],
  ['src/routes/templates/+page.svelte', 'ledger'],
  ['src/routes/about/+page.svelte', 'network'],
  ['src/routes/blog/+page.svelte', 'network'],
  ['src/routes/design/+page.svelte', 'signal'],
  ['src/routes/faq/+page.svelte', 'signal'],
  ['src/routes/rss/+page.svelte', 'signal'],
  ['src/routes/thank-you/+page.svelte', 'signal']
];

const HERO = '<section class="page-hero">';

function insertImport(source, importLine) {
  if (source.includes(`components/HeroArt.svelte`)) return source;
  const imports = [...source.matchAll(/^[ \t]*import [^\n]*\n/gm)];
  if (imports.length === 0) throw new Error('No import statements found');
  const last = imports[imports.length - 1];
  const end = last.index + last[0].length;
  return source.slice(0, end) + importLine + '\n' + source.slice(end);
}

let wired = 0;
for (const [file, variant] of TARGETS) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) throw new Error(`Missing target page: ${file}`);
  let source = fs.readFileSync(full, 'utf8');
  if (source.includes('<HeroArt')) {
    console.log(`- ${file}: already wired, skipped`);
    continue;
  }
  if (!source.includes(HERO)) throw new Error(`${file}: no .page-hero band found`);

  source = insertImport(source, `\timport HeroArt from '$lib/components/HeroArt.svelte';`);
  // Mount as the band's first child, so it paints above the band's own grid
  // layer (both are z-index:-1; later tree order wins) and below the copy.
  source = source.replace(HERO, `${HERO}\n\t\t<HeroArt variant="${variant}" />`);
  fs.writeFileSync(full, source);
  wired += 1;
  console.log(`- ${file}: ${variant} motif mounted`);
}

if (wired === 0) throw new Error('Nothing was wired — did the header pattern change?');
console.log(`\nHero art mounted on ${wired} pages.`);
