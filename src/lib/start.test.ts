import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  START_CHOICES,
  START_KEY,
  START_PENDING_CLASS,
  TOKEN_KEY,
  parseStartChoice,
  serializeStartChoice,
  shouldShowStart
} from './start';

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

describe('the first-visit answer', () => {
  it('accepts only the two answers we offer', () => {
    expect(parseStartChoice('exploring')).toBe('exploring');
    expect(parseStartChoice('setup')).toBe('setup');
    for (const junk of ['', 'yes', 'true', 'EXPLORING', '{"choice":"setup"}', null, undefined]) {
      expect(parseStartChoice(junk as string)).toBeNull();
    }
  });

  it('round-trips through storage', () => {
    for (const choice of START_CHOICES) {
      expect(parseStartChoice(serializeStartChoice(choice))).toBe(choice);
    }
  });

  it('asks signed-out visitors who have not answered', () => {
    expect(shouldShowStart({ signedIn: false, choice: null })).toBe(true);
  });

  it('never asks someone who is signed in, or who has already answered', () => {
    expect(shouldShowStart({ signedIn: true, choice: null })).toBe(false);
    expect(shouldShowStart({ signedIn: false, choice: 'exploring' })).toBe(false);
    expect(shouldShowStart({ signedIn: false, choice: 'setup' })).toBe(false);
    expect(shouldShowStart({ signedIn: true, choice: 'exploring' })).toBe(false);
  });
});

describe('the before-first-paint contract', () => {
  /**
   * Visibility is decided in three places that must agree: the inline script in
   * app.html sets the class, app.css acts on it, and this module owns the rule
   * and the storage key. A rename in any one of them would silently show a
   * first-time visitor a dashboard of someone else's numbers, so it is asserted.
   */
  const html = read('src/app.html');
  const css = read('src/app.css');

  it('sets the pending class from app.html, using the same key', () => {
    expect(html).toContain(START_KEY);
    expect(html).toContain(TOKEN_KEY);
    expect(html).toContain(START_PENDING_CLASS);
  });

  it('hides the dashboard and shows the question when that class is present', () => {
    expect(css).toContain(`.${START_PENDING_CLASS} .dashboard-body`);
    expect(css).toContain(`.${START_PENDING_CLASS} .start-choice`);
  });

  it('keeps the dashboard in the prerendered markup for crawlers', () => {
    // The swap is CSS, not a conditional render: the real content must still be
    // in the HTML a crawler receives.
    const page = read('src/routes/+page.svelte');
    expect(page).toContain('class="dashboard-body"');
    expect(page).toContain('<StartChoice');
  });
});
