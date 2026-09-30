import { describe, it, expect } from 'vitest';
import {
  newComplaint,
  issueNotice,
  startReview,
  canImposeFine,
  imposeFine,
  decideNoFine,
  FINE_CAP_BP
} from '../src/enforcement/enforcement.js';

const base = {
  id: 'C-1',
  unitId: '302',
  bylawRef: 'Short-term rental ban bylaw',
  breachKind: 'short_term_rental' as const, // cap $1,000 STR
  receivedAt: '2026-08-01',
  evidence: true
};

describe('bylaw enforcement — intake', () => {
  it('requires written evidence on the complaint', () => {
    expect(() => newComplaint({ ...base, evidence: false })).toThrow(/requires evidence/);
  });

  it('creates a received complaint', () => {
    expect(newComplaint(base).state).toBe('received');
  });
});

describe('bylaw enforcement — notice + BLOCK_FINE_ACTIONS', () => {
  it('issues a notice that locks fine actions for 14 days', () => {
    const c = issueNotice(newComplaint(base), '2026-08-03');
    expect(c.state).toBe('notice_issued');
    expect(c.noticeDeadline).toBe('2026-08-17'); // +14 days
    expect(canImposeFine(c, '2026-08-16').blocked).toBe('BLOCK_FINE_ACTIONS');
    expect(canImposeFine(c, '2026-08-16').inReviewWindow).toBe(true);
  });

  it('allows imposing a fine only after the review window elapses', () => {
    const c = issueNotice(newComplaint(base), '2026-08-03');
    const gate = canImposeFine(c, '2026-08-17');
    expect(gate.allowed).toBe(true);
    expect(gate.blocked).toBeNull();
  });

  it('reports no-notice when the complaint is not yet on notice', () => {
    const c = newComplaint(base);
    expect(canImposeFine(c, '2026-08-17').blocked).toBe('no-notice');
  });
});

describe('bylaw enforcement — impose fine', () => {
  const notice = () => startReview(issueNotice(newComplaint(base), '2026-08-03'));

  it('refuses a fine before the window with minutes', () => {
    const res = imposeFine(notice(), '2026-08-16', { councilMinutesRef: 'M-9', amountBasis: 10_000 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/BLOCK_FINE_ACTIONS/);
  });

  it('requires a council decision recorded in minutes', () => {
    const res = imposeFine(notice(), '2026-08-17', { councilMinutesRef: '', amountBasis: 10_000 });
    expect(res.ok).toBe(false);
  });

  it('blocks a fine above the statutory cap', () => {
    const res = imposeFine(notice(), '2026-08-17', {
      councilMinutesRef: 'M-9',
      amountBasis: FINE_CAP_BP.short_term_rental + 1
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/exceeds statutory cap/);
  });

  it('applies a compliant fine after the window with minutes', () => {
    const res = imposeFine(notice(), '2026-08-17', {
      councilMinutesRef: 'M-9',
      amountBasis: 40_000
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.complaint.state).toBe('fine_posted');
      expect(res.complaint.fineAmountBasis).toBe(40_000);
      expect(res.complaint.councilMinutesRef).toBe('M-9');
    }
  });

  it('enforces the lower $200 cap for standard bylaw contraventions', () => {
    const c = newComplaint({ ...base, id: 'C-2', breachKind: 'standard' });
    const n = startReview(issueNotice(c, '2026-08-03'));
    const res = imposeFine(n, '2026-08-17', {
      councilMinutesRef: 'M-9',
      amountBasis: FINE_CAP_BP.standard + 1
    });
    expect(res.ok).toBe(false);
  });

  it('records a no-fine council decision and closes the case', () => {
    expect(decideNoFine(notice(), 'M-9').state).toBe('decided_no_fine');
    expect(() => decideNoFine(notice(), '')).toThrow(/REQUIRE_MINUTES/);
  });
});