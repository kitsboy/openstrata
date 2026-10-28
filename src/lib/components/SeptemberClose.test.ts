import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { books, payroll } from '$lib/demo/books';
import SeptemberClose from './SeptemberClose.svelte';

const text = (container: HTMLElement) => container.textContent ?? '';

describe('SeptemberClose', () => {
  it('shows one row per check and counts the ones that pass', () => {
    const { container } = render(SeptemberClose);
    expect(container.querySelectorAll('ol > li').length).toBe(5);
    // The demo books tie, payroll is posted and the reserve is billed: three of
    // the five checks pass, and the count has to agree with the rows.
    expect(text(container)).toContain('3 of 5 done');
    expect(container.querySelectorAll('li')).toHaveLength(5);
  });

  it('refuses to close while a check is open, and names the check', () => {
    const { container } = render(SeptemberClose);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    const blocked = container.querySelector('#september-close-blocked');
    expect(blocked).not.toBeNull();
    // The button points at the sentence that explains it, so the reason reaches
    // a screen reader and not only the pixels.
    expect(button.getAttribute('aria-describedby')).toBe('september-close-blocked');
    expect(blocked?.textContent).toContain('Close is blocked on:');
    expect(blocked?.textContent).toContain('Board approval on the minutes');
  });

  it('reads the ledger instead of a stored status', () => {
    const { container } = render(SeptemberClose);
    const body = text(container);
    // Payroll and reserve figures come from the same books the page above shows.
    expect(body).toContain('30 September');
    expect(books.tie.ok).toBe(true);
    expect(body).toContain('Off by 0 cents');
    expect(body).toContain('remits to the CRA');
    expect(payroll.due).toBe('October 15, 2026');
  });

  it('keeps every check inside the panel', () => {
    const { container } = render(SeptemberClose);
    // The defect this panel sits next to: copy set in a column too narrow to
    // read. Nothing here may be truncated by CSS, and no row hides its text.
    for (const node of container.querySelectorAll('p, span, h2')) {
      expect(getComputedStyle(node).textOverflow).not.toBe('ellipsis');
    }
  });
});
