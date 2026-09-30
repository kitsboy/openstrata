import { describe, it, expect } from 'vitest';
import {
  FAMILY_SITE_CODES,
  MAX_RECEIVE_LABEL_LENGTH,
  SITE_SLUG,
  assertReceiveLabelFor,
  isReceiveLabelFor,
  parseReceiveLabel,
  receiveLabelFor,
  sanitizeSegment,
  siteCodeFor,
  unitToken
} from '../src/rails/receive-label.js';

const quote = { site: SITE_SLUG, communityId: 'northgate', unitRef: 'unit-302', refId: 'pay-9142' };

describe('site codes', () => {
  it('names every Give A Bit project distinctly', () => {
    const codes = Object.values(FAMILY_SITE_CODES);
    expect(new Set(codes).size).toBe(codes.length);
    expect(siteCodeFor('openstrata')).toBe('OST');
  });

  it('falls back to the slug for an unlisted site instead of throwing', () => {
    expect(siteCodeFor('brandnewthing')).toBe('BRAN');
  });

  it('handles case and padding in the slug', () => {
    expect(siteCodeFor('  OpenStrata ')).toBe('OST');
  });

  it('refuses a slug with nothing to build a code from', () => {
    expect(() => siteCodeFor('  ')).toThrow(/slug/);
  });
});

describe('segments', () => {
  it('keeps one spelling per unit whatever the caller sent', () => {
    for (const spelling of ['unit-302', 'U-302', '302', 'Unit 302']) {
      expect(unitToken(spelling)).toBe('U302');
    }
  });

  it('strips punctuation a wallet or memo field would choke on', () => {
    expect(sanitizeSegment('Cedar Point Strata #12 (BCS-9)')).toBe('Cedar-Point-Strata-12-BCS-9');
  });

  it('transliterates accents rather than dropping the letters', () => {
    expect(sanitizeSegment('Ville-Marie Édifice')).toBe('Ville-Marie-Edifice');
  });

  it('never returns an empty segment, so the label keeps its shape', () => {
    expect(sanitizeSegment('***')).toBe('x');
  });

  it('caps a segment so one long name cannot eat the whole label', () => {
    const long = sanitizeSegment('c'.repeat(120));
    expect(long.length).toBeLessThanOrEqual(34);
    expect(long.endsWith('-')).toBe(false);
  });
});

describe('receiveLabelFor', () => {
  it('leads with the site code, then council, unit and request', () => {
    expect(receiveLabelFor(quote)).toBe('OST northgate U302 pay-9142');
  });

  it('is deterministic — the same keys always rebuild the same label', () => {
    expect(receiveLabelFor(quote)).toBe(receiveLabelFor({ ...quote }));
  });

  it('separates two projects paying the same council and unit', () => {
    const ours = receiveLabelFor(quote);
    const theirs = receiveLabelFor({ ...quote, site: 'satohash' });
    expect(ours).not.toBe(theirs);
    expect(theirs.startsWith('SATO ')).toBe(true);
  });

  it('stays inside the length every wallet accepts', () => {
    const label = receiveLabelFor({
      site: SITE_SLUG,
      communityId: 'a'.repeat(80),
      unitRef: 'b'.repeat(80),
      refId: 'c'.repeat(80)
    });
    expect(label.length).toBeLessThanOrEqual(MAX_RECEIVE_LABEL_LENGTH);
    expect(label).not.toMatch(/\s{2,}/);
  });

  it('is plain ASCII', () => {
    const label = receiveLabelFor({ ...quote, communityId: 'Édifice №7 — cedar' });
    expect(label).toMatch(/^[\x20-\x7e]+$/);
  });
});

describe('reading a label back', () => {
  it('round-trips the parts that matter', () => {
    expect(parseReceiveLabel('OST northgate U302 pay-9142')).toEqual({
      siteCode: 'OST',
      communityId: 'northgate',
      unitRef: '302',
      refId: 'pay-9142'
    });
  });

  it('keeps a multi-word request id whole', () => {
    expect(parseReceiveLabel('OST northgate U302 roof levy')?.refId).toBe('roof levy');
  });

  it('returns null for anything that is not one of ours', () => {
    for (const junk of ['', 'Lightning Network', 'OST northgate', 'ost northgate U302 pay-9142']) {
      expect(parseReceiveLabel(junk)).toBeNull();
    }
  });
});

describe('the site guard', () => {
  it('recognises its own label', () => {
    expect(isReceiveLabelFor(receiveLabelFor(quote), SITE_SLUG)).toBe(true);
  });

  it('does not mistake a foreign label for ours', () => {
    const theirs = receiveLabelFor({ ...quote, site: 'satohash' });
    expect(isReceiveLabelFor(theirs, SITE_SLUG)).toBe(false);
  });

  it('refuses to let a foreign label through, loudly', () => {
    expect(() => assertReceiveLabelFor('SATO northgate U302 pay-9142', SITE_SLUG)).toThrow(/not tagged/);
    expect(() => assertReceiveLabelFor('Lightning Network', SITE_SLUG)).toThrow(/not tagged/);
  });

  it('accepts the label it just built', () => {
    expect(() => assertReceiveLabelFor(receiveLabelFor(quote), SITE_SLUG)).not.toThrow();
  });
});
