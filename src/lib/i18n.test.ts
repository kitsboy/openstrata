import { describe, expect, it } from 'vitest';
import {
  english,
  formatCurrency,
  formatDate,
  formatNumber,
  locales,
  overrides,
  type Translation
} from './i18n';

const translationKeys = Object.keys(english) as Array<keyof Translation>;

describe('i18n catalog', () => {
  it('every non-English locale code maps to an override block', () => {
    for (const locale of locales) {
      if (locale.code === 'en') continue; // English is the base catalog, not an override
      expect(overrides[locale.code], `${locale.code} has overrides`).toBeDefined();
    }
  });

  it('every overridden key exists in the English catalog', () => {
    for (const locale of locales) {
      const block = overrides[locale.code];
      if (!block) continue;
      for (const key of Object.keys(block)) {
        expect(translationKeys, `${locale.code} key "${key}"`).toContain(key);
      }
    }
  });

  it('no locale overrides more keys than the French benchmark (full coverage)', () => {
    const frKeys = Object.keys(overrides.fr ?? {}).sort();
    for (const locale of locales) {
      if (locale.code === 'en') continue;
      const keys = Object.keys(overrides[locale.code] ?? {}).sort();
      for (const key of keys) {
        expect(frKeys, `${locale.code} key "${key}" must exist in fr coverage`).toContain(key);
      }
    }
  });

  it('every key in the catalog is a non-empty string in every locale', () => {
    for (const locale of locales) {
      const block = overrides[locale.code] ?? {};
      for (const key of translationKeys) {
        const value = block[key] ?? english[key];
        expect(typeof value, `${locale.code}.${key}`).toBe('string');
        expect(value.length, `${locale.code}.${key} non-empty`).toBeGreaterThan(0);
      }
    }
  });
});

describe('formatters', () => {
  it('formatNumber respects locale grouping', () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    // French groups thousands with a narrow no-break space (U+202F).
    expect(formatNumber(1234.5, 'fr').replace(/\u202f|\u00a0/g, ' ')).toBe('1 234,5');
  });

  it('formatCurrency renders CAD with the right symbol and grouping', () => {
    const en = formatCurrency(1234.5, 'en');
    expect(en).toContain('1,234.5');
    expect(en).toContain('$');
  });

  it('formatDate parses YYYY-MM-DD without timezone drift', () => {
    const out = formatDate('2026-08-25', 'en', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    expect(out).toContain('Aug');
    expect(out).toContain('2026');
  });
});
