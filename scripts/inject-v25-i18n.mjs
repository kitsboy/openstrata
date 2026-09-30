#!/usr/bin/env node
/**
 * One-off maintenance script: injects the v0.3.25 keys into src/lib/i18n.ts
 * (tour replay link, task-list filter chips, ⌘K footer hints, 404 search,
 * back-to-top) so the locale-parity guard stays green across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  tourReplay: 'Watch the 60-second intro again',
  tasksFilterDone: 'Done',
  tasksFilterWeek: 'This week',
  searchHintOpen: 'open',
  searchHintClose: 'close',
  errorSearchTitle: 'Or try searching for it',
  backToTop: 'Back to top'
};

const translations = {
  fr: {
    tourReplay: 'Revoir l’intro d’une minute',
    tasksFilterDone: 'Fait',
    tasksFilterWeek: 'Cette semaine',
    searchHintOpen: 'ouvrir',
    searchHintClose: 'fermer',
    errorSearchTitle: 'Ou essayez de la chercher',
    backToTop: 'Haut de page'
  },
  es: {
    tourReplay: 'Ver la intro de nuevo',
    tasksFilterDone: 'Hecho',
    tasksFilterWeek: 'Esta semana',
    searchHintOpen: 'abrir',
    searchHintClose: 'cerrar',
    errorSearchTitle: 'O prueba a buscarla',
    backToTop: 'Volver arriba'
  },
  zh: {
    tourReplay: '再看一遍一分钟介绍',
    tasksFilterDone: '已完成',
    tasksFilterWeek: '本周',
    searchHintOpen: '打开',
    searchHintClose: '关闭',
    errorSearchTitle: '或者试试搜索',
    backToTop: '回到顶部'
  },
  hi: {
    tourReplay: 'एक मिनट की इंट्रो फिर देखें',
    tasksFilterDone: 'पूर्ण',
    tasksFilterWeek: 'इस हफ़्ते',
    searchHintOpen: 'खोलें',
    searchHintClose: 'बंद करें',
    errorSearchTitle: 'या खोज कर देखें',
    backToTop: 'ऊपर जाएँ'
  },
  fil: {
    tourReplay: 'Panoorin muli ang isang-minutong intro',
    tasksFilterDone: 'Tapos',
    tasksFilterWeek: 'Ngayong linggo',
    searchHintOpen: 'buksan',
    searchHintClose: 'isara',
    errorSearchTitle: 'O subukang hanapin ito',
    backToTop: 'Bumalik sa itaas'
  },
  pl: {
    tourReplay: 'Obejrzyj intro ponownie',
    tasksFilterDone: 'Gotowe',
    tasksFilterWeek: 'W tym tygodniu',
    searchHintOpen: 'otwórz',
    searchHintClose: 'zamknij',
    errorSearchTitle: 'Albo spróbuj jej poszukać',
    backToTop: 'Do góry'
  },
  uk: {
    tourReplay: 'Переглянути хвилинний вступ ще раз',
    tasksFilterDone: 'Виконано',
    tasksFilterWeek: 'Цього тижня',
    searchHintOpen: 'відкрити',
    searchHintClose: 'закрити',
    errorSearchTitle: 'Або спробуйте пошукати',
    backToTop: 'Догори'
  },
  sw: {
    tourReplay: 'Tazama utangulizi tena',
    tasksFilterDone: 'Imekamilika',
    tasksFilterWeek: 'Wiki hii',
    searchHintOpen: 'fungua',
    searchHintClose: 'funga',
    errorSearchTitle: 'Au jaribu kuitafuta',
    backToTop: 'Rudi juu'
  }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. New members on the Translation type.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
const typeMembers = Object.keys(english).map((key) => `${key}: string;`).join(' ') + ' ';
source = source.slice(0, typeEnd) + typeMembers + source.slice(typeEnd);

// 2. English catalog values.
const catalogStart = source.indexOf('const english: Translation = {');
const catalogEnd = source.indexOf('\n};', catalogStart);
if (catalogStart === -1 || catalogEnd === -1) {
  throw new Error('Could not locate the English catalog.');
}
source =
  source.slice(0, catalogEnd).replace(/,\s*$/, '') +
  `, ${kv(english)}` +
  source.slice(catalogEnd);

// 3. Per-locale override blocks — lazy [\s\S] so a block spanning many lines is
// covered (each block ends at its first ` },` line, the next block's start.
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
console.log(`Injected ${Object.keys(english).length} v0.3.25 keys into src/lib/i18n.ts across 9 locales`);
