import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('openstrata-start', 'exploring');
    localStorage.setItem('openstrata-tour-seen', '1');
  });
  // The tests never talk to a real backend, bank, analytics endpoint or host.
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname.startsWith('/api/')) return route.abort();
    return route.continue();
  });
});

test('signs in with an isolated API response and signs out', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('openstrata-api-base', '/'));
  await page.route('**/api/v1/auth/login', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ email: 'owner@example.test', password: 'example-password' });
    await route.fulfill({ json: { token: 'test-session-token', user: { id: '1', email: 'owner@example.test', displayName: 'Test Owner', role: 'admin' }, council: { id: '1', name: 'Test Council' } } });
  });
  await page.route('**/api/v1/auth/logout', (route) => route.fulfill({ json: { ok: true } }));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email', { exact: true }).fill('owner@example.test');
  await dialog.getByLabel('Password', { exact: true }).fill('example-password');
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open profile menu' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('openstrata-token'))).toBe('test-session-token');
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Open profile menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('openstrata-token'))).toBeNull();
});

test('keeps keyboard focus inside the sign-in dialog and restores it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true');
  const trigger = page.getByRole('button', { name: 'Sign in', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const shell = document.querySelector('dialog');
      return shell ? shell.contains(document.activeElement) : false;
    });
    expect(inside, `focus left the dialog after ${step + 1} tab(s)`).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('rehearses Interac payment without contacting a bank', async ({ page }) => {
  await page.goto('/pay?unit=207&rail=etransfer');
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true');
  await page.getByRole('button', { name: /open your bank and pay/i }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /create the request/i }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByRole('textbox').fill('owner@example.test');
  await dialog.getByRole('button', { name: /create the request/i }).click();
  await expect(dialog.getByText(/simulation:.*nothing.*sent/i)).toBeVisible();
  await dialog.locator('.interac-banks button').first().click();
  await dialog.getByRole('button', { name: /approve in my bank/i }).click();
  await expect(dialog.getByText(/approved and deposited/i).first()).toBeVisible();
  await expect(dialog.locator('.interac-badge')).toContainText(/simulation/i);
});
