import { describe, it, expect } from 'vitest';
import {
  checkQuorum,
  checkQuorumRescheduled,
  countVote,
  quorumRequired
} from '../src/meetings/meetings.js';

describe('quorum', () => {
  it('AGM quorum is 1/3 of eligible voters', () => {
    expect(quorumRequired('AGM', 30)).toBe(10);
    expect(checkQuorum('AGM', 30, 10).quorumMet).toBe(true);
    expect(checkQuorum('AGM', 30, 9).quorumMet).toBe(false);
  });

  it('council quorum is a majority of the council', () => {
    expect(quorumRequired('council', 0, 5)).toBe(3);
    expect(checkQuorum('council', 0, 3, 5).quorumMet).toBe(true);
  });

  it('rescheduled meeting needs only one present (30-min rule)', () => {
    expect(checkQuorumRescheduled(1).quorumMet).toBe(true);
    expect(checkQuorumRescheduled(0).quorumMet).toBe(false);
  });
});

describe('voting thresholds (abstentions excluded)', () => {
  it('majority needs > 50% of present-minus-abstain', () => {
    // present 20, abstain 4 -> effective 16; need 9 yes
    expect(countVote('majority', { eligible: 30, present: 20, yes: 9, no: 7, abstain: 4 }).passed).toBe(true);
    expect(countVote('majority', { eligible: 30, present: 20, yes: 8, no: 8, abstain: 4 }).passed).toBe(false);
  });

  it('three_quarter needs >= 75% of effective voters', () => {
    const v = countVote('three_quarter', { eligible: 30, present: 20, yes: 15, no: 5, abstain: 0 });
    expect(v.passed).toBe(true); // 15/20 = 75%
  });

  it('eighty uses ALL eligible voters as base', () => {
    // 8/10 = exactly 80% -> passes.
    expect(countVote('eighty', { eligible: 10, present: 8, yes: 8, no: 0, abstain: 0 }).passed).toBe(true);
    // 7/10 = 70% -> fails even if all present vote yes, because base is eligible.
    expect(countVote('eighty', { eligible: 10, present: 10, yes: 7, no: 3, abstain: 0 }).passed).toBe(false);
  });

  it('unanimous requires every effective voter to say yes', () => {
    expect(countVote('unanimous', { eligible: 10, present: 10, yes: 10, no: 0, abstain: 0 }).passed).toBe(true);
    expect(countVote('unanimous', { eligible: 10, present: 10, yes: 9, no: 1, abstain: 0 }).passed).toBe(false);
  });

  it('empty denominator fails closed', () => {
    expect(countVote('majority', { eligible: 10, present: 5, yes: 5, no: 0, abstain: 5 }).passed).toBe(false);
  });
});