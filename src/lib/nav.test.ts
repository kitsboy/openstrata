import { describe, expect, it } from 'vitest';
import { isNavGroup, navGroups, navItems, navParentFor } from './nav';

/**
 * The header exists to be scanned, so the tests here are about how little is in
 * it — and about the breadcrumb resolution that grouping made subtle.
 */
describe('header navigation', () => {
  it('keeps the inline bar to four things', () => {
    // Dashboard, Strata Tool, Library, Company. Adding a fifth inline
    // destination is the thing that made the strip scroll sideways before.
    expect(navGroups.length).toBe(4);
    const inline = navGroups.filter((entry) => !isNavGroup(entry));
    expect(inline.map((entry) => (isNavGroup(entry) ? '' : entry.label))).toEqual([
      'Dashboard',
      'Strata Tool'
    ]);
  });

  it('folds Compliance and Docs into the Library menu', () => {
    // They were their own bar items; a council reads them, it does not go to them.
    const library = navGroups.find((entry) => isNavGroup(entry) && entry.label === 'Library');
    expect(library && isNavGroup(library)).toBe(true);
    const hrefs = library && isNavGroup(library) ? library.items.map((item) => item.href) : [];
    expect(hrefs[0]).toBe('/compliance');
    expect(hrefs[1]).toBe('/docs');
    expect(navGroups.some((entry) => !isNavGroup(entry) && entry.href === '/compliance')).toBe(false);
    expect(navGroups.some((entry) => !isNavGroup(entry) && entry.href === '/docs')).toBe(false);
  });

  it('loses nothing from the flat list the footer and search read', () => {
    const hrefs = navItems.map((item) => item.href);
    for (const href of [
      '/',
      '/tools',
      '/compliance',
      '/docs',
      '/legal',
      '/templates',
      '/documents',
      '/faq',
      '/changelog',
      '/about',
      '/pitch',
      '/roadmap',
      '/blog',
      '/rss'
    ]) {
      expect(hrefs, href).toContain(href);
    }
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('gives every menu item a reason to exist', () => {
    for (const entry of navGroups) {
      if (!isNavGroup(entry)) continue;
      expect(entry.items.length).toBeGreaterThan(1);
      for (const item of entry.items) expect(item.hint, item.href).toBeTruthy();
    }
  });
});

describe('navParentFor', () => {
  it('resolves /documents to itself, not to /docs', () => {
    // `/documents`.startsWith('/docs') is true — this is the bug that motivated
    // the function, and it mislabelled a breadcrumb with a link to the wrong page.
    expect(navParentFor('/documents')?.href).toBe('/documents');
    expect(navParentFor('/documents')?.label).toBe('Print-ready documents');
  });

  it('resolves a nested route to its parent, not to nothing', () => {
    expect(navParentFor('/docs/manual')?.href).toBe('/docs');
    expect(navParentFor('/tools/wizard')?.href).toBe('/tools');
  });

  it('never resolves the home page to a parent', () => {
    expect(navParentFor('/')).toBeNull();
  });

  it('returns null for a path that is not a destination', () => {
    expect(navParentFor('/nope')).toBeNull();
  });

  it('does not match a partial segment', () => {
    expect(navParentFor('/toolsmith')).toBeNull();
    expect(navParentFor('/legals')).toBeNull();
  });
});
