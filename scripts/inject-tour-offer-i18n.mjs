#!/usr/bin/env node
/**
 * One-off maintenance script: injects the greeter-popup offer keys into
 * src/lib/i18n.ts so the locale-parity guard (scripts/audit-i18n.mjs) stays
 * green.
 *
 * Adds the "what you get" + "where to start" keys to the Translation type, the
 * English base catalog, and every one of the 8 per-locale override blocks
 * (fr, es, zh, hi, fil, pl, uk, sw). Also rewrites the now-live video fallback
 * copy in every locale — the old "coming soon" line is no longer true.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  tourFactsTitle: 'What you get',
  tourFact1: '0% custody — funds stay in your accounts',
  tourFact2: 'BCFSA-aware compliance, built for BC',
  tourFact3: 'Every action gets a Bitcoin proof trail',
  tourFact4: 'Your history is portable — take it with you',
  tourHowTitle: 'Where to start',
  tourHow1: 'Watch the one-minute intro above',
  tourHow2: 'Create your community workspace',
  tourHow3: 'Add units, funds and bylaws — then run the month'
};

const translations = {
  fr: {
    tourFactsTitle: 'Ce que vous obtenez',
    tourFact1: '0 % de garde — les fonds restent sur vos comptes',
    tourFact2: 'Conformité adaptée à la BCFSA, conçue pour la C.-B.',
    tourFact3: 'Chaque action obtient une preuve Bitcoin',
    tourFact4: 'Votre historique est portable — emportez-le avec vous',
    tourHowTitle: 'Par où commencer',
    tourHow1: 'Regardez l’intro d’une minute ci-dessus',
    tourHow2: 'Créez votre espace communautaire',
    tourHow3: 'Ajoutez unités, fonds et règlements — puis gérez le mois'
  },
  es: {
    tourFactsTitle: 'Lo que obtienes',
    tourFact1: '0 % de custodia — los fondos quedan en tus cuentas',
    tourFact2: 'Cumplimiento adaptado a BCFSA, hecho para BC',
    tourFact3: 'Cada acción obtiene una prueba en Bitcoin',
    tourFact4: 'Tu historial es portátil — llévalo contigo',
    tourHowTitle: 'Por dónde empezar',
    tourHow1: 'Mira la intro de un minuto arriba',
    tourHow2: 'Crea tu espacio de comunidad',
    tourHow3: 'Añade unidades, fondos y estatutos — y luego cierra el mes'
  },
  zh: {
    tourFactsTitle: '你将获得',
    tourFact1: '零托管 — 资金留在你自己的账户',
    tourFact2: '符合 BCFSA 的合规流程，专为卑诗省打造',
    tourFact3: '每个操作都有比特币存证',
    tourFact4: '你的历史可携带 — 随时带走',
    tourHowTitle: '从哪里开始',
    tourHow1: '先看上方一分钟介绍',
    tourHow2: '创建你的社区工作区',
    tourHow3: '添加单元、资金和章程 — 然后完成月度结算'
  },
  hi: {
    tourFactsTitle: 'आपको क्या मिलता है',
    tourFact1: '0% अभिरक्षा — धन आपके ही खातों में रहता है',
    tourFact2: 'BCFSA-अनुरूप अनुपालन, बीसी के लिए बनाया गया',
    tourFact3: 'हर कार्रवाई का बिटकॉइन प्रमाण मिलता है',
    tourFact4: 'आपका इतिहास पोर्टेबल है — साथ ले जाएँ',
    tourHowTitle: 'कहाँ से शुरू करें',
    tourHow1: 'ऊपर दिया एक मिनट का परिचय देखें',
    tourHow2: 'अपना समुदाय कार्यक्षेत्र बनाएँ',
    tourHow3: 'यूनिट, फंड और उपनियम जोड़ें — फिर महीना पूरा करें'
  },
  fil: {
    tourFactsTitle: 'Ang nakukuha mo',
    tourFact1: '0% custody — nasa sarili mong account ang pondo',
    tourFact2: 'Compliance na akma sa BCFSA, gawa para sa BC',
    tourFact3: 'Bawat aksyon ay may Bitcoin proof',
    tourFact4: 'Portable ang iyong kasaysayan — dalhin mo ito',
    tourHowTitle: 'Saan magsisimula',
    tourHow1: 'Panoorin ang isang minutong intro sa itaas',
    tourHow2: 'Gumawa ng workspace ng iyong komunidad',
    tourHow3: 'Magdagdag ng unit, pondo at bylaw — tapos isara ang buwan'
  },
  pl: {
    tourFactsTitle: 'Co otrzymujesz',
    tourFact1: '0% depozytu — środki pozostają na Twoich kontach',
    tourFact2: 'Zgodność z BCFSA, stworzona dla Kolumbii Brytyjskiej',
    tourFact3: 'Każda czynność ma dowód w Bitcoinie',
    tourFact4: 'Twoja historia jest przenośna — zabierz ją ze sobą',
    tourHowTitle: 'Od czego zacząć',
    tourHow1: 'Obejrzyj minutowe intro powyżej',
    tourHow2: 'Utwórz przestrzeń swojej wspólnoty',
    tourHow3: 'Dodaj lokale, fundusze i regulamin — potem zamknij miesiąc'
  },
  uk: {
    tourFactsTitle: 'Що ви отримуєте',
    tourFact1: '0% зберігання — кошти залишаються на ваших рахунках',
    tourFact2: 'Відповідність BCFSA, створено для Британської Колумбії',
    tourFact3: 'Кожна дія має доказ у Bitcoin',
    tourFact4: 'Ваша історія переносима — забирайте її з собою',
    tourHowTitle: 'З чого почати',
    tourHow1: 'Подивіться хвилинне інтро вище',
    tourHow2: 'Створіть робочий простір вашої спільноти',
    tourHow3: 'Додайте юніти, фонди та статут — потім закрийте місяць'
  },
  sw: {
    tourFactsTitle: 'Unachopata',
    tourFact1: '0% ulinzi wa fedha — fedha zinabaki kwenye akaunti zako',
    tourFact2: 'Uzingatiaji unaolingana na BCFSA, umeundwa kwa BC',
    tourFact3: 'Kila kitendo kinapata uthibitisho wa Bitcoin',
    tourFact4: 'Historia yako inabebeka — ichukue nawe',
    tourHowTitle: 'Wapi kuanza',
    tourHow1: 'Tazama utangulizi wa dakika moja hapo juu',
    tourHow2: 'Unda nafasi ya kazi ya jumuiya yako',
    tourHow3: 'Ongeza vitengo, fedha na kanuni — kisha kamilisha mwezi'
  }
};

// v0.3.14 shipped the four video keys in English + fr/es/zh/hi/fil but forgot
// pl/uk/sw, which left `npm run audit:i18n` failing on main (locale parity is
// checked against fr). These locales get the whole set, with the same new
// fallback copy as everyone else.
const missingVideoKeys = {
  pl: {
    tourVideoTitle: 'Zobacz OpenStrata w minutę',
    tourVideoSub: 'Krótki przegląd tego, jak wspólnota działa na OpenStrata — księga, raile i zgodność w jednym miejscu.',
    tourVideoCta: 'Obejrzyj intro',
    tourVideoFallback: 'Nie udało się załadować wideo — odśwież lub obejrzyj je w narzędziach.'
  },
  uk: {
    tourVideoTitle: 'Подивіться OpenStrata за хвилину',
    tourVideoSub: 'Короткий огляд того, як спільнота працює в OpenStrata — книга, рейки та відповідність в одному місці.',
    tourVideoCta: 'Дивитися інтро',
    tourVideoFallback: 'Відео не вдалося завантажити — оновіть сторінку або перегляньте його в інструментах.'
  },
  sw: {
    tourVideoTitle: 'Ona OpenStrata kwa dakika moja',
    tourVideoSub: 'Muhtasari mfupi wa jinsi jumuiya inavyoendeshwa kwenye OpenStrata — leja, reli na uzingatiaji mahali pamoja.',
    tourVideoCta: 'Tazama utangulizi',
    tourVideoFallback: 'Video haikupakia — onyesha upya, au itazame kwenye zana.'
  }
};
for (const [code, extra] of Object.entries(missingVideoKeys)) {
  Object.assign(translations[code], extra);
}

// The intro video is live, so the old "back in a few days" fallback is no
// longer true. Rewritten in the locales that already carried the key (pl/uk/sw
// get theirs from missingVideoKeys above), in file order.
const fallbacks = {
  en: 'The video could not load — refresh, or watch it in the tools.',
  fr: 'La vidéo n’a pas pu se charger — actualisez, ou regardez-la dans les outils.',
  es: 'No se pudo cargar el video — actualiza, o míralo en las herramientas.',
  zh: '视频无法加载 — 请刷新，或在工具中观看。',
  hi: 'वीडियो लोड नहीं हो सका — रीफ़्रेश करें, या इसे टूल्स में देखें।',
  fil: 'Hindi na-load ang video — i-refresh, o panoorin ito sa tools.',
  pl: 'Nie udało się załadować wideo — odśwież lub obejrzyj je w narzędziach.',
  uk: 'Відео не вдалося завантажити — оновіть сторінку або перегляньте його в інструментах.',
  sw: 'Video haikupakia — onyesha upya, au itazame kwenye zana.'
};

const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. Translation type — members live on one long line ending `devHostPrompt: string;};`.
const typeMembers = Object.keys(english).map((key) => `${key}: string`).join('; ');
if (!source.includes('devHostPrompt: string;};')) {
  throw new Error('Could not locate the Translation type tail (devHostPrompt).');
}
source = source.replace('devHostPrompt: string;};', `devHostPrompt: string; ${typeMembers};};`);

// 2. English catalog — its block closes with `devHostPrompt: '...',\n};`.
const englishTail = /(devHostPrompt: '(?:[^'\\]|\\.)*'),?\n\};/;
if (!englishTail.test(source)) throw new Error('Could not locate the English catalog tail.');
source = source.replace(englishTail, (m, head) => `${head}, ${kv(english)}\n};`);

// 3. Per-locale override blocks — each ends `...devHostPrompt: '...' },` (or ` }`
//    for the final `sw` block). Append the new keys before that closing brace.
let touched = 0;
source = source.replace(
  /^( {2}([a-z]{2,3}): \{ \.\.\.english, )([\s\S]*?)( \},?)$/gm,
  (match, head, code, body, tail) => {
    const map = translations[code];
    if (!map) return match;
    touched += 1;
    // The body may already carry a trailing comma before the closing brace.
    return `${head}${body.replace(/,\s*$/, '')}, ${kv(map)}${tail}`;
  }
);
if (touched !== 8) throw new Error(`Expected 8 locale blocks, patched ${touched}.`);

// 4. Rewrite the video fallback line in all 9 locales, in file order.
const order = ['en', 'fr', 'es', 'zh', 'hi', 'fil', 'pl', 'uk', 'sw'];
let fallbackIndex = 0;
source = source.replace(
  /tourVideoFallback: '(?:[^'\\]|\\.)*'/g,
  () => `tourVideoFallback: '${escape(fallbacks[order[fallbackIndex++]])}'`
);
if (fallbackIndex !== order.length) {
  throw new Error(`Expected ${order.length} video-fallback values, found ${fallbackIndex}.`);
}

fs.writeFileSync(file, source);
console.log('Injected greeter-popup offer keys into src/lib/i18n.ts');
