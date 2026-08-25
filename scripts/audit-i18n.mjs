import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routesDir = path.join(root, 'src', 'routes');
const catalogPath = path.join(root, 'src', 'lib', 'i18n.ts');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : entryPath.endsWith('.svelte') ? [entryPath] : [];
  });
}

const catalog = fs.readFileSync(catalogPath, 'utf8');
const englishBlock = catalog.match(/const english: Translation = \{([\s\S]*?)\n\};/);
if (!englishBlock) throw new Error('Could not locate the English translation catalog.');

const catalogKeys = new Set([...englishBlock[1].matchAll(/\b([A-Za-z][A-Za-z0-9]*)\s*:/g)].map((match) => match[1]));
const routeFiles = walk(routesDir);
const errors = [];
const warnings = [];

// ---------------------------------------------------------------------------
// Locale parity guard: every non-English locale must override exactly the same
// key set as the French benchmark (full coverage). This forces new catalog keys
// to be translated across all locales instead of silently falling back.
// ---------------------------------------------------------------------------
const LOCALE_BLOCK = /^  ([a-z]{2,3}): \{ \.\.\.english, (.*?)( \},?)$/gm;
const localeBlocks = new Map();
for (const match of catalog.matchAll(LOCALE_BLOCK)) {
  // Keys are lowercase-camelCase identifiers immediately followed by a quote
  // (a string value). Requiring the quote avoids matching "Word:" patterns
  // that appear inside translated values (e.g. French "BCFSA :", Spanish
  // "Sellado:", or "marketing.ts:").
  localeBlocks.set(
    match[1],
    new Set([...match[2].matchAll(/\b([a-z][A-Za-z0-9]*)\s*:\s*'/g)].map((m) => m[1]))
  );
}

const frKeys = localeBlocks.get('fr');
if (!frKeys) throw new Error('Could not locate the French override block (parity benchmark).');
for (const [code, keys] of localeBlocks) {
  if (code === 'fr') continue;
  const missing = [...frKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !frKeys.has(key));
  if (missing.length > 0 || extra.length > 0) {
    errors.push(
      `locale ${code} is out of parity with fr (${missing.length} missing, ${extra.length} extra). ` +
        `Missing: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`
    );
  }
}

// ---------------------------------------------------------------------------
// Hard-coded copy scanner: flags static English text that should live in the
// shared catalog. Warn-level because domain records legitimately stay
// canonical English until reviewed translations exist.
// ---------------------------------------------------------------------------

// Brand names, proper nouns, and domain terms that may legitimately appear
// as literal text in templates.
const ALLOWED_WORDS = new Set(
  (
    'openstrata hermes rosa ziggy satohash camille harbour cedar northline lofts ' +
    'vancouver burnaby victoria british columbia alberta ontario canada ' +
    'january february march april may june july august september october november december ' +
    'give bit sqft crt bcfusa bcf community operations'
  ).split(' ')
);

// Lines that render dynamic content via bindings are not static copy.
const BINDING = /\{|\$copy/;

function isEmail(text) {
  return /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(text.trim());
}

function meaningfulTokens(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20BF}\u{2705}]/gu, ' ')
    .replace(/[^A-Za-z\u00C0-\u024F\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => {
      const clean = token.replace(/-/g, '');
      if (clean.length < 3) return false; // OS, CM, vs, e.g.
      if (/^[A-Z]{2,4}$/.test(clean)) return false; // BCFSA, CRT, SPA
      if (ALLOWED_WORDS.has(clean.toLowerCase())) return false;
      return true;
    });
}

const CODE_BLOCK = /^\s*<(script|style|pre|code|option|kbd)/;

for (const file of routeFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');

  // 1. Catalog key resolution for $copy usages (error-level).
  const copyKeys = [...source.matchAll(/\$copy\.([A-Za-z][A-Za-z0-9]*)/g)].map((match) => match[1]);
  for (const key of new Set(copyKeys)) {
    if (!catalogKeys.has(key)) errors.push(`${relative}: missing catalog key ${key}`);
  }

  const usesCopyStore = /\$lib\/i18n/.test(source) || relative === 'src/routes/+layout.svelte';
  if (!usesCopyStore && !relative.includes('/api/') && !relative.endsWith('/rss/+page.svelte')) {
    warnings.push(`${relative}: no shared i18n import detected`);
  }

  // 2. Static text-node scan (warn-level).
  const lines = source.split('\n');
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (CODE_BLOCK.test(line)) inCodeBlock = true;
    if (inCodeBlock) {
      if (/<\/script>|<\/style>|<\/pre>|<\/code>|<\/option>|<\/kbd>/.test(line)) inCodeBlock = false;
      continue;
    }
    if (BINDING.test(line)) continue;

    const textNodes = [...line.matchAll(/>([^<>{]*[A-Za-z]{3,}[^<>{]*)</g)].map((m) => m[1].trim());
    for (const node of textNodes) {
      if (isEmail(node)) continue;
      const tokens = meaningfulTokens(node);
      if (tokens.length >= 2) {
        warnings.push(`${relative}:${i + 1}: hard-coded copy "${node.trim()}"`);
      }
    }
  }

  // 3. Static placeholder attributes (warn-level).
  for (const match of source.matchAll(/placeholder="([^"]*)"/g)) {
    const value = match[1];
    if (/[A-Za-z]{3}/.test(value) && !value.includes('{')) {
      warnings.push(`${relative}: hard-coded placeholder "${value}"`);
    }
  }

  // 4. Static meta description/title content (warn-level). Skip metas whose
  //    content is mandated literal by the platform (iOS PWA, theme color).
  const LITERAL_META = /^(apple-mobile-web-app|theme-color|format-detection|msapplication|robots)/i;
  for (const match of source.matchAll(/<meta[^>]*content="([^"{]*)"/g)) {
    const value = match[1].trim();
    const nameMatch = /<meta[^>]*\bname="([^"]*)"/.exec(match[0]);
    if (nameMatch && LITERAL_META.test(nameMatch[1])) continue;
    if (/[A-Za-z]{3}/.test(value)) warnings.push(`${relative}: hard-coded meta content "${value}"`);
  }
}

if (errors.length > 0) {
  console.error('Translation audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Translation audit passed: ${catalogKeys.size} English keys checked across ${routeFiles.length} route components.`);
if (warnings.length > 0) {
  console.log('Review warnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
