#!/usr/bin/env node
/**
 * One-off maintenance script: injects the /design page's sample-text keys into
 * src/lib/i18n.ts, so the locale-parity guard stays green across all 9 locales.
 *
 * Note: these strings *describe the English type specimens themselves* (font
 * names, sizes), so most locales carry the same or lightly adapted text — the
 * specimen being displayed is English by nature.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  designTypeHeading: 'Manrope — headings',
  designTypeBody: 'Body copy reads clean at 16–18px with relaxed leading.',
  designMonoLine: 'DM Mono — labels, codes, tallies',
  designEyebrowLine: 'Eyebrow — tiny caps',
  designCardNote: 'Radius 13 · 2-layer shadow · hairline border.',
  designStatesIcons: 'States & icons'
};

const translations = {
  fr: {
    designTypeHeading: 'Manrope — titres',
    designTypeBody: 'Le texte courant se lit bien de 16 à 18 px avec un interlignage aéré.',
    designMonoLine: 'DM Mono — étiquettes, codes, décomptes',
    designEyebrowLine: 'Surtitre — petites capitales',
    designCardNote: 'Rayon 13 · ombre à deux couches · bordure fine.',
    designStatesIcons: 'États & icônes'
  },
  es: {
    designTypeHeading: 'Manrope — títulos',
    designTypeBody: 'El texto se lee bien a 16–18px con interlineado amplio.',
    designMonoLine: 'DM Mono — etiquetas, códigos, totales',
    designEyebrowLine: 'Antetítulo — versalitas',
    designCardNote: 'Radio 13 · sombra en dos capas · borde fino.',
    designStatesIcons: 'Estados e iconos'
  },
  zh: {
    designTypeHeading: 'Manrope — 标题',
    designTypeBody: '正文在 16–18px、行距宽松时阅读最清晰。',
    designMonoLine: 'DM Mono — 标签、代码、计数',
    designEyebrowLine: '眉题 — 小型大写',
    designCardNote: '圆角 13 · 双层阴影 · 细边框。',
    designStatesIcons: '状态与图标'
  },
  hi: {
    designTypeHeading: 'Manrope — शीर्षक',
    designTypeBody: '16–18px पर आराम की लाइन-स्पेसिंग के साथ पाठ साफ़ पढ़ा जाता है।',
    designMonoLine: 'DM Mono — लेबल, कोड, गणनाएँ',
    designEyebrowLine: 'आइब्रो शीर्षक — छोटे कैप्स',
    designCardNote: 'त्रिज्या 13 · दो-परत छाया · पतली किनारा।',
    designStatesIcons: 'स्थितियाँ और आइकन'
  },
  fil: {
    designTypeHeading: 'Manrope — mga heading',
    designTypeBody: 'Malinaw mabasa ang teksto sa 16–18px na may maluwag na leading.',
    designMonoLine: 'DM Mono — mga label, code, bilang',
    designEyebrowLine: 'Eyebrow — maliliit na caps',
    designCardNote: 'Radius 13 · 2-layer shadow · manipis na border.',
    designStatesIcons: 'Mga state at icon'
  },
  pl: {
    designTypeHeading: 'Manrope — nagłówki',
    designTypeBody: 'Tekst czyta się dobrze w 16–18px z luźną interlinią.',
    designMonoLine: 'DM Mono — etykiety, kody, zliczenia',
    designEyebrowLine: 'Nadtytuł — małe wersaliki',
    designCardNote: 'Promień 13 · dwuwarstwowy cień · cienka obwódka.',
    designStatesIcons: 'Stany i ikony'
  },
  uk: {
    designTypeHeading: 'Manrope — заголовки',
    designTypeBody: 'Текст добре читається у 16–18px з вільним міжряддям.',
    designMonoLine: 'DM Mono — мітки, коди, підрахунки',
    designEyebrowLine: 'Надзаголовок — малі капітелі',
    designCardNote: 'Радіус 13 · двошарова тінь · тонка рамка.',
    designStatesIcons: 'Стани та іконки'
  },
  sw: {
    designTypeHeading: 'Manrope — vichwa',
    designTypeBody: 'Maandisho husomeka vizuri kwa 16–18px ikiwa na nafasi tupu ya kutosha.',
    designMonoLine: 'DM Mono — lebo, misimbo, mahesabu',
    designEyebrowLine: 'Kichwa kidogo — herufi kubwa ndogo',
    designCardNote: 'Radius 13 · kivuli cha tabaka miwili · mpaka mwembamba.',
    designStatesIcons: 'Hali na aikoni'
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
  `Injected ${Object.keys(english).length} design-page keys into src/lib/i18n.ts across 9 locales`
);
