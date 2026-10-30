import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = '.svelte-kit/output/client';
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.vite/manifest.json'), 'utf8'));
const entries = Object.keys(manifest).filter((key) =>
  /nodes\/(0|2)\.js$/.test(key) || (manifest[key].isEntry && !manifest[key].isDynamicEntry)
);
if (entries.filter((key) => /nodes\/(0|2)\.js$/.test(key)).length !== 2) {
  throw new Error('Dashboard manifest entries not found; revisit the budget graph.');
}
const visited = new Set();
function visit(key) {
  if (visited.has(key)) return;
  if (!manifest[key]) throw new Error(`Missing manifest entry ${key}`);
  visited.add(key);
  for (const dependency of manifest[key].imports ?? []) visit(dependency);
}
entries.forEach(visit);
const bytes = [...visited].reduce((total, key) => {
  const file = manifest[key].file;
  return file.endsWith('.js') ? total + gzipSync(fs.readFileSync(path.join(root, file))).length : total;
}, 0);
const budget = 230_000;
console.log(`Dashboard initial JavaScript: ${bytes} gzip bytes (budget ${budget}).`);
if (bytes > budget) process.exitCode = 1;
