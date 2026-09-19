#!/usr/bin/env node
/**
 * One-off maintenance script: injects the print-ready-document page chrome into
 * src/lib/i18n.ts so the locale-parity guard (scripts/audit-i18n.mjs) stays
 * green across all 9 locales.
 *
 * Only page chrome goes through the catalog. The documents themselves are
 * long-form legal-ish copy and stay English in `src/lib/documents.ts` until a
 * reviewed translation exists — the same rule the user manual follows.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  documentsBadge: 'Print-ready documents',
  documentsTitle: 'Documents a council can sign',
  documentsIntro:
    'Minutes, meeting notices and the conveyancing certificates, laid out for real paper — letterhead, page breaks and signature lines. Open one, print it, file it.',
  documentsPageTitle: 'Print-ready documents — OpenStrata',
  documentsMetaDescription:
    'Minutes, meeting notices and Form B and Form F certificates, laid out to print like real documents.',
  documentsSampleTitle: 'Sample data — a template, not a filed record',
  documentsSampleNote:
    'Every name, date and amount on these pages is sample data from one fictional building. What we are showing is the layout and the wording; replace the contents with your own records before anything is signed or filed.',
  documentsPick: 'Choose a document',
  documentsPrint: 'Print this document',
  documentsPrintAll: 'Print the full set',
  documentsPrintHint:
    'Printing hides the website and prints the sheet: your letterhead at the top, the document, then the signature lines.'
};

const translations = {
  fr: {
    documentsBadge: 'Documents prêts à imprimer',
    documentsTitle: 'Des documents qu’un conseil peut signer',
    documentsIntro:
      'Procès-verbaux, avis de réunion et certificats de mutation, mis en page pour du vrai papier — en-tête, sauts de page et lignes de signature. Ouvrez, imprimez, classez.',
    documentsPageTitle: 'Documents prêts à imprimer — OpenStrata',
    documentsMetaDescription:
      'Procès-verbaux, avis de réunion et certificats Formule B et Formule F, mis en page pour s’imprimer comme de vrais documents.',
    documentsSampleTitle: 'Données d’exemple — un modèle, pas un document déposé',
    documentsSampleNote:
      'Chaque nom, date et montant sur ces pages provient d’un immeuble fictif. Ce que nous montrons, c’est la mise en page et le libellé; remplacez le contenu par vos propres dossiers avant toute signature ou tout dépôt.',
    documentsPick: 'Choisir un document',
    documentsPrint: 'Imprimer ce document',
    documentsPrintAll: 'Imprimer la série complète',
    documentsPrintHint:
      'L’impression masque le site et imprime la feuille : votre en-tête en haut, le document, puis les lignes de signature.'
  },
  es: {
    documentsBadge: 'Documentos listos para imprimir',
    documentsTitle: 'Documentos que un consejo puede firmar',
    documentsIntro:
      'Actas, avisos de reunión y certificados de transmisión, maquetados para papel real: encabezado, saltos de página y líneas de firma. Ábrelo, imprímelo, archívalo.',
    documentsPageTitle: 'Documentos listos para imprimir — OpenStrata',
    documentsMetaDescription:
      'Actas, avisos de reunión y certificados Formulario B y Formulario F, maquetados para imprimirse como documentos reales.',
    documentsSampleTitle: 'Datos de muestra: una plantilla, no un documento presentado',
    documentsSampleNote:
      'Cada nombre, fecha e importe de estas páginas son datos de muestra de un edificio ficticio. Lo que mostramos es la maquetación y el texto; sustituye el contenido por tus propios registros antes de firmar o presentar nada.',
    documentsPick: 'Elige un documento',
    documentsPrint: 'Imprimir este documento',
    documentsPrintAll: 'Imprimir el juego completo',
    documentsPrintHint:
      'Al imprimir se oculta el sitio y se imprime la hoja: tu encabezado arriba, el documento y luego las líneas de firma.'
  },
  zh: {
    documentsBadge: '可打印文档',
    documentsTitle: '理事会可以签署的文件',
    documentsIntro:
      '会议纪要、会议通知和过户证明，按真实纸张排版——信头、分页和签名线。打开、打印、归档。',
    documentsPageTitle: '可打印文档 — OpenStrata',
    documentsMetaDescription:
      '会议纪要、会议通知以及表格 B 和表格 F 证明，按真实文件排版以便打印。',
    documentsSampleTitle: '示例数据——是模板，不是已提交记录',
    documentsSampleNote:
      '这些页面上的每个姓名、日期和金额都来自一栋虚构楼宇的示例数据。我们展示的是版式与措辞；在签署或提交之前，请替换为你自己的记录。',
    documentsPick: '选择文件',
    documentsPrint: '打印此文件',
    documentsPrintAll: '打印整套',
    documentsPrintHint:
      '打印时会隐藏网站并只打印纸张：顶部是你的信头，中间是文件，下面是签名线。'
  },
  hi: {
    documentsBadge: 'प्रिंट के लिए तैयार दस्तावेज़',
    documentsTitle: 'ऐसे दस्तावेज़ जिन पर परिषद हस्ताक्षर कर सके',
    documentsIntro:
      'कार्यवृत्त, बैठक सूचनाएँ और हस्तांतरण प्रमाणपत्र, असली कागज़ पर छपने के लिए सजाए गए — लेटरहेड, पेज ब्रेक और हस्ताक्षर पंक्तियाँ। खोलें, प्रिंट करें, फ़ाइल करें।',
    documentsPageTitle: 'प्रिंट के लिए तैयार दस्तावेज़ — OpenStrata',
    documentsMetaDescription:
      'कार्यवृत्त, बैठक सूचनाएँ और फ़ॉर्म B व फ़ॉर्म F प्रमाणपत्र, असली दस्तावेज़ों की तरह छपने के लिए सजाए गए।',
    documentsSampleTitle: 'नमूना डेटा — यह टेम्पलेट है, दर्ज अभिलेख नहीं',
    documentsSampleNote:
      'इन पृष्ठों पर हर नाम, तिथि और राशि एक काल्पनिक बिल्डिंग का नमूना डेटा है। हम जो दिखा रहे हैं वह लेआउट और शब्दावली है; हस्ताक्षर या दाखिल करने से पहले सामग्री को अपने अभिलेखों से बदलें।',
    documentsPick: 'दस्तावेज़ चुनें',
    documentsPrint: 'यह दस्तावेज़ प्रिंट करें',
    documentsPrintAll: 'पूरा सेट प्रिंट करें',
    documentsPrintHint:
      'प्रिंट करने पर वेबसाइट छिप जाती है और शीट छपती है: ऊपर आपका लेटरहेड, फिर दस्तावेज़, फिर हस्ताक्षर पंक्तियाँ।'
  },
  fil: {
    documentsBadge: 'Mga dokumentong ready i-print',
    documentsTitle: 'Mga dokumentong kayang pirmahan ng konseho',
    documentsIntro:
      'Minutes, abiso ng pulong at mga sertipiko ng paglilipat, inayos para sa tunay na papel — letterhead, page break at linya ng lagda. Buksan, i-print, i-file.',
    documentsPageTitle: 'Mga dokumentong ready i-print — OpenStrata',
    documentsMetaDescription:
      'Minutes, abiso ng pulong at sertipiko ng Form B at Form F, inayos para i-print na parang tunay na dokumento.',
    documentsSampleTitle: 'Sample na data — template ito, hindi nakatalang rekord',
    documentsSampleNote:
      'Lahat ng pangalan, petsa at halaga sa mga pahinang ito ay sample na data mula sa isang kathang-isip na building. Ang ipinapakita namin ay ang layout at pananalita; palitan ang nilalaman ng sarili mong rekord bago pumirma o mag-file.',
    documentsPick: 'Pumili ng dokumento',
    documentsPrint: 'I-print ang dokumentong ito',
    documentsPrintAll: 'I-print ang buong set',
    documentsPrintHint:
      'Sa pag-print, nakatago ang website at ang sheet ang nalilimbag: letterhead sa itaas, ang dokumento, at ang mga linya ng lagda.'
  },
  pl: {
    documentsBadge: 'Dokumenty gotowe do druku',
    documentsTitle: 'Dokumenty, które rada może podpisać',
    documentsIntro:
      'Protokoły, zawiadomienia o zebraniu i certyfikaty przeniesienia własności, przygotowane pod prawdziwy papier — nagłówek, podział stron i linie na podpisy. Otwórz, wydrukuj, włącz do akt.',
    documentsPageTitle: 'Dokumenty gotowe do druku — OpenStrata',
    documentsMetaDescription:
      'Protokoły, zawiadomienia o zebraniu oraz certyfikaty Formularz B i Formularz F, przygotowane do druku jak prawdziwe dokumenty.',
    documentsSampleTitle: 'Dane przykładowe — to szablon, nie złożony dokument',
    documentsSampleNote:
      'Każde nazwisko, data i kwota na tych stronach to dane przykładowe z fikcyjnego budynku. Pokazujemy układ i treść; przed podpisaniem lub złożeniem zastąp zawartość własnymi aktami.',
    documentsPick: 'Wybierz dokument',
    documentsPrint: 'Wydrukuj ten dokument',
    documentsPrintAll: 'Wydrukuj cały zestaw',
    documentsPrintHint:
      'Drukowanie ukrywa stronę i drukuje arkusz: nagłówek u góry, dokument, potem linie na podpisy.'
  },
  uk: {
    documentsBadge: 'Документи, готові до друку',
    documentsTitle: 'Документи, які рада може підписати',
    documentsIntro:
      'Протоколи, повідомлення про засідання та сертифікати передачі, зверстані під справжній папір — бланк, розриви сторінок і рядки для підписів. Відкрийте, надрукуйте, підшийте.',
    documentsPageTitle: 'Документи, готові до друку — OpenStrata',
    documentsMetaDescription:
      'Протоколи, повідомлення про засідання та сертифікати Форма B і Форма F, зверстані, щоб друкуватися як справжні документи.',
    documentsSampleTitle: 'Зразкові дані — це шаблон, а не поданий документ',
    documentsSampleNote:
      'Кожне ім’я, дата й сума на цих сторінках — зразкові дані з вигаданої будівлі. Ми показуємо верстку й формулювання; перед підписанням чи поданням замініть вміст власними записами.',
    documentsPick: 'Виберіть документ',
    documentsPrint: 'Надрукувати цей документ',
    documentsPrintAll: 'Надрукувати весь набір',
    documentsPrintHint:
      'Друк ховає сайт і друкує аркуш: ваш бланк угорі, документ, далі рядки для підписів.'
  },
  sw: {
    documentsBadge: 'Nyaraka tayari kuchapishwa',
    documentsTitle: 'Nyaraka ambazo baraza linaweza kutia sahihi',
    documentsIntro:
      'Kumbukumbu, notisi za mkutano na vyeti vya uhamisho, zimepangwa kwa karatasi halisi — kichwa cha barua, migawanyiko ya kurasa na mistari ya sahihi. Fungua, chapisha, weka kwenye faili.',
    documentsPageTitle: 'Nyaraka tayari kuchapishwa — OpenStrata',
    documentsMetaDescription:
      'Kumbukumbu, notisi za mkutano na vyeti vya Fomu B na Fomu F, zimepangwa kuchapishwa kama nyaraka halisi.',
    documentsSampleTitle: 'Data ya mfano — hii ni kiolezo, si rekodi iliyowasilishwa',
    documentsSampleNote:
      'Kila jina, tarehe na kiasi kwenye kurasa hizi ni data ya mfano kutoka jengo la kubuni. Tunachoonyesha ni mpangilio na maneno; badilisha yaliyomo na rekodi zako kabla ya kutia sahihi au kuwasilisha.',
    documentsPick: 'Chagua nyaraka',
    documentsPrint: 'Chapisha nyaraka hii',
    documentsPrintAll: 'Chapisha seti kamili',
    documentsPrintHint:
      'Kuchapisha huficha tovuti na huchapisha karatasi: kichwa cha barua juu, nyaraka, kisha mistari ya sahihi.'
  }
};

const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

// 1. Translation type — its members end on the `changelogViewRss: string;};` tail.
const typeMembers = Object.keys(english).map((key) => `${key}: string`).join('; ');
const typeTail = 'changelogViewRss: string;};';
if (!source.includes(typeTail)) throw new Error('Could not locate the Translation type tail.');
source = source.replace(typeTail, `changelogViewRss: string; ${typeMembers};};`);

// 2. English catalog — its block closes with `changelogViewRss: '...'\n};`.
const englishTail = /(changelogViewRss: '(?:[^'\\]|\\.)*'),?\n\};/;
if (!englishTail.test(source)) throw new Error('Could not locate the English catalog tail.');
source = source.replace(englishTail, (match, head) => `${head}, ${kv(english)}\n};`);

// 3. Per-locale override blocks — each ends `...changelogViewRss: '...', },`.
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
console.log(`Injected ${Object.keys(english).length} print-ready-document keys into src/lib/i18n.ts`);
