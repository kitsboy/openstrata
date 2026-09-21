#!/usr/bin/env node
/**
 * One-off maintenance script: injects the single `searchSave` key (the ⌘K
 * modal's pin-a-query button) into src/lib/i18n.ts so the locale-parity guard
 * stays green across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = { searchSave: 'Save search' };

const translations = {
  fr: { searchSave: 'Épingler la recherche' },
  es: { searchSave: 'Guardar búsqueda' },
  zh: { searchSave: '收藏搜索' },
  hi: { searchSave: 'सर्च सेव करें' },
  fil: { searchSave: 'I-save ang paghahanap' },
  pl: { searchSave: 'Zapisz wyszukiwanie' },
  uk: { searchSave: 'Зберегти пошук' },
  sw: { searchSave: 'Hifadhi utafutaji' }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

if (source.includes("searchSave: '")) {
  console.log('searchSave already present — nothing to do.');
  process.exit(0);
}

const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
source = source.slice(0, typeEnd) + 'searchSave: string; ' + source.slice(typeEnd);

const catalogStart = source.indexOf('const english: Translation = {');
const catalogEnd = source.indexOf('\n};', catalogStart);
if (catalogStart === -1 || catalogEnd === -1) {
  throw new Error('Could not locate the English catalog.');
}
source =
  source.slice(0, catalogEnd).replace(/,\s*$/, '') +
  `, ${kv(english)}` +
  source.slice(catalogEnd);

let touched = 0;
source = source.replace(
  /^( {2}([a-z]{2,3}): \{ \.\.\.english, )([\s\S]*?)( \},?)$/gm,
  (match, head, code, body, tail) => {
    const map = translations[code];
    if (!map) return match;
    touched += 1;
    return `${head}${body.replace(/,\s*$/, '')}, ${kv(map)}${tail}`;
  }
);
if (touched !== 8) throw new Error(`Expected 8 locale blocks, patched ${touched}.`);

fs.writeFileSync(file, source);
console.log('Injected searchSave into src/lib/i18n.ts across 9 locales');
