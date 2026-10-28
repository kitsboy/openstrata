import { afterEach, describe, expect, it } from 'vitest';
import { locale } from '../i18n';
import { money, moneyCompact, satsLabel } from './format';

afterEach(() => locale.set('en'));

describe('money', () => {
  it('formats English as the demo has always shown it', () => {
    locale.set('en');
    expect(money(57_600)).toBe('$576.00');
    expect(money(-12_345)).toBe('-$123.45');
  });

  it('follows the interface locale instead of a fixed en-CA', () => {
    locale.set('en');
    const english = money(57_600);
    locale.set('fr');
    const french = money(57_600);
    expect(french).not.toBe(english);
    // French Canadian puts the symbol after the amount and a comma before the cents.
    expect(french.replace(/\u00a0|\u202f/g, ' ')).toContain('576,00');
    expect(french.replace(/\u00a0|\u202f/g, ' ').trim().endsWith('$')).toBe(true);
  });

  it('rounds cents rather than printing a float', () => {
    locale.set('en');
    expect(money(1_05.6)).toBe('$1.06');
    expect(moneyCompact(57_640)).toBe('$576');
  });

  it('groups sats in the locale and keeps the unit name', () => {
    locale.set('en');
    expect(satsLabel(5_000_000)).toBe('5,000,000 sats');
    locale.set('fr');
    expect(satsLabel(5_000_000).replace(/\u00a0|\u202f/g, '\u00a0')).toContain('sats');
  });
});
