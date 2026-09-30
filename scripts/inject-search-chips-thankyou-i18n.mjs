#!/usr/bin/env node
/**
 * One-off maintenance script: injects the ⌘K scoping-chip short labels and the
 * thank-you/wizard chrome keys into src/lib/i18n.ts, so the locale-parity guard
 * (scripts/audit-i18n.mjs) stays green across all 9 locales.
 *
 * Scope note: the thank-you page's *flow prose* (variant titles/leads, the four
 * step bodies) moves to `src/lib/thankyou.ts` as canonical English — the same
 * rule as the manual and the custody page, because it is operational honesty
 * about what just happened to someone's data. Only the chrome (buttons, heading,
 * meta) goes through the catalog.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  searchShortPages: 'Pages',
  searchShortPosts: 'Posts',
  searchShortFaq: 'FAQ',
  searchShortTemplates: 'Templates',
  searchShortDocuments: 'Documents',
  searchShortManual: 'Manual',
  searchShortLegal: 'Legal',
  searchShortFeeds: 'Sources',
  searchShortTools: 'Tools',
  searchShortTasks: 'Tasks',
  thanksPageTitle: 'Thank you — what happens next · OpenStrata',
  thanksMetaDescription:
    'What just happened on OpenStrata, and the four steps that come next: keep your configuration, register the building, connect your host, set the legal baseline.',
  thanksBackToWizard: 'Back to the wizard',
  thanksSeeEveryModule: 'See every module',
  thanksNextTitle: 'What happens next',
  thanksNoHiddenSteps: 'No hidden steps:',
  thanksNoHiddenStepsBody:
    'nothing was published, emailed, or charged. OpenStrata is software — not an unlicensed management company — and it never holds the money: council keys stay on council hardware wallets.',
  thanksFrameworkDocs: 'Framework docs',
  thanksComplianceRef: 'BC compliance reference',
  wizardWhatNext: 'What happens next'
};

const translations = {
  fr: {
    searchShortPages: 'Pages',
    searchShortPosts: 'Articles',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'Modèles',
    searchShortDocuments: 'Documents',
    searchShortManual: 'Manuel',
    searchShortLegal: 'Juridique',
    searchShortFeeds: 'Sources',
    searchShortTools: 'Outils',
    searchShortTasks: 'Tâches',
    thanksPageTitle: 'Merci — et maintenant · OpenStrata',
    thanksMetaDescription:
      'Ce qui vient de se passer sur OpenStrata et les quatre étapes qui suivent : garder votre configuration, enregistrer le bâtiment, connecter votre hôte, poser la base légale.',
    thanksBackToWizard: 'Retour à l’assistant',
    thanksSeeEveryModule: 'Voir tous les modules',
    thanksNextTitle: 'Et maintenant',
    thanksNoHiddenSteps: 'Aucune étape cachée :',
    thanksNoHiddenStepsBody:
      'rien n’a été publié, envoyé ni facturé. OpenStrata est un logiciel — pas une société de gestion sans licence — et il ne détient jamais l’argent : les clés du conseil restent sur les portefeuilles matériels du conseil.',
    thanksFrameworkDocs: 'Documentation',
    thanksComplianceRef: 'Référence de conformité BC',
    wizardWhatNext: 'Et maintenant'
  },
  es: {
    searchShortPages: 'Páginas',
    searchShortPosts: 'Publicaciones',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'Plantillas',
    searchShortDocuments: 'Documentos',
    searchShortManual: 'Manual',
    searchShortLegal: 'Legal',
    searchShortFeeds: 'Fuentes',
    searchShortTools: 'Herramientas',
    searchShortTasks: 'Tareas',
    thanksPageTitle: 'Gracias — qué sigue · OpenStrata',
    thanksMetaDescription:
      'Qué acaba de pasar en OpenStrata y los cuatro pasos que siguen: guardar tu configuración, registrar el edificio, conectar tu host, fijar la base legal.',
    thanksBackToWizard: 'Volver al asistente',
    thanksSeeEveryModule: 'Ver todos los módulos',
    thanksNextTitle: 'Qué sigue',
    thanksNoHiddenSteps: 'Sin pasos ocultos:',
    thanksNoHiddenStepsBody:
      'no se publicó, envió ni cobró nada. OpenStrata es software — no una empresa de gestión sin licencia — y nunca custodia el dinero: las llaves del consejo se quedan en sus carteras de hardware.',
    thanksFrameworkDocs: 'Documentación',
    thanksComplianceRef: 'Referencia de cumplimiento BC',
    wizardWhatNext: 'Qué sigue'
  },
  zh: {
    searchShortPages: '页面',
    searchShortPosts: '文章',
    searchShortFaq: 'FAQ',
    searchShortTemplates: '模板',
    searchShortDocuments: '文档',
    searchShortManual: '手册',
    searchShortLegal: '法律',
    searchShortFeeds: '来源',
    searchShortTools: '工具',
    searchShortTasks: '待办',
    thanksPageTitle: '谢谢 — 接下来做什么 · OpenStrata',
    thanksMetaDescription:
      '刚才在 OpenStrata 发生了什么，以及接下来的四步：保留配置、登记楼宇、连接主机、设定法律基线。',
    thanksBackToWizard: '返回向导',
    thanksSeeEveryModule: '查看全部模块',
    thanksNextTitle: '接下来做什么',
    thanksNoHiddenSteps: '没有隐藏步骤：',
    thanksNoHiddenStepsBody:
      '没有发布、发送或收取任何东西。OpenStrata 是软件 — 不是无牌管理公司 — 也从不保管钱：理事会的钥匙留在理事会的硬件钱包里。',
    thanksFrameworkDocs: '框架文档',
    thanksComplianceRef: 'BC 合规参考',
    wizardWhatNext: '接下来做什么'
  },
  hi: {
    searchShortPages: 'पृष्ठ',
    searchShortPosts: 'पोस्ट',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'टेम्पलेट',
    searchShortDocuments: 'दस्तावेज़',
    searchShortManual: 'मैनुअल',
    searchShortLegal: 'कानूनी',
    searchShortFeeds: 'स्रोत',
    searchShortTools: 'टूल',
    searchShortTasks: 'काम',
    thanksPageTitle: 'धन्यवाद — आगे क्या · OpenStrata',
    thanksMetaDescription:
      'OpenStrata पर अभी क्या हुआ, और आगे के चार कदम: कॉन्फ़िगरेशन सहेजें, इमारत पंजीकृत करें, होस्ट जोड़ें, कानूनी आधार तय करें।',
    thanksBackToWizard: 'विज़ार्ड पर वापस',
    thanksSeeEveryModule: 'सभी मॉड्यूल देखें',
    thanksNextTitle: 'आगे क्या',
    thanksNoHiddenSteps: 'कोई छिपा कदम नहीं:',
    thanksNoHiddenStepsBody:
      'कुछ भी प्रकाशित, भेजा या वसूला नहीं गया। OpenStrata सॉफ़्टवेयर है — बिना लाइसेंस की प्रबंधन कंपनी नहीं — और पैसा कभी नहीं रखता: काउंसिल की चाबियाँ काउंसिल के हार्डवेयर वॉलेट में रहती हैं।',
    thanksFrameworkDocs: 'फ़्रेमवर्क दस्तावेज़',
    thanksComplianceRef: 'BC अनुपालन संदर्भ',
    wizardWhatNext: 'आगे क्या'
  },
  fil: {
    searchShortPages: 'Mga Page',
    searchShortPosts: 'Mga Post',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'Mga Template',
    searchShortDocuments: 'Dokumento',
    searchShortManual: 'Manwal',
    searchShortLegal: 'Legal',
    searchShortFeeds: 'Sanggunian',
    searchShortTools: 'Mga Tool',
    searchShortTasks: 'Mga Gawain',
    thanksPageTitle: 'Salamat — ano ang susunod · OpenStrata',
    thanksMetaDescription:
      'Ano ang nangyari sa OpenStrata at ang apat na susunod na hakbang: panatilihin ang configuration, i-rehistro ang gusali, ikonekta ang host, itakda ang legal na batayan.',
    thanksBackToWizard: 'Bumalik sa wizard',
    thanksSeeEveryModule: 'Tingnan lahat ng module',
    thanksNextTitle: 'Ano ang susunod',
    thanksNoHiddenSteps: 'Walang nakatagong hakbang:',
    thanksNoHiddenStepsBody:
      'walang na-publish, naipadala, o siningil. Ang OpenStrata ay software — hindi lisensyadong kompanya ng pamamahala — at hindi kailanman humahawak ng pera: ang susi ng konseho ay nasa hardware wallet ng konseho.',
    thanksFrameworkDocs: 'Mga dokumento ng framework',
    thanksComplianceRef: 'Sanggunian sa BC compliance',
    wizardWhatNext: 'Ano ang susunod'
  },
  pl: {
    searchShortPages: 'Strony',
    searchShortPosts: 'Posty',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'Szablony',
    searchShortDocuments: 'Dokumenty',
    searchShortManual: 'Podręcznik',
    searchShortLegal: 'Prawo',
    searchShortFeeds: 'Źródła',
    searchShortTools: 'Narzędzia',
    searchShortTasks: 'Zadania',
    thanksPageTitle: 'Dziękujemy — co dalej · OpenStrata',
    thanksMetaDescription:
      'Co właśnie stało się w OpenStrata i cztery kolejne kroki: zachowaj konfigurację, zarejestruj budynek, podłącz host, ustal podstawę prawną.',
    thanksBackToWizard: 'Wróć do kreatora',
    thanksSeeEveryModule: 'Zobacz wszystkie moduły',
    thanksNextTitle: 'Co dalej',
    thanksNoHiddenSteps: 'Żadnych ukrytych kroków:',
    thanksNoHiddenStepsBody:
      'nic nie zostało opublikowane, wysłane ani obciążone. OpenStrata to oprogramowanie — nie nielicencjonowana firma zarządzająca — i nigdy nie przechowuje pieniędzy: klucze rady zostają w sprzętowych portfelach rady.',
    thanksFrameworkDocs: 'Dokumentacja frameworku',
    thanksComplianceRef: 'Reference zgodności BC',
    wizardWhatNext: 'Co dalej'
  },
  uk: {
    searchShortPages: 'Сторінки',
    searchShortPosts: 'Публікації',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'Шаблони',
    searchShortDocuments: 'Документи',
    searchShortManual: 'Посібник',
    searchShortLegal: 'Право',
    searchShortFeeds: 'Джерела',
    searchShortTools: 'Інструменти',
    searchShortTasks: 'Завдання',
    thanksPageTitle: 'Дякуємо — що далі · OpenStrata',
    thanksMetaDescription:
      'Що щойно сталося в OpenStrata і чотири наступні кроки: зберегти конфігурацію, зареєструвати будинок, підʼєднати хост, визначити правову базу.',
    thanksBackToWizard: 'Назад до майстра',
    thanksSeeEveryModule: 'Переглянути всі модулі',
    thanksNextTitle: 'Що далі',
    thanksNoHiddenSteps: 'Жодних прихованих кроків:',
    thanksNoHiddenStepsBody:
      'нічого не опубліковано, не надіслано й не стягнуто. OpenStrata — це програмне забезпечення, а не безліцензійна керуюча компанія — і воно ніколи не тримає грошей: ключі ради залишаються на апаратних гаманцях ради.',
    thanksFrameworkDocs: 'Документація фреймворку',
    thanksComplianceRef: 'Довідник відповідності BC',
    wizardWhatNext: 'Що далі'
  },
  sw: {
    searchShortPages: 'Kurasa',
    searchShortPosts: 'Machapisho',
    searchShortFaq: 'FAQ',
    searchShortTemplates: 'Violezo',
    searchShortDocuments: 'Nyaraka',
    searchShortManual: 'Mwongozo',
    searchShortLegal: 'Sheria',
    searchShortFeeds: 'Vyanzo',
    searchShortTools: 'Zana',
    searchShortTasks: 'Kazi',
    thanksPageTitle: 'Asante — kifuacho chake · OpenStrata',
    thanksMetaDescription:
      'Kile kilichotokea kwenye OpenStrata na hatua nne zinazofuata: hifadhi usanidi, sajili jengo, ungana na mwenyeji, weka mstari wa kisheria.',
    thanksBackToWizard: 'Rudi kwenye msaada',
    thanksSeeEveryModule: 'Ona moduli zote',
    thanksNextTitle: 'Kifuacho chake',
    thanksNoHiddenSteps: 'Hakuna hatua zilizofichwa:',
    thanksNoHiddenStepsBody:
      'hakuna kilichochapishwa, kutumwa au kupatiwa malipo. OpenStrata ni programu — si kampuni ya usimamizi isiyo na leseni — na haishiki pesa kamwe: funguo za baraza zinabaki kwenye pochi za maunzi za baraza.',
    thanksFrameworkDocs: 'Nyaraka za mfumo',
    thanksComplianceRef: 'Marejeleo ya uzingatiaji wa BC',
    wizardWhatNext: 'Kifuacho chake'
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
  `Injected ${Object.keys(english).length} search-chip/thank-you keys into src/lib/i18n.ts across 9 locales`
);
