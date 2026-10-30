/**
 * The printed budget's line names and reasons, in the reader's language.
 *
 * The account names and the short reasons live on the books, which are demo
 * records in English. A French reader was therefore handed an English sheet with
 * translated headings, which is the worst of both: it looks translated and is
 * not. This module is the join between an account code and the catalog key that
 * holds its translated name, so the sheet prints the reader's words while the
 * code stays beside them for the auditor.
 *
 * Three rules:
 *
 * 1. **The code is the key.** A line is translated by its four-digit code, never
 *    by its English text: two lines could share a name, and a renamed account
 *    must not lose its translation.
 * 2. **A code the catalog does not know keeps the books' name.** A new expense
 *    account shows up in English rather than blank, and the test below fails so
 *    somebody adds the key instead of shipping half a sheet.
 * 3. **Numbers are never touched.** Only `name` and `reason` are replaced, so
 *    the sheet's arithmetic cannot move when the language does.
 */

import type { LedgerLine } from './demo/books';
import type { Translation } from './i18n';

/** Catalog key holding the printed name of each account code. */
export const LEDGER_NAME: Record<string, keyof Translation> = {
	'4000': 'accLine4000',
	'3500': 'accLine3500',
	'7010': 'accLine7010',
	'7020': 'accLine7020',
	'7030': 'accLine7030',
	'7040': 'accLine7040',
	'7050': 'accLine7050',
	'7060': 'accLine7060',
	'6100': 'accLine6100',
	'6110': 'accLine6110',
	'6120': 'accLine6120',
	'6130': 'accLine6130',
	'6140': 'accLine6140',
	'6200': 'accLine6200',
	'6210': 'accLine6210',
	'6215': 'accLine6215',
	'6220': 'accLine6220',
	'6230': 'accLine6230',
	'6240': 'accLine6240',
	'6250': 'accLine6250',
	'6260': 'accLine6260',
	'6270': 'accLine6270',
	'6280': 'accLine6280',
	'6290': 'accLine6290',
	'6300': 'accLine6300',
	'6310': 'accLine6310',
	'6320': 'accLine6320',
	'6330': 'accLine6330',
	'6340': 'accLine6340',
	'6350': 'accLine6350',
	'6360': 'accLine6360',
	'6370': 'accLine6370',
	'6380': 'accLine6380',
	'6390': 'accLine6390',
	'6400': 'accLine6400',
	'6410': 'accLine6410',
	'6490': 'accLine6490'
};

/** Catalog key holding the phrase printed beside a line's variance. */
export const LEDGER_REASON: Record<string, keyof Translation> = {
	'6210': 'accReason6210',
	'6230': 'accReason6230',
	'6240': 'accReason6240',
	'6260': 'accReason6260',
	'6320': 'accReason6320',
	'6340': 'accReason6340',
	'6360': 'accReason6360',
	'6410': 'accReason6410'
};

/** The line with its name in the reader's language, or the books' name. */
export function namedLine(line: LedgerLine, copy: Translation): LedgerLine {
	const key = LEDGER_NAME[line.code];
	return key ? { ...line, name: copy[key] } : line;
}

/** The line with its reason translated, when the catalog knows the code. */
export function reasonedLine(line: LedgerLine, copy: Translation): LedgerLine {
	const key = LEDGER_REASON[line.code];
	if (!key) return line;
	return { ...line, reason: copy[key] };
}

/** What the printed sheet needs: a translated name and a translated reason. */
export function printedLine(line: LedgerLine, copy: Translation): LedgerLine {
	return reasonedLine(namedLine(line, copy), copy);
}
