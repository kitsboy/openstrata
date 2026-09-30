#!/usr/bin/env node
/**
 * One-off maintenance script: injects the new e-transfer reconciliation
 * catalog keys into src/lib/i18n.ts so the locale-parity guard (scripts/
 * audit-i18n.mjs) stays green.
 *
 * Adds the keys to the Translation type, the English base catalog, and every
 * one of the 8 per-locale override blocks (fr, es, zh, hi, fil, pl, uk, sw).
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  etransferTitle: 'E-Transfer Reconciliation',
  etransferIntro:
    'Auto-match inbound e-transfers to unit accounts by reference code. Reviewable — nothing posts without sign-off.',
  etransferMatchBrief: 'Match by message',
  etransferMatchFull: 'Match by message + payer',
  etransferInbound: 'Inbound transfers',
  etransferFootnote:
    'Prototype. Matches by reference are flagged for human review before any ledger post — reconciliation never guesses.',
  reconTotalReceived: 'Received',
  reconResolved: 'Resolved',
  reconAuto: 'Auto',
  reconNeedsReview: 'Needs review',
  reconAssignTo: 'Assign to',
  reconAmount: 'Amount',
  reconManual: 'Manual',
  reconAmbiguous: 'Ambiguous',
  reconUnmatched: 'Unmatched',
  reconSelectUnit: 'Select unit'
};

const translations = {
  fr: {
    etransferTitle: 'Rapprochement de virements',
    etransferIntro:
      'Rapprochez automatiquement les virements entrants aux comptes d’unités par code de référence. Vérifiable : rien n’est publié sans validation.',
    etransferMatchBrief: 'Rapprocher par message',
    etransferMatchFull: 'Rapprocher par message + payeur',
    etransferInbound: 'Virements entrants',
    etransferFootnote:
      'Prototype. Les correspondances par référence sont signalées pour examen humain avant toute écriture au grand livre : le rapprochement ne devine jamais.',
    reconTotalReceived: 'Reçu',
    reconResolved: 'Rapproché',
    reconAuto: 'Auto',
    reconNeedsReview: 'À examiner',
    reconAssignTo: 'Assigner à',
    reconAmount: 'Montant',
    reconManual: 'Manuel',
    reconAmbiguous: 'Ambigu',
    reconUnmatched: 'Non rapproché',
    reconSelectUnit: 'Choisir l’unité'
  },
  es: {
    etransferTitle: 'Conciliación de transferencias',
    etransferIntro:
      'Asocia automáticamente las transferencias entrantes a las cuentas de unidades mediante el código de referencia. Revisable: nada se publica sin aprobación.',
    etransferMatchBrief: 'Asociar por mensaje',
    etransferMatchFull: 'Asociar por mensaje + pagador',
    etransferInbound: 'Transferencias entrantes',
    etransferFootnote:
      'Prototipo. Las coincidencias por referencia se marcan para revisión humana antes de cualquier publicación en el libro mayor: la conciliación nunca adivina.',
    reconTotalReceived: 'Recibido',
    reconResolved: 'Conciliado',
    reconAuto: 'Auto',
    reconNeedsReview: 'Requiere revisión',
    reconAssignTo: 'Asignar a',
    reconAmount: 'Monto',
    reconManual: 'Manual',
    reconAmbiguous: 'Ambiguo',
    reconUnmatched: 'Sin asociar',
    reconSelectUnit: 'Seleccionar unidad'
  },
  zh: {
    etransferTitle: '电子转账对账',
    etransferIntro: '通过参考代码将入账电子转账自动关联到单元账户。可审核：未经批准不会过账。',
    etransferMatchBrief: '按留言匹配',
    etransferMatchFull: '按留言+付款人匹配',
    etransferInbound: '入账转账',
    etransferFootnote: '原型。任何过账前，按参考代码的匹配都会标记为待人工审核——对账从不会猜测。',
    reconTotalReceived: '已收款',
    reconResolved: '已对账',
    reconAuto: '自动',
    reconNeedsReview: '待审核',
    reconAssignTo: '分配到',
    reconAmount: '金额',
    reconManual: '手动',
    reconAmbiguous: '有歧义',
    reconUnmatched: '未匹配',
    reconSelectUnit: '选择单元'
  },
  hi: {
    etransferTitle: 'ई-ट्रांसफर समाधान',
    etransferIntro:
      'संदर्भ कोड द्वारा आने वाले ई-ट्रांसफर को यूनिट खातों से स्वतः मिलाएँ। समीक्षा योग्य — अनुमोदन के बिना कुछ भी पोस्ट नहीं होता।',
    etransferMatchBrief: 'संदेश से मिलाएँ',
    etransferMatchFull: 'संदेश + भुगतानकर्ता से मिलाएँ',
    etransferInbound: 'आने वाले ट्रांसफर',
    etransferFootnote:
      'प्रोटोटाइप। खाता-बही में पोस्ट करने से पहले संदर्भ से मिलान को मानव समीक्षा के लिए चिह्नित किया जाता है — समाधान कभी अनुमान नहीं लगाता।',
    reconTotalReceived: 'प्राप्त',
    reconResolved: 'समाधानित',
    reconAuto: 'स्वतः',
    reconNeedsReview: 'समीक्षा आवश्यक',
    reconAssignTo: 'आवंटित करें',
    reconAmount: 'राशि',
    reconManual: 'मैनुअल',
    reconAmbiguous: 'अस्पष्ट',
    reconUnmatched: 'अमिलान',
    reconSelectUnit: 'यूनिट चुनें'
  },
  fil: {
    etransferTitle: 'Pagkakasundo ng E-Transfer',
    etransferIntro:
      'Awtomatikong itugma ang mga papasok na e-transfer sa mga account ng unit sa pamamagitan ng reference code. Maaaring suriin — walang po-post kung walang pagsang-ayon.',
    etransferMatchBrief: 'Itugma ayon sa mensahe',
    etransferMatchFull: 'Itugma ayon sa mensahe + nagbabayad',
    etransferInbound: 'Mga papasok na transfer',
    etransferFootnote:
      'Prototype. Ang mga tugma ayon sa reference ay minamarkahan para sa pagsusuri ng tao bago ang anumang pag-post sa ledger — hindi kailanman hulaan ng pagkakasundo.',
    reconTotalReceived: 'Natanggap',
    reconResolved: 'Naayos',
    reconAuto: 'Auto',
    reconNeedsReview: 'Kailangan ng pagsusuri',
    reconAssignTo: 'I-assign sa',
    reconAmount: 'Halaga',
    reconManual: 'Manual',
    reconAmbiguous: 'Malabo',
    reconUnmatched: 'Hindi natugma',
    reconSelectUnit: 'Pumili ng unit'
  },
  pl: {
    etransferTitle: 'Uzgadnianie e-przelewów',
    etransferIntro:
      'Automatyczne dopasowanie przychodzących e-przelewów do kont lokali według kodu referencyjnego. Możliwa weryfikacja — nic nie jest księgowane bez zatwierdzenia.',
    etransferMatchBrief: 'Dopasuj według wiadomości',
    etransferMatchFull: 'Dopasuj według wiadomości + płatnika',
    etransferInbound: 'Przychodzące przelewy',
    etransferFootnote:
      'Prototyp. Dopasowania według referencji są oznaczane do przeglądu przez człowieka przed zaksięgowaniem — uzgadnianie nigdy nie zgaduje.',
    reconTotalReceived: 'Otrzymano',
    reconResolved: 'Uzgodniono',
    reconAuto: 'Auto',
    reconNeedsReview: 'Wymaga przeglądu',
    reconAssignTo: 'Przypisz do',
    reconAmount: 'Kwota',
    reconManual: 'Ręcznie',
    reconAmbiguous: 'Niejednoznaczny',
    reconUnmatched: 'Nieuzgodniony',
    reconSelectUnit: 'Wybierz lokal'
  },
  uk: {
    etransferTitle: 'Звірка е-переказів',
    etransferIntro:
      'Автоматичне зіставлення вхідних е-переказів з рахунками юнітів за кодами посилань. Провірник: нічого не публікується без погодження.',
    etransferMatchBrief: 'Зіставити за повідомленням',
    etransferMatchFull: 'Зіставити за повідомленням + платником',
    etransferInbound: 'Вхідні перекази',
    etransferFootnote:
      'Прототип. Зіставлення за посиланнями позначаються для людської перевірки перед будь-яким записом у книгу — звірка ніколи не вгадує.',
    reconTotalReceived: 'Отримано',
    reconResolved: 'Звірено',
    reconAuto: 'Авто',
    reconNeedsReview: 'Потребує перевірки',
    reconAssignTo: 'Призначити до',
    reconAmount: 'Сума',
    reconManual: 'Вручну',
    reconAmbiguous: 'Неоднозначно',
    reconUnmatched: 'Незвірено',
    reconSelectUnit: 'Вибрати юніт'
  },
  sw: {
    etransferTitle: 'Upatanaji wa e-Transfer',
    etransferIntro:
      'Linganisha kiotomatiki hati-mkopo zinazoingia kwenye akaunti za vitengo kwa msimbo marejeleo. Inaweza kukaguliwa — hakuna kinachochapishwa bila idhini.',
    etransferMatchBrief: 'Linganisha kwa ujumbe',
    etransferMatchFull: 'Linganisha kwa ujumbe + mlipaji',
    etransferInbound: 'Hati-mkopo zinazoingia',
    etransferFootnote:
      'Mfano. Milinganisho kwa rejeleo huwekwa alama kwa ukaguzi wa binadamu kabla ya kuchapishwa kwenye leja — upatanaji haukisi kamwe.',
    reconTotalReceived: 'Imepokelewa',
    reconResolved: 'Imepatanishwa',
    reconAuto: 'Automatiki',
    reconNeedsReview: 'Inahitaji ukaguzi',
    reconAssignTo: 'Wekea',
    reconAmount: 'Kiasi',
    reconManual: 'Mkono',
    reconAmbiguous: 'Ngumu',
    reconUnmatched: 'Haijalinganishwa',
    reconSelectUnit: 'Chagua kitengo'
  }
};

const kv = (map) =>
  Object.entries(map)
    .map(([k, v]) => `${k}: '${v.replaceAll("'", "\\'")}'`)
    .join(', ');

// 1. Translation type — the members live on a single long line that ends with
//    `notificationsEmpty: string;` then `\n};` (no newline before it).
source = source.replace(
  /(notificationsEmpty: string;)(\n\};)/,
  (m, head, close) => `${head} ${typeMembers()}${close}`
);

function typeMembers() {
  return Object.keys(english)
    .map((k) => `${k}: string`)
    .join('; ');
}

// 2. English catalog — single long line ending `notificationsEmpty: 'No
//    notifications yet'\n};`.
source = source.replace(
  /(notificationsEmpty: 'No notifications yet')(\n\};)/,
  (m, head, close) => `${head}, ${kv(english)}${close}`
);

// 3. Per-locale override blocks — each is its OWN single line whose trailing
//    bytes are ` }` (the final `sw` block) or ` },`. Process line-by-line so
//    the splice point is unambiguous.
const lines = source.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = /^(  (fr|es|zh|hi|fil|pl|uk|sw): \{ \.\.\.english,)(.*) \}(,?)$/.exec(line);
  if (!match) continue;
  const code = match[2];
  const map = translations[code];
  if (!map) throw new Error(`No translation map provided for locale "${code}"`);
  const comma = match[4];
  lines[i] = `${match[1]}${match[3]}, ${kv(map)} }${comma}`;
}
source = lines.join('\n');

fs.writeFileSync(file, source);
console.log('Injected e-transfer reconciliation keys into src/lib/i18n.ts');