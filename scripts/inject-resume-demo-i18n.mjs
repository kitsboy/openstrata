#!/usr/bin/env node
/**
 * One-off maintenance script: injects the v0.3.22 UX copy (resume chip, demo
 * banner, search group labels) into src/lib/i18n.ts, so the locale-parity
 * guard (scripts/audit-i18n.mjs) stays green across all 9 locales.
 *
 * Same positional anchoring as `inject-tasks-start-i18n.mjs`: the English
 * catalog and the Translation type are found by their own headings rather than
 * by whichever key happens to be last.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  resumeTitle: 'Continue where you left off',
  resumeOf: 'of',
  resumeProgress: 'in progress',
  resumeAction: 'Continue',
  resumeDismiss: 'Dismiss and discard the draft',
  resumedFromDraft: 'Draft restored — you are back where you left off.',
  searchDocuments: 'Print-ready documents',
  searchManual: 'Manual',
  demoBannerTitle: 'You are in demo mode',
  demoBannerBody:
    'Everything here is sample data, and nothing you type is saved to an account. Your building draft is kept on this device only.',
  demoBannerCta: 'Save my building',
  demoBannerDismiss: 'Dismiss for a week'
};

const translations = {
  fr: {
    resumeTitle: 'Reprenez là où vous en étiez',
    resumeOf: 'sur',
    resumeProgress: 'en cours',
    resumeAction: 'Reprendre',
    resumeDismiss: 'Fermer et abandonner le brouillon',
    resumedFromDraft: 'Brouillon restauré — vous êtes revenu là où vous vous étiez arrêté.',
    searchDocuments: 'Documents prêts à imprimer',
    searchManual: 'Manuel',
    demoBannerTitle: 'Vous êtes en mode démo',
    demoBannerBody:
      'Tout ici est un exemple et rien de ce que vous saisissez n’est enregistré dans un compte. Votre brouillon d’immeuble reste sur cet appareil uniquement.',
    demoBannerCta: 'Enregistrer mon immeuble',
    demoBannerDismiss: 'Fermer pour une semaine'
  },
  es: {
    resumeTitle: 'Continúa donde lo dejaste',
    resumeOf: 'de',
    resumeProgress: 'en curso',
    resumeAction: 'Continuar',
    resumeDismiss: 'Descartar y borrar el borrador',
    resumedFromDraft: 'Borrador restaurado: sigues donde lo dejaste.',
    searchDocuments: 'Documentos listos para imprimir',
    searchManual: 'Manual',
    demoBannerTitle: 'Estás en modo demo',
    demoBannerBody:
      'Todo aquí son datos de muestra y nada de lo que escribas se guarda en una cuenta. Tu borrador del edificio se queda solo en este dispositivo.',
    demoBannerCta: 'Guardar mi edificio',
    demoBannerDismiss: 'Ocultar por una semana'
  },
  zh: {
    resumeTitle: '从上次离开的地方继续',
    resumeOf: '/',
    resumeProgress: '进行中',
    resumeAction: '继续',
    resumeDismiss: '关闭并丢弃草稿',
    resumedFromDraft: '草稿已恢复——您回到了上次离开的地方。',
    searchDocuments: '可打印文档',
    searchManual: '使用手册',
    demoBannerTitle: '您正处于演示模式',
    demoBannerBody: '这里的一切都是示例数据，您输入的内容不会保存到任何账户。您的楼宇草稿只保存在本设备上。',
    demoBannerCta: '保存我的楼宇',
    demoBannerDismiss: '一周内不再显示'
  },
  hi: {
    resumeTitle: 'जहाँ छोड़ा था वहीँ से जारी रखें',
    resumeOf: '/',
    resumeProgress: 'जारी है',
    resumeAction: 'जारी रखें',
    resumeDismiss: 'हटाएँ और ड्राफ़्ट छोड़ें',
    resumedFromDraft: 'ड्राफ़्ट पुनःस्थापित — आप वहीँ से शुरू कर रहे हैं जहाँ छोड़ा था।',
    searchDocuments: 'प्रिंट-योग्य दस्तावेज़',
    searchManual: 'मैनुअल',
    demoBannerTitle: 'आप डेमो मोड में हैं',
    demoBannerBody: 'यहाँ सब कुछ नमूना डेटा है और आपके द्वारा टाइप किया गया कुछ भी खाते में नहीं सहेजा जाता। आपका इमारत ड्राफ़्ट केवल इसी डिवाइस पर रहता है।',
    demoBannerCta: 'मेरी इमारत सहेजें',
    demoBannerDismiss: 'एक सप्ताह के लिए हटाएँ'
  },
  fil: {
    resumeTitle: 'Ituloy kung saan ka tumigil',
    resumeOf: 'ng',
    resumeProgress: 'kasalukuyan',
    resumeAction: 'Ituloy',
    resumeDismiss: 'Isara at itapon ang draft',
    resumedFromDraft: 'Naibalik ang draft — nasa pinagtagpuan ka muli.',
    searchDocuments: 'Handa nang i-print na dokumento',
    searchManual: 'Manwal',
    demoBannerTitle: 'Nasa demo mode ka',
    demoBannerBody:
      'Lahat dito ay sample data at walang mase-save sa account sa iyong itinatype. Ang building draft mo ay nasa device na ito lamang.',
    demoBannerCta: 'I-save ang gusali ko',
    demoBannerDismiss: 'Itago nang isang linggo'
  },
  pl: {
    resumeTitle: 'Kontynuuj od miejsca, w którym skończyłeś',
    resumeOf: 'z',
    resumeProgress: 'w toku',
    resumeAction: 'Kontynuuj',
    resumeDismiss: 'Zamknij i odrzuć szkic',
    resumedFromDraft: 'Szkic przywrócony — jesteś tam, gdzie skończyłeś.',
    searchDocuments: 'Dokumenty gotowe do druku',
    searchManual: 'Podręcznik',
    demoBannerTitle: 'Jesteś w trybie demo',
    demoBannerBody:
      'Wszystko tutaj to dane przykładowe, a nic z tego, co wpiszesz, nie trafia na konto. Szkic budynku pozostaje wyłącznie na tym urządzeniu.',
    demoBannerCta: 'Zapisz mój budynek',
    demoBannerDismiss: 'Ukryj na tydzień'
  },
  uk: {
    resumeTitle: 'Продовжте з того місця, де зупинилися',
    resumeOf: 'з',
    resumeProgress: 'триває',
    resumeAction: 'Продовжити',
    resumeDismiss: 'Закрити й відкинути чернетку',
    resumedFromDraft: 'Чернетку відновлено — ви повернулися туди, де зупинилися.',
    searchDocuments: 'Документи, готові до друку',
    searchManual: 'Посібник',
    demoBannerTitle: 'Ви в демо-режимі',
    demoBannerBody:
      'Усе тут — зразкові дані, і нічого з введеного не зберігається в акаунті. Чернетка вашого будинку залишається лише на цьому пристрої.',
    demoBannerCta: 'Зберегти мій будинок',
    demoBannerDismiss: 'Сховати на тиждень'
  },
  sw: {
    resumeTitle: 'Endelea ulipofika',
    resumeOf: 'kati ya',
    resumeProgress: 'inaendelea',
    resumeAction: 'Endelea',
    resumeDismiss: 'Funga na uondoe rasimu',
    resumedFromDraft: 'Rasimu imerejelewa — umefika ulipofika.',
    searchDocuments: 'Nyaraka tayari kwa kuchapisha',
    searchManual: 'Mwongozo',
    demoBannerTitle: 'Uko katika hali ya onyesho',
    demoBannerBody:
      'Kila kitu hapa ni data ya mfano, na chochote utachoandika hakiwekwa kwenye akaunti. Rasimu ya jengo lako inabaki kwenye kifaa hiki tu.',
    demoBannerCta: 'Hifadhi jengo langu',
    demoBannerDismiss: 'Ficha kwa wiki moja'
  }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. Translation type members, before the type's own closing brace.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
source =
  source.slice(0, typeEnd) +
  Object.keys(english).map((key) => `${key}: string;`).join(' ') +
  ' ' +
  source.slice(typeEnd);

// 2. English values, before the catalog's closing brace.
const catalogStart = source.indexOf('const english: Translation = {');
const catalogEnd = source.indexOf('\n};', catalogStart);
if (catalogStart === -1 || catalogEnd === -1) {
  throw new Error('Could not locate the English catalog.');
}
source =
  source.slice(0, catalogEnd).replace(/,\s*$/, '') +
  `, ${kv(english)}` +
  source.slice(catalogEnd);

// 3. Per-locale overrides.
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
  `Injected ${Object.keys(english).length} resume/demo/search keys into src/lib/i18n.ts across 9 locales`
);
