#!/usr/bin/env node
/**
 * One-off maintenance script: injects the v0.3.27 keys (deadline-calendar
 * popover: month-nav aria labels, tools CTA, due-in chip) into src/lib/i18n.ts
 * so the locale-parity guard stays green across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  calPrevMonth: 'Previous month',
  calNextMonth: 'Next month',
  calPopOpenTools: 'Open Strata Tools',
  calPopDueIn: 'in {n} days'
};

const translations = {
  fr: {
    calPrevMonth: 'Mois précédent',
    calNextMonth: 'Mois suivant',
    calPopOpenTools: 'Ouvrir Strata Tools',
    calPopDueIn: 'dans {n} j'
  },
  es: {
    calPrevMonth: 'Mes anterior',
    calNextMonth: 'Mes siguiente',
    calPopOpenTools: 'Abrir Strata Tools',
    calPopDueIn: 'en {n} d'
  },
  zh: {
    calPrevMonth: '上个月',
    calNextMonth: '下个月',
    calPopOpenTools: '打开 Strata Tools',
    calPopDueIn: '{n} 天后'
  },
  hi: {
    calPrevMonth: 'पिछला महीना',
    calNextMonth: 'अगला महीना',
    calPopOpenTools: 'Strata Tools खोलें',
    calPopDueIn: '{n} दिन में'
  },
  fil: {
    calPrevMonth: 'Nakaraang buwan',
    calNextMonth: 'Susunod na buwan',
    calPopOpenTools: 'Buksan ang Strata Tools',
    calPopDueIn: 'sa loob ng {n} araw'
  },
  pl: {
    calPrevMonth: 'Poprzedni miesiąc',
    calNextMonth: 'Następny miesiąc',
    calPopOpenTools: 'Otwórz Strata Tools',
    calPopDueIn: 'za {n} dni'
  },
  uk: {
    calPrevMonth: 'Попередній місяць',
    calNextMonth: 'Наступний місяць',
    calPopOpenTools: 'Відкрити Strata Tools',
    calPopDueIn: 'за {n} днів'
  },
  sw: {
    calPrevMonth: 'Mwezi uliopita',
    calNextMonth: 'Mwezi ujao',
    calPopOpenTools: 'Fungua Strata Tools',
    calPopDueIn: 'baada ya siku {n}'
  }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

const keys = Object.keys(english);
if (keys.some((k) => source.includes(`${k}: '`))) {
  console.log('v0.3.27 keys already present — nothing to do.');
  process.exit(0);
}

// 1. Translation type members.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
source =
  source.slice(0, typeEnd) + keys.map((k) => `${k}: string;`).join(' ') + ' ' + source.slice(typeEnd);

// 2. English catalog values, before its closing brace.
const catalogStart = source.indexOf('const english: Translation = {');
const catalogEnd = source.indexOf('\n};', catalogStart);
if (catalogStart === -1 || catalogEnd === -1) {
  throw new Error('Could not locate the English catalog.');
}
source =
  source.slice(0, catalogEnd).replace(/,\s*$/, '') +
  `, ${kv(english)}` +
  source.slice(catalogEnd);

// 3. Per-locale override blocks — lazy [\s\S] covers blocks spanning many lines.
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
console.log(`Injected ${keys.length} v0.3.27 keys into src/lib/i18n.ts across 9 locales`);
