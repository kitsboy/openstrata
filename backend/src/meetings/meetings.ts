/**
 * Meetings — quorum calculation + voting engine (SPA s.48 and platform rules).
 *
 * - AGM quorum: persons holding/representing >= 1/3 of eligible voters.
 * - Council quorum: majority of council members.
 * - 30-Minute Rule: if quorum isn't met within 30 minutes the meeting must be
 *   rescheduled to >= 7 days later; at that re-scheduled meeting those present
 *   constitute quorum.
 * - Voting thresholds: majority (>50%), 3/4 (>=75%), 80% (of all eligible),
 *   unanimous. Abstentions are ALWAYS excluded from the calculation.
 *
 * Pure + deterministic; unit tested against boundary/tie/proxy/absentee cases.
 */

export type MeetingType = 'AGM' | 'SGM' | 'council' | 'rescheduled';
export type Threshold = 'majority' | 'three_quarter' | 'eighty' | 'unanimous';

export interface Ballot {
  eligible: number; // total eligible voters for threshold math
  present: number; // present or by proxy
  yes: number;
  no: number;
  abstain: number;
}

export interface QuorumResult {
  quorumMet: boolean;
  required: number;
  present: number;
  shortfall: number;
}

/** Minimum present/represented voters required for quorum. */
export function quorumRequired(type: MeetingType, eligible: number, councilSize = 0): number {
  if (type === 'council') {
    return Math.floor(councilSize / 2) + 1;
  }
  return Math.ceil(eligible / 3); // AGM/SGM/rescheduled: 1/3
}

export function checkQuorum(
  type: MeetingType,
  eligible: number,
  present: number,
  councilSize = 0
): QuorumResult {
  const required = quorumRequired(type, eligible, councilSize);
  const quorumMet = present >= required;
  return { quorumMet, required, present, shortfall: Math.max(required - present, 0) };
}

/** Re-scheduled meeting (after the 30-min rule): whoever shows counts as quorum. */
export function checkQuorumRescheduled(present: number): QuorumResult {
  return {
    quorumMet: present > 0,
    required: 1,
    present,
    shortfall: present > 0 ? 0 : 1
  };
}

/** Effective denominator = present minus abstentions (abstentions excluded). */
export function effectiveVoters(b: Ballot): number {
  return b.present - b.abstain;
}

export type VoteVerdict =
  | { passed: true; threshold: Threshold; yes: number; denominator: number }
  | { passed: false; threshold: Threshold; yes: number; denominator: number; reason: string };

/**
 * Evaluate a resolution. `yes`/`no` come from those present or by proxy;
 * abstentions are excluded from the denominator. 80% and unanimous use ALL
 * eligible voters as the base (not just those present).
 */
export function countVote(threshold: Threshold, b: Ballot): VoteVerdict {
  // Present already includes abstainers; you can't have more decided voters than
  // present. (yes + no) is the decided subset; abstain is the present-undecided.
  if (b.yes + b.no > b.present) {
    throw new Error('yes+no cannot exceed present');
  }
  if (b.abstain > b.present) throw new Error('abstain cannot exceed present');
  if (b.present > b.eligible) throw new Error('present cannot exceed eligible');

  const excluded = effectiveVoters(b);
  if (excluded <= 0) {
    return { passed: false, threshold, yes: b.yes, denominator: 0, reason: 'no effective voters' };
  }

  let denominator = excluded;
  let requiredYes: number;
  switch (threshold) {
    case 'majority':
      denominator = excluded;
      requiredYes = Math.floor(excluded / 2) + 1; // > 50%
      break;
    case 'three_quarter':
      denominator = excluded;
      requiredYes = Math.ceil((excluded * 3) / 4); // >= 75%
      break;
    case 'eighty':
      denominator = b.eligible; // all eligible voters
      requiredYes = Math.ceil((b.eligible * 80) / 100);
      break;
    case 'unanimous':
      denominator = excluded;
      requiredYes = excluded; // every effective voter must say yes
      break;
    default:
      requiredYes = excluded;
  }

  // Unanimous requires EVERY effective voter to say yes (yes === denominator).
  const passed = threshold === 'unanimous' ? b.yes === denominator : b.yes >= requiredYes;
  const base = { threshold, yes: b.yes, denominator };
  if (!passed) {
    return { ...base, passed: false as const, reason: `needed ${requiredYes} yes (had ${b.yes} of ${denominator})` };
  }
  return { ...base, passed: true as const };
}