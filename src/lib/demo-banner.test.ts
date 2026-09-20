import { describe, it, expect } from 'vitest';
import {
  DEMO_BANNER_TTL_DAYS,
  parseDismissal,
  shouldShowDemoBanner,
  utcDay
} from './demo-banner';

const base = {
  settled: true,
  signedIn: false,
  apiModeDemo: true,
  dismissedRaw: null
};

describe('demo banner rule', () => {
  it('shows for an unsigned visitor on sample data', () => {
    expect(shouldShowDemoBanner(base)).toBe(true);
  });

  it('never shows to a signed-in council', () => {
    expect(shouldShowDemoBanner({ ...base, signedIn: true })).toBe(false);
  });

  it('never shows before the session has settled', () => {
    expect(shouldShowDemoBanner({ ...base, settled: false })).toBe(false);
  });

  it('never shows when a host is configured, even signed out', () => {
    expect(shouldShowDemoBanner({ ...base, apiModeDemo: false })).toBe(false);
  });

  it('hides for a fresh dismissal and returns after the TTL', () => {
    const today = utcDay();
    expect(shouldShowDemoBanner({ ...base, dismissedRaw: String(today), nowDays: today })).toBe(false);
    expect(
      shouldShowDemoBanner({ ...base, dismissedRaw: String(today), nowDays: today + DEMO_BANNER_TTL_DAYS })
    ).toBe(true);
  });

  it('reads hostile dismissal values as never dismissed', () => {
    expect(parseDismissal(null)).toBeNull();
    expect(parseDismissal('nonsense')).toBeNull();
    expect(parseDismissal('-5')).toBeNull();
    expect(parseDismissal('1760000000')).toBe(1_760_000_000);
  });

  it('computes a stable UTC day number', () => {
    expect(utcDay(new Date('2026-09-19T00:00:00Z'))).toBe(
      utcDay(new Date('2026-09-19T23:59:59Z'))
    );
  });
});
