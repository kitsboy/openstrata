#!/usr/bin/env node
/**
 * One-off maintenance script: injects the custody-page chrome and the checkout
 * payment-label copy into src/lib/i18n.ts, so the locale-parity guard
 * (scripts/audit-i18n.mjs) stays green across all 9 locales.
 *
 * Only page chrome goes through the catalog. The custody page's body prose lives
 * in `src/lib/custody.ts` in English, for the same reason the print-ready
 * documents and the user manual do: custody wording is the last place to accept
 * a machine translation of "we never hold your money".
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  custodyLink: 'How your money is held',
  custodyBadge: '0% custody',
  custodyPageTitle: 'How your money is held — OpenStrata',
  custodyMetaDescription:
    'Where a community’s money sits at every step, what OpenStrata can never do with it, and what a council can check.',
  custodyTitle: 'How your money is held',
  custodyIntro:
    'OpenStrata is software. It never holds, moves or has access to a community’s money — not in a bank account, not in a wallet, not in anyone’s pocket. Here is where the money actually sits at each step, and what we cannot do.',
  custodyFlowTitle: 'Where the money sits',
  custodyCantTitle: 'What OpenStrata cannot do',
  custodyCheckTitle: 'What your council can check, any time',
  custodyTodayTitle: 'Where this stands today',
  custodyCta: 'Ask us the hard question',
  custodyCtaNote: 'hello@giveabit.io — happy to answer it in plain language.',
  checkoutLabelTitle: 'Payment name',
  checkoutLabelHint:
    'Unique to OpenStrata. This exact name goes on the transfer, so it can never be mixed up with another building or another project.'
};

const translations = {
  fr: {
    custodyLink: 'Comment votre argent est détenu',
    custodyBadge: '0 % de garde',
    custodyPageTitle: 'Comment votre argent est détenu — OpenStrata',
    custodyMetaDescription:
      'Où se trouve l’argent d’une communauté à chaque étape, ce qu’OpenStrata ne pourra jamais en faire, et ce qu’un conseil peut vérifier.',
    custodyTitle: 'Comment votre argent est détenu',
    custodyIntro:
      'OpenStrata est un logiciel. Il ne détient jamais l’argent d’une communauté, ne le déplace pas et n’y a aucun accès — ni dans un compte bancaire, ni dans un portefeuille, ni dans la poche de qui que ce soit. Voici où se trouve réellement l’argent à chaque étape, et ce que nous ne pouvons pas faire.',
    custodyFlowTitle: 'Où se trouve l’argent',
    custodyCantTitle: 'Ce qu’OpenStrata ne peut pas faire',
    custodyCheckTitle: 'Ce que votre conseil peut vérifier, à tout moment',
    custodyTodayTitle: 'Où nous en sommes aujourd’hui',
    custodyCta: 'Posez-nous la question difficile',
    custodyCtaNote: 'hello@giveabit.io — nous y répondrons en langage clair.',
    checkoutLabelTitle: 'Nom du paiement',
    checkoutLabelHint:
      'Unique à OpenStrata. Ce nom exact figure sur le virement : il ne peut donc jamais être confondu avec un autre immeuble ni un autre projet.'
  },
  es: {
    custodyLink: 'Cómo se guarda su dinero',
    custodyBadge: '0 % de custodia',
    custodyPageTitle: 'Cómo se guarda su dinero — OpenStrata',
    custodyMetaDescription:
      'Dónde está el dinero de una comunidad en cada paso, qué nunca podrá hacer OpenStrata con él y qué puede comprobar un consejo.',
    custodyTitle: 'Cómo se guarda su dinero',
    custodyIntro:
      'OpenStrata es software. Nunca guarda, mueve ni tiene acceso al dinero de una comunidad: ni en una cuenta bancaria, ni en una cartera, ni en el bolsillo de nadie. Aquí está dónde está realmente el dinero en cada paso, y qué no podemos hacer.',
    custodyFlowTitle: 'Dónde está el dinero',
    custodyCantTitle: 'Lo que OpenStrata no puede hacer',
    custodyCheckTitle: 'Lo que su consejo puede comprobar en cualquier momento',
    custodyTodayTitle: 'Dónde estamos hoy',
    custodyCta: 'Háganos la pregunta difícil',
    custodyCtaNote: 'hello@giveabit.io — respondemos en lenguaje claro.',
    checkoutLabelTitle: 'Nombre del pago',
    checkoutLabelHint:
      'Único de OpenStrata. Este nombre exacto va en la transferencia, así que nunca se confundirá con otro edificio ni otro proyecto.'
  },
  zh: {
    custodyLink: '您的钱如何保管',
    custodyBadge: '0% 托管',
    custodyPageTitle: '您的钱如何保管 — OpenStrata',
    custodyMetaDescription:
      '社区的每一笔钱在每一步实际放在哪里，OpenStrata 永远不能对它做什么，以及理事会可以核对什么。',
    custodyTitle: '您的钱如何保管',
    custodyIntro:
      'OpenStrata 是软件。它从不持有、转移或访问社区的钱——不在银行账户里，不在钱包里，也不在任何人口袋里。以下是每一步钱实际所在的位置，以及我们不能做的事。',
    custodyFlowTitle: '钱放在哪里',
    custodyCantTitle: 'OpenStrata 不能做什么',
    custodyCheckTitle: '您的理事会随时可以核对什么',
    custodyTodayTitle: '目前进展',
    custodyCta: '把最难的问题问我们',
    custodyCtaNote: 'hello@giveabit.io —— 我们会用大白话回答。',
    checkoutLabelTitle: '付款名称',
    checkoutLabelHint:
      'OpenStrata 专用。转账上写的就是这个名称，因此绝不会与其他楼宇或其他项目混淆。'
  },
  hi: {
    custodyLink: 'आपका पैसा कैसे रखा जाता है',
    custodyBadge: '0% अभिरक्षा',
    custodyPageTitle: 'आपका पैसा कैसे रखा जाता है — OpenStrata',
    custodyMetaDescription:
      'हर चरण पर किसी समुदाय का पैसा कहाँ रहता है, OpenStrata उसके साथ कभी क्या नहीं कर सकता, और काउंसिल क्या जाँच सकती है।',
    custodyTitle: 'आपका पैसा कैसे रखा जाता है',
    custodyIntro:
      'OpenStrata एक सॉफ़्टवेयर है। यह किसी समुदाय का पैसा कभी न रखता है, न हिलाता है, और न ही उस तक पहुँच रखता है — न बैंक खाते में, न वॉलेट में, न किसी की जेब में। यहाँ बताया गया है कि हर चरण पर पैसा असल में कहाँ रहता है, और हम क्या नहीं कर सकते।',
    custodyFlowTitle: 'पैसा कहाँ रहता है',
    custodyCantTitle: 'OpenStrata क्या नहीं कर सकता',
    custodyCheckTitle: 'आपकी काउंसिल कभी भी क्या जाँच सकती है',
    custodyTodayTitle: 'आज हम कहाँ हैं',
    custodyCta: 'हमसे कठिन सवाल पूछें',
    custodyCtaNote: 'hello@giveabit.io — हम आसान भाषा में जवाब देंगे।',
    checkoutLabelTitle: 'भुगतान का नाम',
    checkoutLabelHint:
      'OpenStrata के लिए अद्वितीय। ट्रांसफ़र पर यही नाम लिखा जाता है, इसलिए यह कभी किसी दूसरी इमारत या दूसरे प्रोजेक्ट से नहीं मिलेगा।'
  },
  fil: {
    custodyLink: 'Paano itinatago ang pera mo',
    custodyBadge: '0% pangangalaga',
    custodyPageTitle: 'Paano itinatago ang pera mo — OpenStrata',
    custodyMetaDescription:
      'Saan talaga nakaupo ang pera ng isang komunidad sa bawat hakbang, ano ang hinding-hindi magagawa ng OpenStrata dito, at ano ang maaaring tiyakin ng konseho.',
    custodyTitle: 'Paano itinatago ang pera mo',
    custodyIntro:
      'Ang OpenStrata ay software. Hindi nito hawak, inililipat, o ina-access ang pera ng isang komunidad — hindi sa bank account, hindi sa wallet, hindi sa bulsa ng kahit sino. Narito kung saan talaga nakaupo ang pera sa bawat hakbang, at kung ano ang hindi namin kayang gawin.',
    custodyFlowTitle: 'Saan nakaupo ang pera',
    custodyCantTitle: 'Ano ang hindi kayang gawin ng OpenStrata',
    custodyCheckTitle: 'Ano ang maaaring tiyakin ng konseho mo, anumang oras',
    custodyTodayTitle: 'Nasaan kami ngayon',
    custodyCta: 'Itanong sa amin ang mahirap na tanong',
    custodyCtaNote: 'hello@giveabit.io — sasagutin namin ito sa simpleng salita.',
    checkoutLabelTitle: 'Pangalan ng bayad',
    checkoutLabelHint:
      'Natatangi sa OpenStrata. Ito mismo ang pangalan sa transfer, kaya hindi ito malalito sa ibang gusali o ibang proyekto.'
  },
  pl: {
    custodyLink: 'Jak przechowywane są Wasze pieniądze',
    custodyBadge: '0% nadzoru',
    custodyPageTitle: 'Jak przechowywane są Wasze pieniądze — OpenStrata',
    custodyMetaDescription:
      'Gdzie na każdym etapie faktycznie leżą pieniądze wspólnoty, czego OpenStrata nigdy z nimi nie zrobi i co rada może sprawdzić.',
    custodyTitle: 'Jak przechowywane są Wasze pieniądze',
    custodyIntro:
      'OpenStrata to oprogramowanie. Nigdy nie przechowuje, nie przenosi i nie ma dostępu do pieniędzy wspólnoty — ani na koncie bankowym, ani w portfelu, ani w niczyjej kieszeni. Oto, gdzie naprawdę leżą pieniądze na każdym etapie i czego nie możemy zrobić.',
    custodyFlowTitle: 'Gdzie leżą pieniądze',
    custodyCantTitle: 'Czego OpenStrata nie może zrobić',
    custodyCheckTitle: 'Co rada może sprawdzić w każdej chwili',
    custodyTodayTitle: 'Na jakim etapie jesteśmy',
    custodyCta: 'Zadajcie nam trudne pytanie',
    custodyCtaNote: 'hello@giveabit.io — odpowiemy prostym językiem.',
    checkoutLabelTitle: 'Nazwa płatności',
    checkoutLabelHint:
      'Unikalna dla OpenStrata. Ta nazwa trafia na przelew, więc nigdy nie pomylisz jej z innym budynkiem ani innym projektem.'
  },
  uk: {
    custodyLink: 'Як зберігаються ваші гроші',
    custodyBadge: '0% зберігання',
    custodyPageTitle: 'Як зберігаються ваші гроші — OpenStrata',
    custodyMetaDescription:
      'Де на кожному кроці насправді перебувають гроші спільноти, чого OpenStrata ніколи з ними не зробить і що рада може перевірити.',
    custodyTitle: 'Як зберігаються ваші гроші',
    custodyIntro:
      'OpenStrata — це програмне забезпечення. Воно ніколи не зберігає, не переказує і не має доступу до грошей спільноти — ні на банківському рахунку, ні в гаманці, ні в чиїйсь кишені. Ось де насправді перебувають гроші на кожному кроці і чого ми не можемо зробити.',
    custodyFlowTitle: 'Де перебувають гроші',
    custodyCantTitle: 'Чого OpenStrata не може зробити',
    custodyCheckTitle: 'Що ваша рада може перевірити будь-коли',
    custodyTodayTitle: 'На якому ми етапі сьогодні',
    custodyCta: 'Задайте нам складне питання',
    custodyCtaNote: 'hello@giveabit.io — відповімо простою мовою.',
    checkoutLabelTitle: 'Назва платежу',
    checkoutLabelHint:
      'Унікальна для OpenStrata. Саме ця назва йде в переказі, тож її ніколи не сплутати з іншим будинком чи іншим проєктом.'
  },
  sw: {
    custodyLink: 'Jinsi pesa zako zinavyohifadhiwa',
    custodyBadge: '0% ulezi',
    custodyPageTitle: 'Jinsi pesa zako zinavyohifadhiwa — OpenStrata',
    custodyMetaDescription:
      'Pesa za jumuiya ziko wapi kwa kila hatua, OpenStrata haiwezi kufanya nini nazo kamwe, na baraza linaweza kuhakiki nini.',
    custodyTitle: 'Jinsi pesa zako zinavyohifadhiwa',
    custodyIntro:
      'OpenStrata ni programu. Haishiki, haihamishi, na haiwezi kufikia pesa za jumuiya — si kwenye akaunti ya benki, si kwenye pochi, si mfukoni mwa mtu yeyote. Hapa ni mahali pesa zilipo kweli kwa kila hatua, na kile tusichoweza kufanya.',
    custodyFlowTitle: 'Pesa ziko wapi',
    custodyCantTitle: 'Kile OpenStrata haiwezi kufanya',
    custodyCheckTitle: 'Kile baraza lako linaweza kuhakiki wakati wowote',
    custodyTodayTitle: 'Tulipo leo',
    custodyCta: 'Tuulize swali gumu',
    custodyCtaNote: 'hello@giveabit.io — tutajibu kwa lugha rahisi.',
    checkoutLabelTitle: 'Jina la malipo',
    checkoutLabelHint:
      'Ni la OpenStrata pekee. Jina hili huenda kwenye uhamisho, hivyo haliwezi kuchanganywa na jengo lingine au mradi mwingine.'
  }
};

const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. New members on the Translation type, anchored to the type block itself
//    rather than to whichever key happens to be last — anchoring on the last
//    key broke every time a later injector appended one, so this is positional.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
const typeMembers = Object.keys(english).map((key) => `${key}: string;`).join(' ') + ' ';
source = source.slice(0, typeEnd) + typeMembers + source.slice(typeEnd);

// 2. English catalog values, before its closing brace. Any trailing comma on the
//    previous member is normalised away first, so this works whether or not the
//    last injector left one.
const catalogStart = source.indexOf('const english: Translation = {');
const catalogEnd = source.indexOf('\n};', catalogStart);
if (catalogStart === -1 || catalogEnd === -1) {
  throw new Error('Could not locate the English catalog.');
}
source =
  source.slice(0, catalogEnd).replace(/,\s*$/, '') +
  `, ${kv(english)}` +
  source.slice(catalogEnd);

// 3. Per-locale override blocks — each ends `...keys, },`.
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
  `Injected ${Object.keys(english).length} custody/checkout keys into src/lib/i18n.ts across 9 locales`
);
