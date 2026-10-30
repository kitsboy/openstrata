import { describe, expect, it, vi } from 'vitest';
import {
  english,
  formatCurrency,
  formatDate,
  formatNumber,
  locales,
  type Translation
} from './i18n';

import fr from './locales/fr';
import es from './locales/es';
import zh from './locales/zh';
import hi from './locales/hi';
import fil from './locales/fil';
import pl from './locales/pl';
import uk from './locales/uk';
import sw from './locales/sw';
import { get } from 'svelte/store';
import { copy, locale } from './i18n';

const overrides: Partial<Record<(typeof locales)[number]['code'], Partial<Translation>>> = { fr, es, zh, hi, fil, pl, uk, sw };
const translationKeys = Object.keys(english) as Array<keyof Translation>;

describe('i18n catalog', () => {
  it('loads the selected locale and does not apply a stale selection', async () => {
    const stop = copy.subscribe(() => {});
    try {
      locale.set('fr');
      await vi.waitFor(() => expect(get(copy).search).toBe(fr.search));
      locale.set('hi');
      locale.set('en');
      await Promise.resolve();
      expect(get(copy).search).toBe(english.search);
    } finally {
      locale.set('en');
      stop();
    }
  });
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

  // `fill()` leaves a slot with no value exactly as written, which is right for a
  // missing value but wrong for a missing translation: a reader would see
  // `{amount}`. So every locale has to carry the same slots as the English source.
  it('every translation carries the same {slots} as the English source', () => {
    const slots = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(',');
    for (const locale of locales) {
      const block = overrides[locale.code];
      if (!block) continue;
      for (const [key, value] of Object.entries(block)) {
        const source = english[key as keyof Translation];
        expect(slots(value as string), `${locale.code}.${key} slots`).toBe(slots(source));
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

  it('formatDate keeps the calendar day in the reader’s own zone', () => {
    // No `timeZone` here on purpose: this is the path a page takes, and a bare
    // `YYYY-MM-DD` used to land on UTC midnight and render as the day before
    // for anyone west of UTC.
    const out = formatDate('2026-08-25', 'en', { month: 'short', day: 'numeric' });
    expect(out).toContain('Aug 25');
  });
});
