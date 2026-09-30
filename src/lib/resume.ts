/**
 * "Continue where you left off" — the wizard's progress, kept locally.
 *
 * The 8-step Building Template Wizard holds everything in component state. If
 * someone stops halfway — phone call, lunch, closing the tab — the whole
 * building comes back blank, and "what did I type on step 3?" is a question a
 * person should never have to answer from memory. This module persists the
 * wizard's fields and the step they were on to localStorage, keyed by nothing
 * and belonging to nobody: it is a *draft*, not an account record. A draft on
 * this device. The workspace (or the saved-buildings JSON) remains the record
 * of truth, exactly like `setup.ts` — this is a nudge, not a ledger.
 *
 * Pure and testable: the only impure surface is `readDraft`/`writeDraft`, which
 * tolerate absent, malformed or hostile storage by degrading to "no draft",
 * the same convention `setup.ts` and `start.ts` follow. Corrupt storage must
 * never break the page it decorates.
 */

import { browser } from '$app/environment';

/** localStorage key holding the draft. One draft per device, like the tour. */
export const RESUME_KEY = 'openstrata-wizard-draft';

/** The wizard's own step count, mirrored from `routes/tools/wizard/+page.svelte`. */
export const WIZARD_TOTAL_STEPS = 8;

export type WizardDraft = {
  /** 0-based step index the visitor stopped on. */
  step: number;
  /** The building name, so the chip can say *which* building they were setting up. */
  name: string;
  jurisdiction: string;
  address: string;
  fiscalYearStart: string;
  bcfsaLicense: string;
  isSelfManaged: boolean;
  unitCount: number;
  defaultSqft: number;
  operatingBank: string;
  crfBank: string;
  crfPct: number;
  /** Sub-account names that were switched on. */
  subAccounts: string[];
  selectedServices: string[];
  /** Rail ids that were switched on. */
  paymentRails: string[];
  bylawChoice: 'standard' | 'import';
  savedAt: string;
};

export const EMPTY_DRAFT: WizardDraft = {
  step: 0,
  name: '',
  jurisdiction: 'BC',
  address: '',
  fiscalYearStart: 'January',
  bcfsaLicense: '',
  isSelfManaged: true,
  unitCount: 10,
  defaultSqft: 900,
  operatingBank: 'Vancouver Credit Union',
  crfBank: 'Vancouver Credit Union — CRF Trust',
  crfPct: 10,
  subAccounts: [],
  selectedServices: [],
  paymentRails: [],
  bylawChoice: 'standard',
  savedAt: ''
};

const clampStep = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(Math.trunc(value), 0), WIZARD_TOTAL_STEPS - 1)
    : 0;

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

/**
 * Parse a persisted draft. Anything malformed, partial or hostile degrades to
 * `null` — a corrupt entry must never break the wizard, and `null` means "no
 * draft", which is the honest answer when the JSON cannot be trusted.
 */
export function parseWizardDraft(raw: string | null | undefined): WizardDraft | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const name = str(record.name).trim();
  // A draft with no name and no step is nothing worth resuming.
  if (!name && clampStep(record.step) === 0) return null;
  return {
    step: clampStep(record.step),
    name,
    jurisdiction: str(record.jurisdiction, 'BC'),
    address: str(record.address),
    fiscalYearStart: str(record.fiscalYearStart, 'January'),
    bcfsaLicense: str(record.bcfsaLicense),
    isSelfManaged: bool(record.isSelfManaged, true),
    unitCount: num(record.unitCount, 10),
    defaultSqft: num(record.defaultSqft, 900),
    operatingBank: str(record.operatingBank, 'Vancouver Credit Union'),
    crfBank: str(record.crfBank, 'Vancouver Credit Union — CRF Trust'),
    crfPct: num(record.crfPct, 10),
    subAccounts: strArray(record.subAccounts),
    selectedServices: strArray(record.selectedServices),
    paymentRails: strArray(record.paymentRails),
    bylawChoice: record.bylawChoice === 'import' ? 'import' : 'standard',
    savedAt: str(record.savedAt)
  };
}

/** Serialize a draft for storage. Kept here so read and write cannot drift. */
export function serializeWizardDraft(draft: WizardDraft): string {
  return JSON.stringify({
    ...draft,
    name: draft.name.trim(),
    step: clampStep(draft.step)
  });
}

/**
 * Should the dashboard show the resume chip? Only when there is a draft with a
 * building name, and the visitor stopped anywhere other than the first step
 * (a nameless step-0 draft is "looked at the wizard once", not "left work
 * behind"). Complete builds are cleared by the wizard, so a draft here means
 * genuinely unfinished work.
 */
export function shouldResume(draft: WizardDraft | null): boolean {
  return Boolean(draft && draft.name.trim() && draft.step > 0);
}

export function readWizardDraft(): WizardDraft | null {
  if (!browser) return null;
  try {
    return parseWizardDraft(localStorage.getItem(RESUME_KEY));
  } catch {
    return null;
  }
}

export function writeWizardDraft(draft: Omit<WizardDraft, 'savedAt'>): void {
  if (!browser) return;
  try {
    localStorage.setItem(
      RESUME_KEY,
      serializeWizardDraft({ ...draft, savedAt: new Date().toISOString() })
    );
  } catch {
    /* private mode / storage full — the draft simply is not remembered */
  }
}

/** Remove the draft — after a finished build, or when the visitor discards it. */
export function clearWizardDraft(): void {
  if (!browser) return;
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    /* storage unavailable */
  }
}
