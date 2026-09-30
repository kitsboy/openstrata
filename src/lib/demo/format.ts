/** Integer cents in, display strings out. Keeps the demo ledger off binary floats. */

export function money(cents: number): string {
	const neg = cents < 0;
	const abs = Math.abs(Math.round(cents));
	const dollars = Math.floor(abs / 100);
	const rem = abs % 100;
	return `${neg ? '-' : ''}$${dollars.toLocaleString('en-CA')}.${String(rem).padStart(2, '0')}`;
}

export function moneyCompact(cents: number): string {
	const neg = cents < 0;
	const abs = Math.abs(Math.round(cents));
	const dollars = Math.round(abs / 100);
	return `${neg ? '-' : ''}$${dollars.toLocaleString('en-CA')}`;
}

/** CAD locked at the demo rate. `btcCadCents` is CAD cents per 1 BTC. */
export function btcQuote(cents: number, btcCadCents: number): { sats: number; btc: string } {
	const sats = Math.round((cents * 100_000_000) / btcCadCents);
	const whole = Math.floor(sats / 100_000_000);
	const frac = String(sats % 100_000_000).padStart(8, '0');
	return { sats, btc: `${whole}.${frac}` };
}

export function satsLabel(sats: number): string {
	return `${sats.toLocaleString('en-CA')} sats`;
}
