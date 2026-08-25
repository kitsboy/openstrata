/**
 * Trust-ledger domain model — pure types + invariants.
 *
 * Everything here is side-effect free and unit-testable without a database.
 * The append-only invariants (2), (3), (4) from schema.sql are mirrored here so
 * both SQL and application layers enforce the same rules.
 *
 * Amounts are integer *basis points* of the account currency. 100 bp = 1.00.
 */

import { createHash } from 'node:crypto';

export type Currency = 'CAD' | 'USD' | 'EUR';
export type EntryKind = 'credit' | 'debit';

/**
 * Framework-compatible fund codes (see docs: PRODUCT-PLAN transparent
 * sub-accounts + framework config.yaml). `special_levy` and `subaccount`
 * carry a `:<name>` suffix.
 */
export type FundCode =
  | 'operating'
  | 'crf'
  | `special_levy:${string}`
  | `subaccount:${string}`
  | 'war_chest';

export interface AccountRef {
  groupId: string;
  fundCode: FundCode;
  currency: Currency;
}

export interface LedgerEntryRow {
  accountId: number;
  seq: number;
  amountBasis: number;
  kind: EntryKind;
  type: string;
  description: string;
  referenceCode: string;
  reconRef?: string;
  resolutionId?: string;
  transferSeq?: string;
  prevTally: string;
  tallyRoot: string;
  postedAt: string; // ISO-8601
}

/** The minimal shape the hash chain derives from (no seq/tally fields). */
export interface TallyInput {
  accountId: number;
  amountBasis: number;
  postedAt: string;
  resolutionId?: string;
  transferSeq?: string;
}

export const BASIS_PER_CURRENCY: Record<Currency, number> = {
  CAD: 100,
  USD: 100,
  EUR: 100
};

export function amountFromBasis(basis: number, currency: Currency = 'CAD'): number {
  return basis / BASIS_PER_CURRENCY[currency];
}

export function basisFromAmount(amount: number, currency: Currency = 'CAD'): number {
  // Round to nearest basis point; trust math must not drift on floats.
  return Math.round(amount * BASIS_PER_CURRENCY[currency]);
}

/** Convert a human-friendly amount string like '123.45' to basis points. */
export function parseBasis(amount: string, currency: Currency = 'CAD'): number {
  const n = Number(amount);
  if (!Number.isFinite(n)) throw new Error(`Invalid amount: ${amount}`);
  return basisFromAmount(n, currency);
}

export interface HashChainState {
  prevTally: string;
  seq: number;
}

/**
 * Compute the tally_root for the next entry in an account's hash chain.
 *
 * The chain commits the previous root plus a canonical serialization of the new
 * entry's substantive fields. The final root therefore covers every prior entry
 * transitively, so replacing or deleting any row invalidates every later root.
 */
export function nextTally(prev: string, input: TallyInput): string {
  const canonical = JSON.stringify({
    a: input.accountId,
    b: input.amountBasis,
    t: input.postedAt,
    r: input.resolutionId ?? null,
    x: input.transferSeq ?? null,
    p: prev
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export function initialState(): HashChainState {
  return { prevTally: '', seq: 0 };
}

/**
 * Invariant 5 — a posted entry must be signed (kind matches sign) and
 * non-zero. Mirrors the SQL CHECKs so callers fail fast before the DB round trip.
 */
export function assertValidAmount(
  amountBasis: number,
  kind: EntryKind
): void {
  if (!Number.isInteger(amountBasis)) {
    throw new Error(`amountBasis must be an integer, got ${amountBasis}`);
  }
  if (amountBasis === 0) throw new Error('amountBasis must not be zero');
  if (kind === 'credit' && amountBasis <= 0) {
    throw new Error(`credit entries must be positive, got ${amountBasis}`);
  }
  if (kind === 'debit' && amountBasis >= 0) {
    throw new Error(`debit entries must be negative, got ${amountBasis}`);
  }
}

/** Invariant 3 — transfers without a resolution are rejected (no co-mingling). */
export function assertTransferRequiresResolution(
  transferSeq: string | undefined,
  resolutionId: string | undefined
): void {
  if (transferSeq && !resolutionId) {
    throw new Error('cross-account transfer requires a resolution_id');
  }
}

/**
 * Verify a full hash chain and return per-account tallies for diffing.
 * @returns Map<accountId, { headSeq, headTally }> or throws if any gap/break.
 */
export function verifyChain(
  rows: Array<Pick<
    LedgerEntryRow,
    | 'accountId'
    | 'seq'
    | 'amountBasis'
    | 'kind'
    | 'postedAt'
    | 'resolutionId'
    | 'transferSeq'
    | 'prevTally'
    | 'tallyRoot'
  >>
): Map<number, { headSeq: number; headTally: string }> {
  const byAccount = new Map<number, typeof rows>();
  for (const row of rows) {
    const list = byAccount.get(row.accountId) ?? [];
    list.push(row);
    byAccount.set(row.accountId, list);
  }
  const result = new Map<number, { headSeq: number; headTally: string }>();
  for (const [accountId, entries] of byAccount) {
    const ordered = entries.slice().sort((a, b) => a.seq - b.seq);
    let prev = '';
    let expected = 1;
    for (const e of ordered) {
      if (e.seq !== expected) {
        throw new Error(
          `tampering: gap in chain for account ${accountId} at seq ${expected} (found ${e.seq})`
        );
      }
      const computed = nextTally(prev, {
        accountId: e.accountId,
        amountBasis: e.amountBasis,
        postedAt: e.postedAt,
        resolutionId: e.resolutionId,
        transferSeq: e.transferSeq
      });
      if (computed !== e.tallyRoot) {
        throw new Error(
          `tampering: tally mismatch for account ${accountId} seq ${e.seq}`
        );
      }
      // A posted debit/credit sign must match amount sign (Invariant 5).
      assertValidAmount(e.amountBasis, e.kind);
      prev = e.tallyRoot;
      expected += 1;
    }
    result.set(accountId, { headSeq: expected - 1, headTally: prev });
  }
  return result;
}