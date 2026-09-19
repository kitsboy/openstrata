#!/usr/bin/env node
/**
 * One-off maintenance script: injects the merged task-list and first-visit
 * start-panel copy into src/lib/i18n.ts, so the locale-parity guard
 * (scripts/audit-i18n.mjs) stays green across all 9 locales.
 *
 * Same positional anchoring as `inject-custody-i18n.mjs`: the English catalog and
 * the Translation type are found by their own headings rather than by whichever
 * key happens to be last, because that anchor broke every time a later injector
 * appended one.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  tasksTitle: 'What needs doing',
  tasksHint: 'One list, in the order that matters — deadlines first, then finishing your setup.',
  tasksEmpty: 'Nothing is due. The building is up to date.',
  tasksMore: 'more in the full list',
  tasksHide: 'Hide this list',
  tasksShow: 'Show what needs doing',
  tasksOverdue: 'overdue',
  tasksSoon: 'soon',
  tasksRoutine: 'routine',
  tasksSetup: 'setup',
  startEyebrow: 'Start here',
  startTitle: 'What would you like to do?',
  startIntro:
    'Three ways in. The demo view is sample data, and nothing is saved to an account.',
  startExplore: 'I am just looking',
  startExploreHint: 'See a full working dashboard — units, funds, the ledger and compliance.',
  startExploreAction: 'Show me around',
  startSetup: 'I am setting up a building',
  startSetupHint: 'Generate a building file, its units, funds and bylaws in about ten minutes.',
  startSetupAction: 'Start the wizard',
  startSignIn: 'I have an account',
  startSignInHint: 'Sign in to your own workspace and its live data.',
  startSignInAction: 'Sign in',
  startNote: 'Your choice stays on this device. No account needed to look around.'
};

const translations = {
  fr: {
    tasksTitle: 'Ce qu’il reste à faire',
    tasksHint:
      'Une seule liste, dans l’ordre qui compte — les échéances d’abord, puis la fin de votre configuration.',
    tasksEmpty: 'Rien à échéance. L’immeuble est à jour.',
    tasksMore: 'de plus dans la liste complète',
    tasksHide: 'Masquer cette liste',
    tasksShow: 'Afficher ce qu’il reste à faire',
    tasksOverdue: 'en retard',
    tasksSoon: 'bientôt',
    tasksRoutine: 'courant',
    tasksSetup: 'configuration',
    startEyebrow: 'Commencer ici',
    startTitle: 'Que voulez-vous faire ?',
    startIntro:
      'Trois façons d’entrer. La vue démo utilise des données d’exemple et rien n’est enregistré dans un compte.',
    startExplore: 'Je regarde seulement',
    startExploreHint:
      'Voir un tableau de bord complet — unités, fonds, grand livre et conformité.',
    startExploreAction: 'Faites-moi visiter',
    startSetup: 'Je configure un immeuble',
    startSetupHint:
      'Générez un dossier d’immeuble, ses unités, ses fonds et ses règlements en dix minutes.',
    startSetupAction: 'Lancer l’assistant',
    startSignIn: 'J’ai déjà un compte',
    startSignInHint: 'Connectez-vous à votre espace et à ses données en direct.',
    startSignInAction: 'Se connecter',
    startNote: 'Votre choix reste sur cet appareil. Aucun compte requis pour regarder.'
  },
  es: {
    tasksTitle: 'Qué falta por hacer',
    tasksHint:
      'Una sola lista, en el orden que importa: primero los plazos y después terminar la configuración.',
    tasksEmpty: 'Nada pendiente. El edificio está al día.',
    tasksMore: 'más en la lista completa',
    tasksHide: 'Ocultar esta lista',
    tasksShow: 'Mostrar lo que falta',
    tasksOverdue: 'vencido',
    tasksSoon: 'pronto',
    tasksRoutine: 'rutina',
    tasksSetup: 'configuración',
    startEyebrow: 'Empiece aquí',
    startTitle: '¿Qué quiere hacer?',
    startIntro:
      'Tres formas de entrar. La vista de demostración usa datos de muestra y no se guarda nada en una cuenta.',
    startExplore: 'Solo estoy mirando',
    startExploreHint:
      'Ver un panel completo: unidades, fondos, libro mayor y cumplimiento normativo.',
    startExploreAction: 'Muéstreme',
    startSetup: 'Estoy configurando un edificio',
    startSetupHint:
      'Genere un archivo del edificio, sus unidades, fondos y estatutos en diez minutos.',
    startSetupAction: 'Iniciar el asistente',
    startSignIn: 'Ya tengo una cuenta',
    startSignInHint: 'Entre en su propio espacio de trabajo y sus datos en vivo.',
    startSignInAction: 'Entrar',
    startNote: 'Su elección se queda en este dispositivo. No hace falta cuenta para mirar.'
  },
  zh: {
    tasksTitle: '还需要做什么',
    tasksHint: '一张清单，按重要顺序排列——先处理期限，再完成设置。',
    tasksEmpty: '没有到期事项，一切都在掌握中。',
    tasksMore: '项在完整清单中',
    tasksHide: '隐藏此清单',
    tasksShow: '显示待办事项',
    tasksOverdue: '已逾期',
    tasksSoon: '即将到期',
    tasksRoutine: '常规',
    tasksSetup: '设置',
    startEyebrow: '从这里开始',
    startTitle: '您想做什么？',
    startIntro: '三种进入方式。演示视图使用示例数据，不会保存到任何账户。',
    startExplore: '我只是看看',
    startExploreHint: '查看完整的产品界面——单元、基金、账本与合规。',
    startExploreAction: '带我看看',
    startSetup: '我要设置一栋楼',
    startSetupHint: '大约十分钟生成楼宇档案、单元、基金和章程。',
    startSetupAction: '启动向导',
    startSignIn: '我已有账户',
    startSignInHint: '登录你自己的空间和实时数据。',
    startSignInAction: '登录',
    startNote: '你的选择只保存在本设备上。浏览无需账户。'
  },
  hi: {
    tasksTitle: 'क्या करना बाकी है',
    tasksHint: 'एक ही सूची, सही क्रम में — पहले समय-सीमाएँ, फिर सेटअप पूरा करना।',
    tasksEmpty: 'कुछ बाकी नहीं है। इमारत पूरी तरह अद्यतित है।',
    tasksMore: 'और पूरी सूची में',
    tasksHide: 'यह सूची छिपाएँ',
    tasksShow: 'देखें क्या करना बाकी है',
    tasksOverdue: 'समय बीत गया',
    tasksSoon: 'जल्द',
    tasksRoutine: 'सामान्य',
    tasksSetup: 'सेटअप',
    startEyebrow: 'यहाँ से शुरू करें',
    startTitle: 'आप क्या करना चाहेंगे?',
    startIntro:
      'तीन तरीके। डेमो दृश्य नमूना डेटा दिखाता है और किसी खाते में कुछ भी सहेजा नहीं जाता।',
    startExplore: 'मैं बस देख रहा हूँ',
    startExploreHint: 'पूरा काम करता डैशबोर्ड देखें — यूनिट, फंड, बही और अनुपालन।',
    startExploreAction: 'मुझे दिखाइए',
    startSetup: 'मैं इमारत सेट कर रहा हूँ',
    startSetupHint: 'दस मिनट में इमारत की फ़ाइल, यूनिट, फंड और उपविधियाँ बनाएँ।',
    startSetupAction: 'विज़ार्ड शुरू करें',
    startSignIn: 'मेरा खाता है',
    startSignInHint: 'अपने वर्कस्पेस और लाइव डेटा में साइन इन करें।',
    startSignInAction: 'साइन इन',
    startNote: 'आपकी पसंद इसी डिवाइस पर रहती है। देखने के लिए खाता ज़रूरी नहीं।'
  },
  fil: {
    tasksTitle: 'Ano ang kailangan pang gawin',
    tasksHint:
      'Isang listahan, sa tamang pagkakasunod-sunod — mga deadline muna, tapos ang pagtatapos ng setup.',
    tasksEmpty: 'Walang nakatakdang gawin. Up to date ang gusali.',
    tasksMore: 'pa sa buong listahan',
    tasksHide: 'Itago ang listahang ito',
    tasksShow: 'Ipakita ang kailangan pang gawin',
    tasksOverdue: 'lampas na',
    tasksSoon: 'malapit na',
    tasksRoutine: 'karaniwan',
    tasksSetup: 'setup',
    startEyebrow: 'Magsimula dito',
    startTitle: 'Ano ang gusto mong gawin?',
    startIntro:
      'Tatlong paraan. Ang demo ay sample data at walang naiimbak sa isang account.',
    startExplore: 'Tumingin lang ako',
    startExploreHint:
      'Tingnan ang buong gumaganang dashboard — units, pondo, ledger at pagsunod.',
    startExploreAction: 'Ipakita sa akin',
    startSetup: 'Nagsesetup ako ng gusali',
    startSetupHint:
      'Gumawa ng building file, units, pondo at bylaws sa sampung minuto.',
    startSetupAction: 'Simulan ang wizard',
    startSignIn: 'May account na ako',
    startSignInHint: 'Mag-sign in sa sarili mong workspace at live na datos.',
    startSignInAction: 'Mag-sign in',
    startNote:
      'Nananatili sa device na ito ang pinili mo. Hindi kailangan ng account para tumingin.'
  },
  pl: {
    tasksTitle: 'Co pozostaje do zrobienia',
    tasksHint:
      'Jedna lista, w kolejności, która ma znaczenie — najpierw terminy, potem dokończenie konfiguracji.',
    tasksEmpty: 'Nic nie jest zaległe. Budynek jest na bieżąco.',
    tasksMore: 'więcej na pełnej liście',
    tasksHide: 'Ukryj tę listę',
    tasksShow: 'Pokaż, co zostało',
    tasksOverdue: 'zaległe',
    tasksSoon: 'wkrótce',
    tasksRoutine: 'rutynowe',
    tasksSetup: 'konfiguracja',
    startEyebrow: 'Zacznij tutaj',
    startTitle: 'Co chcesz zrobić?',
    startIntro:
      'Trzy drogi. Widok demo to dane przykładowe i nic nie jest zapisywane na koncie.',
    startExplore: 'Tylko oglądam',
    startExploreHint: 'Zobacz pełny działający pulpit — lokale, fundusze, księgę i zgodność.',
    startExploreAction: 'Pokaż mi',
    startSetup: 'Konfiguruję budynek',
    startSetupHint:
      'Wygeneruj plik budynku, jego lokale, fundusze i regulamin w dziesięć minut.',
    startSetupAction: 'Uruchom kreatora',
    startSignIn: 'Mam już konto',
    startSignInHint: 'Zaloguj się do swojego obszaru roboczego i danych na żywo.',
    startSignInAction: 'Zaloguj się',
    startNote: 'Twój wybór zostaje na tym urządzeniu. Konto nie jest potrzebne, by obejrzeć.'
  },
  uk: {
    tasksTitle: 'Що ще потрібно зробити',
    tasksHint:
      'Один список у правильному порядку — спершу строки, потім завершення налаштування.',
    tasksEmpty: 'Немає прострочених справ. Будинок в актуальному стані.',
    tasksMore: 'ще у повному списку',
    tasksHide: 'Сховати цей список',
    tasksShow: 'Показати, що залишилось',
    tasksOverdue: 'прострочено',
    tasksSoon: 'скоро',
    tasksRoutine: 'звичайне',
    tasksSetup: 'налаштування',
    startEyebrow: 'Почніть тут',
    startTitle: 'Що ви хочете зробити?',
    startIntro:
      'Три способи. Демо-режим показує зразкові дані, і нічого не зберігається в акаунті.',
    startExplore: 'Я лише дивлюся',
    startExploreHint:
      'Подивіться повноцінну панель — одиниці, фонди, реєстр і відповідність.',
    startExploreAction: 'Покажіть мені',
    startSetup: 'Я налаштовую будинок',
    startSetupHint:
      'Створіть файл будинку, одиниці, фонди та правила за десять хвилин.',
    startSetupAction: 'Почати майстер',
    startSignIn: 'У мене є акаунт',
    startSignInHint: 'Увійдіть у свій робочий простір і живі дані.',
    startSignInAction: 'Увійти',
    startNote: 'Ваш вибір залишається на цьому пристрої. Акаунт не потрібен, щоб оглянути.'
  },
  sw: {
    tasksTitle: 'Kinachohitajika kufanywa',
    tasksHint:
      'Orodha moja, kwa mpangilio unaofaa — tarehe za mwisho kwanza, kisha kumaliza usanidi.',
    tasksEmpty: 'Hakuna kinachodaiwa. Jengo liko sawa.',
    tasksMore: 'zaidi kwenye orodha kamili',
    tasksHide: 'Ficha orodha hii',
    tasksShow: 'Onyesha kinachohitajika',
    tasksOverdue: 'imechelewa',
    tasksSoon: 'hivi karibuni',
    tasksRoutine: 'kawaida',
    tasksSetup: 'usanidi',
    startEyebrow: 'Anza hapa',
    startTitle: 'Ungependa kufanya nini?',
    startIntro:
      'Njia tatu za kuingia. Mwonekano wa demo hutumia data ya mfano na hakuna kinachohifadhiwa kwenye akaunti.',
    startExplore: 'Natazama tu',
    startExploreHint: 'Ona dashibodi kamili — units, fedha, leja na uzingatiaji.',
    startExploreAction: 'Nionyeshe',
    startSetup: 'Nasanidi jengo',
    startSetupHint: 'Tengeneza faili la jengo, units, fedha na bylaws kwa dakika kumi.',
    startSetupAction: 'Anza mwongozo',
    startSignIn: 'Nina akaunti',
    startSignInHint: 'Ingia kwenye nafasi yako na data ya moja kwa moja.',
    startSignInAction: 'Ingia',
    startNote: 'Chaguo lako linabaki kwenye kifaa hiki. Hakuna akaunti inayohitajika kutazama.'
  }
};

const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
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
  `Injected ${Object.keys(english).length} task/start keys into src/lib/i18n.ts across 9 locales`
);
