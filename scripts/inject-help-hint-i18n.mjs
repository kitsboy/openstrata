#!/usr/bin/env node
/**
 * One-off maintenance script: injects the sidebar help-hint key into
 * src/lib/i18n.ts, so the locale-parity guard stays green across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  helpStartHere: 'Start here — the six-step guide'
};

const translations = {
  fr: { helpStartHere: 'Commencez ici — le guide en six étapes' },
  es: { helpStartHere: 'Empieza aquí — la guía de seis pasos' },
  zh: { helpStartHere: '从这里开始 — 六步指南' },
  hi: { helpStartHere: 'यहीं से शुरू करें — छह-कदम गाइड' },
  fil: { helpStartHere: 'Magsimula dito — ang anim na hakbang' },
  pl: { helpStartHere: 'Zacznij tutaj — przewodnik w sześciu krokach' },
  uk: { helpStartHere: 'Почніть тут — покроковий посібник із шести кроків' },
  sw: { helpStartHere: 'Anza hapa — mwongozo wa hatua sita' }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. New member on the Translation type.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
const typeMembers = Object.keys(english).map((key) => `${key}: string;`).join(' ') + ' ';
source = source.slice(0, typeEnd) + typeMembers + source.slice(typeEnd);

// 2. English catalog value.
const catalogStart = source.indexOf('const english: Translation = {');
const catalogEnd = source.indexOf('\n};', catalogStart);
if (catalogStart === -1 || catalogEnd === -1) {
  throw new Error('Could not locate the English catalog.');
}
source =
  source.slice(0, catalogEnd).replace(/,\s*$/, '') +
  `, ${kv(english)}` +
  source.slice(catalogEnd);

// 3. Per-locale override blocks.
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
console.log('Injected helpStartHere into src/lib/i18n.ts across 9 locales');
