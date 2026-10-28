/**
 * Integer cents in, display strings out. Keeps the demo ledger off binary floats.
 *
 * These read the active interface locale rather than a fixed `en-CA`, because
 * every one of these strings is shown to a reader: a French page that says
 * « Encaissement 576,00 $ » next to a card that says "$576.00" is not localized.
 * `get(locale)` is read at call time, and every component that prints money also
 * prints catalog copy, so a language change re-renders and re-formats together.
 */

import { get } from 'svelte/store';
import { formatCurrency, formatNumber, locale } from '../i18n';

/** Cents as dollars in the reader's locale, with the currency's own formatting. */
export function money(cents: number): string {
	return formatCurrency(Math.round(cents) / 100, get(locale));
}

/** The same amount without cents, for axis labels and chip-sized figures. */
export function moneyCompact(cents: number): string {
	return formatCurrency(Math.round(cents) / 100, get(locale), { maximumFractionDigits: 0 });
}

/** CAD locked at the demo rate. `btcCadCents` is CAD cents per 1 BTC. */
export function btcQuote(cents: number, btcCadCents: number): { sats: number; btc: string } {
	const sats = Math.round((cents * 100_000_000) / btcCadCents);
	const whole = Math.floor(sats / 100_000_000);
	const frac = String(sats % 100_000_000).padStart(8, '0');
	return { sats, btc: `${whole}.${frac}` };
}

/**
 * Sats keep their unit name in every locale — it is the Lightning unit, not an
 * English word — but the digits group the way the reader's locale groups them.
 */
export function satsLabel(sats: number): string {
	return `${formatNumber(sats, get(locale))} sats`;
}
