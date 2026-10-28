import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { TAX_CATEGORIES } from '$lib/next30';
import Next30 from './Next30.svelte';

const text = (container: HTMLElement) => (container.textContent ?? '').replace(/\s+/g, ' ');

describe('Next30', () => {
  it('renders the three buckets with a count each', () => {
    const { container } = render(Next30);
    const headings = [...container.querySelectorAll('span')]
      .map((span) => span.textContent?.trim())
      .filter((value) => value === 'Today' || value === 'This week' || value === 'Later this month');
    expect(headings).toEqual(['Today', 'This week', 'Later this month']);
  });

  it('shows the items due on the sample today', () => {
    const { container } = render(Next30);
    expect(text(container)).toContain('T2 and T1044 due today');
    expect(text(container)).toContain('Fire inspection');
  });

  it('narrows to the tax page scope when given categories', () => {
    const { container } = render(Next30, {
      props: { categories: TAX_CATEGORIES, hint: 'Tax window' }
    });
    const body = text(container);
    expect(body).toContain('Tax window');
    expect(body).toContain('T2 and T1044 due');
    expect(body).toContain('Payroll remittance checkpoint');
    // A maintenance item is in the calendar but not in this window.
    expect(body).not.toContain('Fire inspection');
  });

  it('links to the calendar and never truncates its copy', () => {
    const { container } = render(Next30);
    const link = container.querySelector('a[href="/calendar"]');
    expect(link).not.toBeNull();
    for (const node of container.querySelectorAll('span, p, a')) {
      expect(getComputedStyle(node).textOverflow).not.toBe('ellipsis');
    }
  });
});
