import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { custodyChecks, custodyLimits, custodySteps, custodyToday } from './custody';

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

/**
 * Keys the English catalog offers, read the same way `scripts/audit-i18n.mjs`
 * reads them: an identifier immediately followed by a quoted string.
 */
const catalogKeys = (() => {
  const catalog = read('src/lib/i18n.ts');
  const start = catalog.indexOf('const english: Translation = {');
  const end = catalog.indexOf('\n};', start);
  const block = catalog.slice(start, end);
  return new Set([...block.matchAll(/(?:^|[\s,{])([A-Za-z][A-Za-z0-9]*):\s*'/g)].map((m) => m[1]));
})();

/** Every `$copy.someKey` a component references. */
const referencedKeys = (file: string) =>
  [...new Set([...read(file).matchAll(/\$copy\.([A-Za-z][A-Za-z0-9]*)/g)].map((m) => m[1]))];

describe('custody content', () => {
  it('walks the money through three steps, each with its own mark', () => {
    expect(custodySteps).toHaveLength(3);
    expect(new Set(custodySteps.map((step) => step.icon)).size).toBe(3);
    for (const step of custodySteps) {
      expect(step.title.length).toBeGreaterThan(3);
      expect(step.body.length).toBeGreaterThan(40);
    }
  });

  it('states the limits as things the software cannot do', () => {
    // The promise only reads as a promise if each line is an impossibility.
    expect(custodyLimits.length).toBeGreaterThanOrEqual(4);
    for (const limit of custodyLimits) {
      expect(limit).toMatch(/^(Move|Change|Act|See|Take)\b/);
    }
  });

  it('makes every promise checkable, not aspirational', () => {
    expect(custodyChecks.length).toBeGreaterThanOrEqual(3);
    for (const check of custodyChecks) {
      expect(check).toMatch(/^(Verify|Export|Open|Run)\b/);
    }
  });

  it('says plainly what is not live yet', () => {
    expect(custodyToday.length).toBeGreaterThanOrEqual(2);
    expect(custodyToday.join(' ')).toMatch(/has not run on a public host|has moved through OpenStrata yet/);
  });

  it('stays in short sentences a treasurer will actually read', () => {
    const all = [
      ...custodySteps.map((step) => step.body),
      ...custodyLimits,
      ...custodyChecks,
      ...custodyToday
    ];
    for (const line of all) {
      expect(line.length, line).toBeLessThanOrEqual(340);
      expect(line).not.toMatch(/<[a-z]+>/); // no markup smuggled into copy
      expect(line.trim()).toBe(line);
    }
  });

  it('never claims the money passes through us', () => {
    // The one sentence this page must not contain.
    const all = [custodySteps.map((s) => s.body), custodyLimits, custodyChecks, custodyToday]
      .flat()
      .join(' ')
      .toLowerCase();
    expect(all).not.toMatch(/we (hold|keep|store) (your|their|the community)\b/);
  });
});

describe('custody page catalog keys', () => {
  const page = 'src/routes/custody/+page.svelte';

  it('references only keys that exist — a typo renders as a blank line', () => {
    const missing = referencedKeys(page).filter((key) => !catalogKeys.has(key));
    expect(missing).toEqual([]);
  });

  it('uses the catalog for its chrome instead of hardcoding English', () => {
    // Headings, badge and call to action go through the catalog. Body prose is
    // deliberately not catalogued (see the note in custody.ts), so this asserts
    // on the chrome only.
    const source = read(page);
    for (const key of [
      'custodyBadge',
      'custodyTitle',
      'custodyIntro',
      'custodyPageTitle',
      'custodyMetaDescription',
      'custodyFlowTitle',
      'custodyCantTitle',
      'custodyCheckTitle',
      'custodyTodayTitle',
      'custodyCta'
    ]) {
      expect(source, key).toContain(`$copy.${key}`);
      expect(catalogKeys.has(key), key).toBe(true);
    }
  });

  it('keeps the checkout payment-label keys in the catalog too', () => {
    const checkout = 'src/lib/components/CheckoutFlow.svelte';
    const missing = referencedKeys(checkout).filter((key) => !catalogKeys.has(key));
    expect(missing).toEqual([]);
    expect(referencedKeys(checkout)).toContain('checkoutLabelTitle');
  });

  it('links the page from the home page and the footer', () => {
    const home = read('src/routes/+page.svelte');
    expect(home).toContain('href="/custody"');
    expect((home.match(/href="\/custody"/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('is listed for crawlers', () => {
    expect(read('scripts/generate-sitemap.mjs')).toContain("'/custody'");
    expect(read('static/llms.txt')).toContain('/custody');
  });
});
