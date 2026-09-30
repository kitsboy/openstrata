#!/usr/bin/env node
/**
 * One-off maintenance script: injects the /search page keys into
 * src/lib/i18n.ts, so the locale-parity guard stays green across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  searchPageTitle: 'Search — OpenStrata',
  searchMetaDescription:
    'Search every page, document, manual section, FAQ, legal source, and tool on OpenStrata.',
  searchPageIntro:
    'This page runs the same index as the ⌘K modal — bookmark it or send the link to a council member.',
  searchResultsCount: 'results'
};

const translations = {
  fr: {
    searchPageTitle: 'Recherche — OpenStrata',
    searchMetaDescription:
      'Cherchez dans toutes les pages, documents, sections du manuel, FAQ, sources juridiques et outils d’OpenStrata.',
    searchPageIntro:
      'Cette page utilise le même index que le panneau ⌘K — ajoutez-la à vos favoris ou envoyez le lien à un membre du conseil.',
    searchResultsCount: 'résultats'
  },
  es: {
    searchPageTitle: 'Búsqueda — OpenStrata',
    searchMetaDescription:
      'Busca en todas las páginas, documentos, secciones del manual, preguntas frecuentes, fuentes legales y herramientas de OpenStrata.',
    searchPageIntro:
      'Esta página usa el mismo índice que el panel ⌘K — guárdala o envía el enlace a un miembro del consejo.',
    searchResultsCount: 'resultados'
  },
  zh: {
    searchPageTitle: '搜索 — OpenStrata',
    searchMetaDescription: '搜索 OpenStrata 的所有页面、文档、手册章节、常见问题、法律来源和工具。',
    searchPageIntro: '此页面与 ⌘K 面板使用同一索引 — 可收藏或把链接发给理事会成员。',
    searchResultsCount: '条结果'
  },
  hi: {
    searchPageTitle: 'खोज — OpenStrata',
    searchMetaDescription:
      'OpenStrata के सभी पृष्ठों, दस्तावेज़ों, मैनुअल अनुभागों, प्रश्नोत्तरी, कानूनी स्रोतों और टूल में खोजें।',
    searchPageIntro:
      'यह पृष्ठ ⌘K पैनल के उसी इंडेक्स से चलता है — इसे बुकमार्क करें या लिंक काउंसिल सदस्य को भेजें।',
    searchResultsCount: 'परिणाम'
  },
  fil: {
    searchPageTitle: 'Paghahanap — OpenStrata',
    searchMetaDescription:
      'Maghanap sa lahat ng pahina, dokumento, bahagi ng manwal, FAQ, legal na sanggunian, at tool ng OpenStrata.',
    searchPageIntro:
      'Gumagamit ang pahinang ito ng parehong index ng ⌘K panel — i-bookmark ito o ipasa ang link sa kapwa miyembro ng konseho.',
    searchResultsCount: 'resulta'
  },
  pl: {
    searchPageTitle: 'Wyszukiwanie — OpenStrata',
    searchMetaDescription:
      'Szukaj we wszystkich stronach, dokumentach, sekcjach podręcznika, FAQ, źródłach prawnych i narzędziach OpenStrata.',
    searchPageIntro:
      'Ta strona korzysta z tego samego indeksu co panel ⌘K — zapisz ją w ulubionych lub wyślij link członkowi rady.',
    searchResultsCount: 'wyników'
  },
  uk: {
    searchPageTitle: 'Пошук — OpenStrata',
    searchMetaDescription:
      'Шукайте на всіх сторінках, у документах, розділах посібника, FAQ, правових джерелах та інструментах OpenStrata.',
    searchPageIntro:
      'Ця сторінка працює на тому самому індексі, що й панель ⌘K — збережіть її або надішліть посилання члену ради.',
    searchResultsCount: 'результатів'
  },
  sw: {
    searchPageTitle: 'Utafutaji — OpenStrata',
    searchMetaDescription:
      'Tafuta kwenye kurasa zote, nyaraka, sehemu za mwongozo, FAQ, vyanzo vya sheria na zana za OpenStrata.',
    searchPageIntro:
      'Ukurasa huu unatumia indeksi ileile ya paneli ya ⌘K — iweke kwenye alama au utume kiungo kwa mwanabaraza.',
    searchResultsCount: 'matokeo'
  }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. New members on the Translation type, anchored to the type block itself.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
const typeMembers = Object.keys(english).map((key) => `${key}: string;`).join(' ') + ' ';
source = source.slice(0, typeEnd) + typeMembers + source.slice(typeEnd);

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
console.log(
  `Injected ${Object.keys(english).length} /search keys into src/lib/i18n.ts across 9 locales`
);
