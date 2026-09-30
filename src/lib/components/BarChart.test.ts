import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import BarChart from './BarChart.svelte';

describe('BarChart', () => {
  it('renders a bar for each data point with an accessible label', () => {
    const { container } = render(BarChart, {
      props: {
        data: [
          { label: 'Jan', value: 10 },
          { label: 'Feb', value: 20 }
        ]
      }
    });
    // Hover zones and visible bars are both graphics-symbols; the visible
    // bars carry the .chart-bar class.
    const bars = container.querySelectorAll('rect.chart-bar');
    expect(bars.length).toBe(2);
    expect(bars[0]).toHaveAttribute('aria-label', 'Jan');
    expect(bars[1]).toHaveAttribute('aria-label', 'Feb');
  });

  it('renders secondary series when showSecondary is set', () => {
    const { container } = render(BarChart, {
      props: {
        data: [{ label: 'Q1', value: 10, value2: 5 }],
        showSecondary: true
      }
    });
    // Primary + secondary bars render side by side.
    expect(container.querySelectorAll('rect.chart-bar').length).toBe(2);
  });
});
