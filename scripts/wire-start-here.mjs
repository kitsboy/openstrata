#!/usr/bin/env node
/**
 * One-off codemod: mount the `StartHere` journey strip on the pages that make
 * up the OpenStrata funnel, each tagged with the leg it represents.
 *
 * Placement is deliberate — directly BELOW the header band, so the ordered
 * three-leg track reads as "here is where you are in the whole journey" rather
 * than as another hero element competing with the h1.
 *
 * The hero close tag is found by counting nested <section> tags, so a page that
 * later grows a nested section inside its header does not silently get the strip
 * injected into the middle of its markup.
 */
import fs from 'node:fs';
import path from 'node:path';

const TARGETS = [
  { file: 'src/routes/tools/+page.svelte', step: 1 },
  { file: 'src/routes/tools/wizard/+page.svelte', step: 2 },
  { file: 'src/routes/thank-you/+page.svelte', step: 3 }
];

const COMPONENT = 'StartHere';
const IMPORT = `\timport ${COMPONENT} from '$lib/components/${COMPONENT}.svelte';`;

function insertImport(source, importLine) {
  if (source.includes(`components/${COMPONENT}.svelte`)) return source;
  const imports = [...source.matchAll(/^[ \t]*import [^\n]*\n/gm)];
  if (imports.length === 0) throw new Error('No import statements found');
  const last = imports[imports.length - 1];
  const end = last.index + last[0].length;
  const endsWithNewline = last[0].endsWith('\n');
  return source.slice(0, end) + (endsWithNewline ? '' : '\n') + importLine + '\n' + source.slice(end);
}

function closeOfHero(source) {
  const open = source.indexOf('<section class="page-hero">');
  if (open === -1) throw new Error('No page-hero section found');
  let depth = 0;
  for (const match of source.slice(open).matchAll(/<section\b|<\/section>/g)) {
    if (match[0] === '</section>') {
      depth -= 1;
      if (depth === 0) return open + match.index + match[0].length;
    } else {
      depth += 1;
    }
  }
  throw new Error('Unbalanced <section> tags after the hero');
}

for (const { file, step } of TARGETS) {
  const full = path.join(process.cwd(), file);
  let source = fs.readFileSync(full, 'utf8');
  if (source.includes(`<${COMPONENT} step=`)) {
    console.log(`- ${file}: already wired, skipped`);
    continue;
  }
  source = insertImport(source, IMPORT);
  const at = closeOfHero(source);
  const mount = `\n\n<${COMPONENT} step={${step}} />`;
  source = source.slice(0, at) + mount + source.slice(at);
  fs.writeFileSync(full, source);
  console.log(`- ${file}: strip mounted for leg ${step}`);
}

// The manual quick-start uses its own prose layout (no .page-hero), so it is
// anchored on its lead paragraph instead.
const manual = path.join(process.cwd(), 'src/routes/docs/manual/getting-started/+page.svelte');
{
  let source = fs.readFileSync(manual, 'utf8');
  if (source.includes(`<${COMPONENT} step=`)) {
    console.log(`- ${path.relative(process.cwd(), manual)}: already wired, skipped`);
  } else {
    const anchor = '    <PageToc />';
    if (!source.includes(anchor)) throw new Error('Could not find the <PageToc /> anchor');
    source = insertImport(source, `  import ${COMPONENT} from '$lib/components/${COMPONENT}.svelte';`);
    source = source.replace(anchor, `${anchor}\n\n    <${COMPONENT} step={3} />`);
    fs.writeFileSync(manual, source);
    console.log(`- ${path.relative(process.cwd(), manual)}: strip mounted for leg 3`);
  }
}
