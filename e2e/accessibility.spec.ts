import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  ['dashboard', '/'],
  ['pay', '/pay'],
  ['units', '/units'],
  ['accounting', '/accounting'],
  ['docs', '/docs'],
  ['calendar', '/calendar'],
  ['meetings', '/meetings'],
  ['tax', '/tax'],
  ['documents', '/documents']
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('openstrata-start', 'exploring');
    localStorage.setItem('openstrata-tour-seen', '1');
  });
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname.startsWith('/api/')) return route.abort();
    return route.continue();
  });
});

for (const [name, path] of pages) {
  test(`${name} has no serious or critical WCAG 2.1 A/AA violations`, async ({ page }) => {
    await page.goto(path);
    // Dev-server hydration of the heavier pages can take a few seconds; wait for
    // the app rather than scanning a half-hydrated page.
    await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', { timeout: 20_000 });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );
    // Print the rule and the offending nodes so a failure is actionable.
    const summary = blocking
      .map(
        (violation) =>
          `${violation.id} (${violation.impact}): ` +
          violation.nodes
            .slice(0, 6)
            .map((node) => `${node.target.join(' ')} — ${(node.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 160)}`)
            .join(' | ')
      )
      .join('\n');
    expect(blocking, summary).toEqual([]);
  });
}
