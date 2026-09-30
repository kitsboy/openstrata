#!/usr/bin/env node
/**
 * One-off maintenance script: injects the v0.3.26 keys (building drill-down
 * note, deadline calendar labels) into src/lib/i18n.ts across all 9 locales.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
let source = fs.readFileSync(file, 'utf8');

const english = {
  drillDownNote: 'Unit balances, payment history and live detail live in Strata Tools.',
  calTitle: 'Deadline calendar',
  calHint: 'Due dates, statutory windows shaded, overdue in red.',
  calLegendDue: 'Due',
  calLegendWindow: 'Statutory window'
};

const translations = {
  fr: {
    drillDownNote: 'Soldes des unités, historique des paiements et détails en direct dans Strata Tools.',
    calTitle: 'Calendrier des échéances',
    calHint: 'Dates limites, fenêtres légales ombrées, retards en rouge.',
    calLegendDue: 'Échéance',
    calLegendWindow: 'Fenêtre légale'
  },
  es: {
    drillDownNote: 'Saldos por unidad, historial de pagos y detalle en vivo en Strata Tools.',
    calTitle: 'Calendario de vencimientos',
    calHint: 'Fechas límite, ventanas legales sombreadas, atrasos en rojo.',
    calLegendDue: 'Vence',
    calLegendWindow: 'Ventana legal'
  },
  zh: {
    drillDownNote: '单位余额、付款记录和实时详情请见 Strata Tools。',
    calTitle: '截止日历',
    calHint: '截止日期、法定窗口底纹、逾期标红。',
    calLegendDue: '截止',
    calLegendWindow: '法定窗口'
  },
  hi: {
    drillDownNote: 'यूनिट बैलेंस, भुगतान इतिहास और लाइव विवरण Strata Tools में।',
    calTitle: 'डेडलाइन कैलेंडर',
    calHint: 'नियत तिथियाँ, छायांकित कानूनी विंडो, लाल में अतिदेय।',
    calLegendDue: 'नियत',
    calLegendWindow: 'कानूनी विंडो'
  },
  fil: {
    drillDownNote: 'Mga balanse ng unit, history ng bayad at live na detalye sa Strata Tools.',
    calTitle: 'Kalendaryo ng deadline',
    calHint: 'Mga due date, naka-shade na statutory window, pula ang overdue.',
    calLegendDue: 'Due',
    calLegendWindow: 'Statutory window'
  },
  pl: {
    drillDownNote: 'Salda jednostek, historia płatności i szczegóły na żywo w Strata Tools.',
    calTitle: 'Kalendarz terminów',
    calHint: 'Terminy, zacienione okna ustawowe, zaległości na czerwono.',
    calLegendDue: 'Termin',
    calLegendWindow: 'Okno ustawowe'
  },
  uk: {
    drillDownNote: 'Баланси секцій, історія платежів і дані наживо у Strata Tools.',
    calTitle: 'Календар строків',
    calHint: 'Дедлайни, затоновані законодавчі вікна, прострочені — червоним.',
    calLegendDue: 'Строк',
    calLegendWindow: 'Законодавче вікно'
  },
  sw: {
    drillDownNote: 'Salio za uniti, historia ya malipo na maelezo ya moja kwa moja kwenye Strata Tools.',
    calTitle: 'Kalenda ya muda wa mwisho',
    calHint: 'Tarehe za mwisho, madirisha ya kisheria yaliyofifia, nyekundu imechelewa.',
    calLegendDue: 'Muda',
    calLegendWindow: 'Dirisha la kisheria'
  }
};

const escape = (value) => value.replaceAll('\\\\', '\\\\\\\\').replaceAll("'", "\\'");
const kv = (map) => Object.entries(map).map(([k, v]) => `${k}: '${escape(v)}'`).join(', ');

const keys = Object.keys(english);
if (keys.some((k) => source.includes(`${k}: '`))) {
  console.log('v0.3.26 keys already present — nothing to do.');
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
console.log(`Injected ${keys.length} v0.3.26 keys into src/lib/i18n.ts across 9 locales`);
