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

for (const file of routeFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  const copyKeys = [...source.matchAll(/\$copy\.([A-Za-z][A-Za-z0-9]*)/g)].map((match) => match[1]);
  for (const key of new Set(copyKeys)) {
    if (!catalogKeys.has(key)) errors.push(`${relative}: missing catalog key ${key}`);
  }

  const usesCopyStore = /\$lib\/i18n/.test(source) || relative === 'src/routes/+layout.svelte';
  if (!usesCopyStore && !relative.includes('/api/') && !relative.endsWith('/rss/+page.svelte')) {
    warnings.push(`${relative}: no shared i18n import detected`);
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
