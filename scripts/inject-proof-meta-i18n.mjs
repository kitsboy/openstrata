#!/usr/bin/env node
/**
 * One-off maintenance script: injects the home-page proof-band copy and the
 * privacy/terms page chrome into src/lib/i18n.ts, so the locale-parity guard
 * stays green across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  proofCustodyTitle: '0% custody, always.',
  proofCustodyBody:
    'Fiat rails today. Sovereign rails when you’re ready. Keys stay on council hardware wallets.',
  proofClocksTitle: 'Statutory clocks that don’t slip.',
  proofClocksBody:
    '14-day bylaw window and 7-day Form B deadline are tracked as first-class deadlines.',
  terms: 'Terms',
  privacyPageTitle: 'Privacy Policy — OpenStrata',
  privacyMetaDescription:
    'How the Give A Bit family handles data: no accounts, no cookies, cookie-less analytics, and how to reach us.',
  termsPageTitle: 'Terms & Conditions — OpenStrata',
  termsMetaDescription:
    'The terms for using the Give A Bit family sites: informational tools, no advice, no warranty, donations vs paid services.'
};

const translations = {
  fr: {
    proofCustodyTitle: '0 % de garde, toujours.',
    proofCustodyBody:
      'Rails fiduciaires aujourd’hui. Rails souverains quand vous serez prêt. Les clés restent sur les portefeuilles matériels du conseil.',
    proofClocksTitle: 'Des horloges légales qui ne dérapent pas.',
    proofClocksBody:
      'La fenêtre de 14 jours pour les règlements et le délai de 7 jours du Formulaire B sont suivis comme des échéances de premier plan.',
    terms: 'Conditions',
    privacyPageTitle: 'Politique de confidentialité — OpenStrata',
    privacyMetaDescription:
      'Comment la famille Give A Bit traite les données : pas de comptes, pas de témoins (cookies), analyses sans témoins, et comment nous joindre.',
    termsPageTitle: 'Conditions d’utilisation — OpenStrata',
    termsMetaDescription:
      'Les conditions d’utilisation des sites de la famille Give A Bit : outils d’information, sans conseil, sans garantie, dons contre services payants.'
  },
  es: {
    proofCustodyTitle: '0% de custodia, siempre.',
    proofCustodyBody:
      'Vías fiduciarias hoy. Vías soberanas cuando estés listo. Las llaves se quedan en las carteras de hardware del consejo.',
    proofClocksTitle: 'Relojes legales que no se atrasan.',
    proofClocksBody:
      'La ventana de 14 días para reglamentos y el plazo de 7 días del Formulario B se siguen como plazos de primera clase.',
    terms: 'Términos',
    privacyPageTitle: 'Política de Privacidad — OpenStrata',
    privacyMetaDescription:
      'Cómo maneja los datos la familia Give A Bit: sin cuentas, sin cookies, analítica sin cookies y cómo contactarnos.',
    termsPageTitle: 'Términos y Condiciones — OpenStrata',
    termsMetaDescription:
      'Los términos de los sitios de la familia Give A Bit: herramientas informativas, sin asesoría, sin garantía, donaciones frente a servicios pagados.'
  },
  zh: {
    proofCustodyTitle: '永远 0% 托管。',
    proofCustodyBody: '今天是法定货币通道，准备好了就是主权通道。钥匙始终留在理事会的硬件钱包里。',
    proofClocksTitle: '法定时钟不会滑档。',
    proofClocksBody: '14 天附例窗口和 7 天 Form B 期限都作为头等期限跟踪。',
    terms: '条款',
    privacyPageTitle: '隐私政策 — OpenStrata',
    privacyMetaDescription: 'Give A Bit 家族如何处理数据：无账户、无 Cookie、无 Cookie 分析，以及如何联系我们。',
    termsPageTitle: '条款与条件 — OpenStrata',
    termsMetaDescription: 'Give A Bit 家族网站的使用条款：信息工具、非建议、无担保、捐赠与付费服务的区别。'
  },
  hi: {
    proofCustodyTitle: 'हमेशा 0% अभिरक्षा।',
    proofCustodyBody:
      'आज फ़िएट रेल, तैयार होने पर सॉवरेन रेल। चाबियाँ काउंसिल के हार्डवेयर वॉलेट में ही रहती हैं।',
    proofClocksTitle: 'कानूनी घड़ियाँ जो नहीं चूकतीं।',
    proofClocksBody:
      '14-दिन की उपनियम खिड़की और 7-दिन की फॉर्म B समय-सीमा प्रथम श्रेणी की डेडलाइन के रूप में ट्रैक होती हैं।',
    terms: 'शर्तें',
    privacyPageTitle: 'गोपनीयता नीति — OpenStrata',
    privacyMetaDescription:
      'Give A Bit परिवार डेटा कैसे संभालता है: कोई खाता नहीं, कोई कुकी नहीं, कुकी-रहित एनालिटिक्स, और हमसे कैसे संपर्क करें।',
    termsPageTitle: 'नियम और शर्तें — OpenStrata',
    termsMetaDescription:
      'Give A Bit परिवार की साइटों की शर्तें: सूचनात्मक टूल, कोई सलाह नहीं, कोई वारंटी नहीं, दान बनाम सशुल्क सेवाएँ।'
  },
  fil: {
    proofCustodyTitle: '0% pangangalaga, palagi.',
    proofCustodyBody:
      'Fiat rails ngayon. Sovereign rails kapag handa ka na. Ang susi ay nasa hardware wallet ng konseho.',
    proofClocksTitle: 'Mga orasan ng batas na hindi nadadapa.',
    proofClocksBody:
      'Ang 14-araw na bylaw window at 7-araw na Form B deadline ay minamonitor bilang mga pangunahing takdang-araw.',
    terms: 'Mga Tuntunin',
    privacyPageTitle: 'Patakaran sa Privacy — OpenStrata',
    privacyMetaDescription:
      'Kung paano hina-handle ng pamilyang Give A Bit ang data: walang account, walang cookies, cookie-less analytics, at paano kami makontak.',
    termsPageTitle: 'Mga Tuntunin at Kundisyon — OpenStrata',
    termsMetaDescription:
      'Mga tuntunin sa mga site ng pamilyang Give A Bit: impormasyong tool, hindi payo, walang warranty, donasyon kumpara sa bayad na serbisyo.'
  },
  pl: {
    proofCustodyTitle: 'Zawsze 0% nadzoru.',
    proofCustodyBody:
      'Dziś rails fiducjarne. Sovereign rails, gdy będziesz gotowy. Klucze zostają w sprzętowych portfelach rady.',
    proofClocksTitle: 'Ustawowe zegary, które się nie potykają.',
    proofClocksBody:
      '14-dniowe okno na regulaminy i 7-dniowy termin Formularza B są śledzone jako terminy pierwszej kategorii.',
    terms: 'Zasady',
    privacyPageTitle: 'Polityka prywatności — OpenStrata',
    privacyMetaDescription:
      'Jak rodzina Give A Bit obchodzi się z danymi: bez kont, bez plików cookie, analityka bez cookie i jak się z nami skontaktować.',
    termsPageTitle: 'Zasady i warunki — OpenStrata',
    termsMetaDescription:
      'Zasady korzystania ze stron rodziny Give A Bit: narzędzia informacyjne, bez porad, bez gwarancji, darowizny a usługi płatne.'
  },
  uk: {
    proofCustodyTitle: 'Завжди 0% зберігання.',
    proofCustodyBody:
      'Сьогодні фіатні рейки. Суверенні рейки — коли будете готові. Ключі залишаються на апаратних гаманцях ради.',
    proofClocksTitle: 'Статутні годинники, які не збиваються.',
    proofClocksBody:
      '14-денне вікно для статутів і 7-денний термін Форми B відстежуються як першочергові дедлайни.',
    terms: 'Умови',
    privacyPageTitle: 'Політика конфіденційності — OpenStrata',
    privacyMetaDescription:
      'Як родина Give A Bit поводиться з даними: без акаунтів, без cookie, аналітика без cookie і як з нами зв’язатися.',
    termsPageTitle: 'Правила та умови — OpenStrata',
    termsMetaDescription:
      'Умови користування сайтами родини Give A Bit: інформаційні інструменти, не порада, без гарантій, донати проти платних послуг.'
  },
  sw: {
    proofCustodyTitle: '0% ulezi, kila wakati.',
    proofCustodyBody:
      'Reli za fiat leo. Reli za kujitegemea ukikaa tayari. Funguo zinabaki kwenye pochi za maunzi za baraza.',
    proofClocksTitle: 'Saa za sheria zisizokosea.',
    proofClocksBody:
      'Dirisha la siku 14 la sheria ndogo na muda wa siku 7 wa Fomu B hufuatiliwa kama ajali za kwanza.',
    terms: 'Masharti',
    privacyPageTitle: 'Sera ya Faragha — OpenStrata',
    privacyMetaDescription:
      'Jinsi familia ya Give A Bit inavyoshughulikia data: bila akaunti, bila cookies, uchambuzi bila cookies, na jinsi ya kutufikia.',
    termsPageTitle: 'Masharti na Vigezo — OpenStrata',
    termsMetaDescription:
      'Masharti ya kutumia tovuti za familia ya Give A Bit: zana za taarifa, si ushauri, bila dhamana, michango dhidi ya huduma za kulipa.'
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
  `Injected ${Object.keys(english).length} proof/meta keys into src/lib/i18n.ts across 9 locales`
);
