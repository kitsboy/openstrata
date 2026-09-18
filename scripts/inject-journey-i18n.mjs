#!/usr/bin/env node
/**
 * One-off maintenance script: injects the "start here" journey-strip keys into
 * src/lib/i18n.ts so the locale-parity guard (scripts/audit-i18n.mjs) stays
 * green across all 9 locales.
 *
 * Adds the keys to the Translation type, the English base catalog, and each of
 * the 8 per-locale override blocks (fr, es, zh, hi, fil, pl, uk, sw).
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  journeyTitle: 'Your path to live',
  journeyStep1: 'Explore the modules',
  journeyHint1: 'Every workflow runs on demo data — poke at it before you commit.',
  journeyStep2: 'Configure your building',
  journeyHint2: 'Units, funds, bylaws — generate your strata config in eight steps.',
  journeyStep3: 'Register and go live',
  journeyHint3: 'Stand up your host, then run the real building on real books.'
};

const translations = {
  fr: {
    journeyTitle: 'Votre parcours vers la mise en service',
    journeyStep1: 'Explorez les modules',
    journeyHint1: 'Chaque flux fonctionne sur des données de démo — testez avant de vous engager.',
    journeyStep2: 'Configurez votre immeuble',
    journeyHint2: 'Unités, fonds, règlements — générez votre configuration en huit étapes.',
    journeyStep3: 'Enregistrez et passez en production',
    journeyHint3: 'Installez votre hôte, puis gérez l’immeuble sur de vrais comptes.'
  },
  es: {
    journeyTitle: 'Tu camino hacia la puesta en marcha',
    journeyStep1: 'Explora los módulos',
    journeyHint1: 'Cada flujo funciona con datos de demostración: pruébalo antes de comprometerte.',
    journeyStep2: 'Configura tu edificio',
    journeyHint2: 'Unidades, fondos y estatutos: genera tu configuración en ocho pasos.',
    journeyStep3: 'Registra y entra en producción',
    journeyHint3: 'Levanta tu host y luego administra el edificio con cuentas reales.'
  },
  zh: {
    journeyTitle: '你的上线路径',
    journeyStep1: '浏览各模块',
    journeyHint1: '所有流程都运行在演示数据上 — 先试用再决定。',
    journeyStep2: '配置你的楼宇',
    journeyHint2: '单元、资金、章程 — 八步生成你的社区配置。',
    journeyStep3: '注册并正式上线',
    journeyHint3: '搭好你的主机，然后用真实账目运营这栋楼。'
  },
  hi: {
    journeyTitle: 'लाइव होने तक का आपका मार्ग',
    journeyStep1: 'मॉड्यूल देखें',
    journeyHint1: 'हर वर्कफ़्लो डेमो डेटा पर चलता है — पहले आज़माएँ।',
    journeyStep2: 'अपनी बिल्डिंग कॉन्फ़िगर करें',
    journeyHint2: 'यूनिट, फंड, उपनियम — आठ चरणों में अपना कॉन्फ़िग बनाएँ।',
    journeyStep3: 'रजिस्टर करें और लाइव जाएँ',
    journeyHint3: 'अपना होस्ट तैयार करें, फिर असली खातों पर बिल्डिंग चलाएँ।'
  },
  fil: {
    journeyTitle: 'Ang landas mo tungo sa live',
    journeyStep1: 'Tingnan ang mga module',
    journeyHint1: 'Nasa demo data ang lahat ng workflow — subukan bago magtuloy.',
    journeyStep2: 'I-configure ang iyong building',
    journeyHint2: 'Unit, pondo at bylaw — buuin ang config sa walong hakbang.',
    journeyStep3: 'Magrehistro at mag-live',
    journeyHint3: 'Ihanda ang host, tapos patakbuhin ang building sa totoong accounts.'
  },
  pl: {
    journeyTitle: 'Twoja droga do wdrożenia',
    journeyStep1: 'Poznaj moduły',
    journeyHint1: 'Każdy przepływ działa na danych demo — przetestuj, zanim się zdecydujesz.',
    journeyStep2: 'Skonfiguruj swój budynek',
    journeyHint2: 'Lokale, fundusze, regulamin — wygeneruj konfigurację w ośmiu krokach.',
    journeyStep3: 'Zarejestruj i wejdź na produkcję',
    journeyHint3: 'Postaw swój host, a potem prowadź budynek na prawdziwych księgach.'
  },
  uk: {
    journeyTitle: 'Ваш шлях до запуску',
    journeyStep1: 'Огляньте модулі',
    journeyHint1: 'Усі процеси працюють на демо-даних — спробуйте перед вибором.',
    journeyStep2: 'Налаштуйте свою будівлю',
    journeyHint2: 'Юніти, фонди, статут — згенеруйте конфігурацію за вісім кроків.',
    journeyStep3: 'Зареєструйте та запустіть',
    journeyHint3: 'Підніміть свій хост, а потім ведіть будівлю на справжніх рахунках.'
  },
  sw: {
    journeyTitle: 'Njia yako hadi kuanza',
    journeyStep1: 'Chunguza moduli',
    journeyHint1: 'Kila mtiririko hutumia data ya majaribio — jaribu kabla ya kuamua.',
    journeyStep2: 'Sanidi jengo lako',
    journeyHint2: 'Vitengo, fedha na kanuni — tengeneza mipangilio kwa hatua nane.',
    journeyStep3: 'Jisajili na uanze',
    journeyHint3: 'Andaa host yako, kisha endesha jengo kwa hesabu za kweli.'
  }
};

const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. Translation type — its members live on one long line ending `tourHow3: string;};`.
const typeMembers = Object.keys(english).map((key) => `${key}: string`).join('; ');
const typeTail = 'tourHow3: string;};';
if (!source.includes(typeTail)) throw new Error('Could not locate the Translation type tail.');
source = source.replace(typeTail, `tourHow3: string; ${typeMembers};};`);

// 2. English catalog — its block closes with `tourHow3: '...'\n};`.
const englishTail = /(tourHow3: '(?:[^'\\]|\\.)*'),?\n\};/;
if (!englishTail.test(source)) throw new Error('Could not locate the English catalog tail.');
source = source.replace(englishTail, (m, head) => `${head}, ${kv(english)}\n};`);

// 3. Per-locale override blocks — each ends `...tourHow3: '...', },` (or ` }` for
//    the final `sw` block). Append the new keys before that closing brace.
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
console.log('Injected journey-strip keys into src/lib/i18n.ts');
