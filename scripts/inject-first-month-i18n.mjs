#!/usr/bin/env node
/**
 * One-off maintenance script: injects the first-month walkthrough keys
 * (fm*) into src/lib/i18n.ts so the locale-parity guard stays green across
 * all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  fmTitle: 'Run your first month',
  fmSubtitle: 'The five steps of a real billing cycle — billed, paid, reconciled, reviewed, closed.',
  fmStep1: 'Bill the month',
  fmHint1: 'Run the billing cycle so every unit is charged.',
  fmStep2: 'Collect a payment',
  fmHint2: 'Quote and confirm one owner’s fee payment.',
  fmStep3: 'Reconcile the deposit',
  fmHint3: 'Match an inbound e-transfer to its unit — it never guesses.',
  fmStep4: 'Review what’s due',
  fmHint4: 'Read the statutory calendar and the health score.',
  fmStep5: 'Close the month',
  fmHint5: 'Run month-end and watch the ledger verify.',
  fmNext: 'Up next',
  fmComplete: 'First month closed — that is the whole loop.',
  fmReset: 'Reset',
  fmHide: 'Hide this walkthrough',
  fmShow: 'Show the first-month walkthrough'
};

const translations = {
  fr: {
    fmTitle: 'Runez votre premier mois',
    fmSubtitle: 'Les cinq étapes d’un vrai cycle de facturation — facturé, payé, rapproché, vérifié, clôturé.',
    fmStep1: 'Facturer le mois',
    fmHint1: 'Lancez le cycle de facturation pour facturer chaque unité.',
    fmStep2: 'Encaisser un paiement',
    fmHint2: 'Chiffrez et confirmez le paiement d’un copropriétaire.',
    fmStep3: 'Rapprocher le dépôt',
    fmHint3: 'Associez un virement entrant à son unité — jamais de devinettes.',
    fmStep4: 'Voir les échéances',
    fmHint4: 'Consultez le calendrier légal et l’état de santé.',
    fmStep5: 'Clôturer le mois',
    fmHint5: 'Lancez la clôture et regardez le grand livre se vérifier.',
    fmNext: 'À suivre',
    fmComplete: 'Premier mois clôturé — voilà toute la boucle.',
    fmReset: 'Réinitialiser',
    fmHide: 'Masquer ce parcours',
    fmShow: 'Afficher le parcours du premier mois'
  },
  es: {
    fmTitle: 'Ejecuta tu primer mes',
    fmSubtitle: 'Los cinco pasos de un ciclo de facturación real — facturado, pagado, conciliado, revisado, cerrado.',
    fmStep1: 'Facturar el mes',
    fmHint1: 'Ejecuta el ciclo de facturación para cobrar cada unidad.',
    fmStep2: 'Cobrar un pago',
    fmHint2: 'Cotiza y confirma el pago de un propietario.',
    fmStep3: 'Conciliar el depósito',
    fmHint3: 'Asocia una transferencia entrante a su unidad — nunca adivina.',
    fmStep4: 'Revisar vencimientos',
    fmHint4: 'Consulta el calendario legal y el indicador de salud.',
    fmStep5: 'Cerrar el mes',
    fmHint5: 'Ejecuta el cierre y mira cómo se verifica el libro.',
    fmNext: 'Siguiente',
    fmComplete: 'Primer mes cerrado — ese es todo el ciclo.',
    fmReset: 'Reiniciar',
    fmHide: 'Ocultar esta guía',
    fmShow: 'Mostrar la guía del primer mes'
  },
  zh: {
    fmTitle: '运行您的第一个月',
    fmSubtitle: '真实账单周期的五个步骤 —— 出账、收款、对账、复核、结账。',
    fmStep1: '出账本月费用',
    fmHint1: '运行账单周期，为每个单位计费。',
    fmStep2: '收取一笔付款',
    fmHint2: '为一位业主的物业费报价并确认收款。',
    fmStep3: '对账入账',
    fmHint3: '把入账转账匹配到对应单位 —— 绝不猜测。',
    fmStep4: '查看到期事项',
    fmHint4: '查看法定日历和健康评分。',
    fmStep5: '结账本月',
    fmHint5: '运行月末结账，并查看账本验证。',
    fmNext: '下一步',
    fmComplete: '第一个月已结账 —— 这就是完整的循环。',
    fmReset: '重置',
    fmHide: '隐藏本指南',
    fmShow: '显示首月指南'
  },
  hi: {
    fmTitle: 'अपना पहला महीना चलाएँ',
    fmSubtitle: 'असली बिलिंग चक्र के पाँच चरण — बिल, भुगतान, मिलान, समीक्षा, समापन।',
    fmStep1: 'महीने का बिल बनाएँ',
    fmHint1: 'बिलिंग चक्र चलाएँ ताकि हर यूनिट बिल हो।',
    fmStep2: 'भुगतान वसूलें',
    fmHint2: 'एक मालिक के शुल्क का कोट लें और पुष्टि करें।',
    fmStep3: 'जमा मिलाएँ',
    fmHint3: 'आने वाले ई-ट्रांसफर को उसकी यूनिट से मिलाएँ — कभी अंदाज़ा नहीं।',
    fmStep4: 'देय समीक्षा करें',
    fmHint4: 'कानूनी कैलेंडर और हेल्थ स्कोर देखें।',
    fmStep5: 'महीना बंद करें',
    fmHint5: 'मंथ-एंड चलाएँ और लेजर सत्यापन देखें।',
    fmNext: 'आगे',
    fmComplete: 'पहला महीना बंद — पूरा चक्र यही है।',
    fmReset: 'रीसेट',
    fmHide: 'यह मार्गदर्शिका छिपाएँ',
    fmShow: 'पहले महीने की मार्गदर्शिका दिखाएँ'
  },
  fil: {
    fmTitle: 'Patakbuhin ang unang buwan',
    fmSubtitle: 'Ang limang hakbang ng totoong billing cycle — nabilingan, nabayaran, na-reconcile, na-review, naisara.',
    fmStep1: 'I-bill ang buwan',
    fmHint1: 'Patakbuhin ang billing cycle para mabillingan ang bawat unit.',
    fmStep2: 'Maningil ng bayad',
    fmHint2: 'Mag-quote at kumpirmahin ng bayad ng isang may-ari.',
    fmStep3: 'I-reconcile ang deposito',
    fmHint3: 'Itugma ang papasok na e-transfer sa unit nito — hindi naghuhulaan.',
    fmStep4: 'Suriin ang due',
    fmHint4: 'Tingnan ang statutory calendar at health score.',
    fmStep5: 'Isara ang buwan',
    fmHint5: 'Patakbuhin ang month-end at panoorin ang ledger verification.',
    fmNext: 'Sunod',
    fmComplete: 'Naisara ang unang buwan — iyon ang buong cycle.',
    fmReset: 'I-reset',
    fmHide: 'Itago ang gabay na ito',
    fmShow: 'Ipakita ang gabay sa unang buwan'
  },
  pl: {
    fmTitle: 'Poprowadź pierwszy miesiąc',
    fmSubtitle: 'Pięć kroków prawdziwego cyklu rozliczeniowego — faktura, wpłata, uzgodnienie, przegląd, zamknięcie.',
    fmStep1: 'Zafakturuj miesiąc',
    fmHint1: 'Uruchom cykl rozliczeniowy, aby obciążć każdą jednostkę.',
    fmStep2: 'Zbierz wpłatę',
    fmHint2: 'Wycen i potwierdź wpłatę jednego właściciela.',
    fmStep3: 'Uzgodnij przelew',
    fmHint3: 'Dopasuj wpływający przelew do jednostki — nigdy nie zgaduje.',
    fmStep4: 'Przejrzyj terminy',
    fmHint4: 'Zobacz kalendarz ustawowy i ocenę kondycji.',
    fmStep5: 'Zamknij miesiąc',
    fmHint5: 'Uruchom zamknięcie miesiąca i zobacz weryfikację księgi.',
    fmNext: 'Następny',
    fmComplete: 'Pierwszy miesiąc zamknięty — to cały cykl.',
    fmReset: 'Resetuj',
    fmHide: 'Ukryj ten przewodnik',
    fmShow: 'Pokaż przewodnik pierwszego miesiąca'
  },
  uk: {
    fmTitle: 'Проведіть перший місяць',
    fmSubtitle: 'П’ять кроків справжнього циклу виставлення рахунків — нараховано, сплачено, узгоджено, перевірено, закрито.',
    fmStep1: 'Виставте рахунки за місяць',
    fmHint1: 'Запустіть цикл, щоб нарахувати плату кожній секції.',
    fmStep2: 'Отримайте платіж',
    fmHint2: 'Сформуйте запит і підтвердьте платіж одного власника.',
    fmStep3: 'Узгодьте надходження',
    fmHint3: 'Зіставте вхідний переказ із секцією — система ніколи не вгадує.',
    fmStep4: 'Перегляньте строки',
    fmHint4: 'Погляньте законодавчий календар і оцінку стану.',
    fmStep5: 'Закрийте місяць',
    fmHint5: 'Запустіть закриття місяця і побачите верифікацію книги.',
    fmNext: 'Далі',
    fmComplete: 'Перший місяць закрито — це і є весь цикл.',
    fmReset: 'Скинути',
    fmHide: 'Приховати цей посібник',
    fmShow: 'Показати посібник першого місяця'
  },
  sw: {
    fmTitle: 'Endesha mwezi wa kwanza',
    fmSubtitle: 'Hatua tano za mzunguko halisi wa bili — imetolewa, imelipwa, imepatanishwa, imekaguliwa, imefungwa.',
    fmStep1: 'Toa bili za mwezi',
    fmHint1: 'Endesha mzunguko wa bili ili kila uniti itozwe.',
    fmStep2: 'Pokea malipo',
    fmHint2: 'Omba bei na uthibitishe malipo ya mmiliki mmoja.',
    fmStep3: 'Patana amana',
    fmHint3: 'Linganisha e-transfer inayoingia na uniti yake — haigidhani.',
    fmStep4: 'Kagua yaliyopaswa',
    fmHint4: 'Tazama kalenda ya kisheria na alama ya afya.',
    fmStep5: 'Funga mwezi',
    fmHint5: 'Endesha mwisho wa mwezi na uone uthibitisho wa leja.',
    fmNext: 'Ifuatayo',
    fmComplete: 'Mwezi wa kwanza umefungwa — huohuo ni mzunguko mzima.',
    fmReset: 'Anza upya',
    fmHide: 'Ficha mwongozo huu',
    fmShow: 'Onyesha mwongozo wa mwezi wa kwanza'
  }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

const keys = Object.keys(english);
if (keys.some((k) => source.includes(`${k}: '`))) {
  console.log('fm* keys already present — nothing to do.');
  process.exit(0);
}

// 1. Translation type members.
const typeStart = source.indexOf('type Translation = {');
const typeEnd = source.indexOf('};', typeStart);
if (typeStart === -1 || typeEnd === -1) throw new Error('Could not locate the Translation type.');
source =
  source.slice(0, typeEnd) + keys.map((k) => `${k}: string;`).join(' ') + ' ' + source.slice(typeEnd);

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

// 3. Per-locale override blocks — lazy [\s\S] covers blocks spanning many lines.
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
console.log(`Injected ${keys.length} first-month keys into src/lib/i18n.ts across 9 locales`);
