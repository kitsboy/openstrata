import { describe, it, expect, beforeEach } from 'vitest';
import {
  EMPTY_DRAFT,
  RESUME_KEY,
  WIZARD_TOTAL_STEPS,
  clearWizardDraft,
  parseWizardDraft,
  readWizardDraft,
  serializeWizardDraft,
  shouldResume,
  writeWizardDraft,
  type WizardDraft
} from './resume';

const draft = (over: Partial<WizardDraft> = {}): WizardDraft => ({
  ...EMPTY_DRAFT,
  name: 'Harbour House',
  step: 3,
  savedAt: '2026-09-19T10:00:00.000Z',
  ...over
});

describe('wizard draft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a draft without drift', () => {
    const original = draft({ subAccounts: ['EV Charger Fund'], selectedServices: ['fire'], paymentRails: ['lightning'] });
    expect(parseWizardDraft(serializeWizardDraft(original))).toEqual(original);
  });

  it('degrades to null on absent, corrupt or non-object storage', () => {
    expect(parseWizardDraft(null)).toBeNull();
    expect(parseWizardDraft('')).toBeNull();
    expect(parseWizardDraft('not json')).toBeNull();
    expect(parseWizardDraft('[1,2,3]')).toBeNull();
    expect(parseWizardDraft('42')).toBeNull();
  });

  it('clamps a hostile step into the wizard range', () => {
    expect(parseWizardDraft(JSON.stringify({ ...draft({ step: 99 }) }))?.step).toBe(WIZARD_TOTAL_STEPS - 1);
    expect(parseWizardDraft(JSON.stringify({ ...draft({ step: -7 }) }))?.step).toBe(0);
    // A step that is not a number at all (injected as raw JSON) reads as step 0.
    const hostile = JSON.stringify(draft()).replace('"step":3', '"step":"3"');
    expect(parseWizardDraft(hostile)?.step).toBe(0);
  });

  it('treats a nameless step-0 draft as nothing worth resuming', () => {
    expect(parseWizardDraft(JSON.stringify({ ...draft({ step: 0 }), name: '  ' }))).toBeNull();
    // A name on step 0 is still a draft (someone typed then refreshed).
    expect(parseWizardDraft(JSON.stringify(draft({ step: 0 })))).not.toBeNull();
  });

  it('drops hostile array entries rather than trusting them', () => {
    const raw = JSON.stringify(draft())
      .replace('"subAccounts":[]', '"subAccounts":["ok",7,null,"also-ok"]')
      .replace('"paymentRails":[]', '"paymentRails":"lightning"');
    const parsed = parseWizardDraft(raw);
    expect(parsed?.subAccounts).toEqual(['ok', 'also-ok']);
    expect(parsed?.paymentRails).toEqual([]);
  });

  it('chips only for a named draft past the first step', () => {
    expect(shouldResume(draft())).toBe(true);
    expect(shouldResume(draft({ step: 0 }))).toBe(false);
    expect(shouldResume(draft({ name: '  ' }))).toBe(false);
    expect(shouldResume(null)).toBe(false);
  });

  it('reads and writes through localStorage, and clears', () => {
    expect(readWizardDraft()).toBeNull();
    writeWizardDraft(draft());
    expect(localStorage.getItem(RESUME_KEY)).not.toBeNull();
    expect(readWizardDraft()?.name).toBe('Harbour House');
    clearWizardDraft();
    expect(localStorage.getItem(RESUME_KEY)).toBeNull();
  });

  it('serializes a trimmed name', () => {
    const raw = serializeWizardDraft(draft({ name: '  Cedar Lane  ' }));
    expect(JSON.parse(raw).name).toBe('Cedar Lane');
  });
});
