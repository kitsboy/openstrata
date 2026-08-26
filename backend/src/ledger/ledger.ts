/**
 * Ledger engine — append-only posting + cross-account transfers + diff.
 *
 * The engine talks to a `LedgerStore` abstraction so the same logic runs against
 * Postgres in production and an in-memory store in unit tests. All posting goes
 * through here so the SQL invariants (append-only, hash chain, resolution
 * requirement) are enforced in one place.
 */

import {
  assertTransferRequiresResolution,
  assertValidAmount,
  initialState,
  nextTally,
  verifyChain,
  type EntryKind,
  type HashChainState,
  type LedgerEntryRow
} from './model.js';

export interface AccountId {
  id: number;
  groupId: string;
  fundCode: string;
  currency: string;
}

export interface LedgerStore {
  getAccountByFund(groupId: string, fundCode: string): Promise<AccountId | null>;
  createAccount(
    groupId: string,
    fundCode: string,
    label: string,
    currency?: string
  ): Promise<AccountId>;
  /** Next seq for an account inside the same transaction as the insert. */
  nextSeq(accountId: number): Promise<number>;
  insert(entry: LedgerEntryRow): Promise<void>;
  listEntries(accountId: number): Promise<LedgerEntryRow[]>;
  listAll(accountFilter?: (a: AccountId) => boolean): Promise<LedgerEntryRow[]>;
}

export interface PostOptions {
  type?: string;
  description?: string;
  referenceCode?: string;
  reconRef?: string;
  resolutionId?: string;
  transferSeq?: string;
  postedAt?: string;
}

export class LedgerEngine {
  constructor(private readonly store: LedgerStore) {}

  /** Resolve an account or create it on first use (e.g. new sub-account). */
  private async account(groupId: string, fundCode: string): Promise<AccountId> {
    const existing = await this.store.getAccountByFund(groupId, fundCode);
    if (existing) return existing;
    return this.store.createAccount(groupId, fundCode, fundCode);
  }

  /**
   * Append a single credit or debit to a ledger chain.
   * @returns the full created row (incl. tally_root / prev_tally).
   */
  async post(
    groupId: string,
    fundCode: string,
    amountBasis: number,
    kind: EntryKind,
    opts: PostOptions = {}
  ): Promise<LedgerEntryRow> {
    assertValidAmount(amountBasis, kind);
    assertTransferRequiresResolution(opts.transferSeq, opts.resolutionId);

    const account = await this.account(groupId, fundCode);
    const seq = await this.store.nextSeq(account.id);
    const entries = await this.store.listEntries(account.id);
    const state: HashChainState = entries.length
      ? { prevTally: entries[entries.length - 1].tallyRoot, seq }
      : { ...initialState(), seq };
    const postedAt = opts.postedAt ?? new Date().toISOString();
    const tallyRoot = nextTally(state.prevTally, {
      accountId: account.id,
      amountBasis,
      postedAt,
      resolutionId: opts.resolutionId,
      transferSeq: opts.transferSeq
    });
    const entry: LedgerEntryRow = {
      accountId: account.id,
      seq,
      amountBasis,
      kind,
      type: opts.type ?? '',
      description: opts.description ?? '',
      referenceCode: opts.referenceCode ?? '',
      reconRef: opts.reconRef,
      resolutionId: opts.resolutionId,
      transferSeq: opts.transferSeq,
      prevTally: state.prevTally,
      tallyRoot,
      postedAt
    };
    await this.store.insert(entry);
    return entry;
  }

  /**
   * A balanced cross-account move: two linked entries sharing a transferSeq.
   * Required for BCFSA trust rules (no co-mingling without a resolution).
   */
  async transfer(
    from: { groupId: string; fundCode: string },
    to: { groupId: string; fundCode: string },
    amountBasis: number,
    opts: { type: string; resolutionId: string; description?: string; postedAt?: string }
  ): Promise<{ out: LedgerEntryRow; in: LedgerEntryRow }> {
    assertValidAmount(amountBasis, 'credit');
    if (!opts.resolutionId) {
      throw new Error('transfer requires a resolution_id');
    }
    const transferSeq = `xfer:${opts.resolutionId}`;
    const out = await this.post(from.groupId, from.fundCode, -amountBasis, 'debit', {
      ...opts,
      transferSeq,
      resolutionId: opts.resolutionId
    });
    const inEntry = await this.post(to.groupId, to.fundCode, amountBasis, 'credit', {
      ...opts,
      transferSeq,
      resolutionId: opts.resolutionId
    });
    return { out, in: inEntry };
  }

  /** Current balance in basis points for a fund + full chain verification. */
  async balance(
    groupId: string,
    fundCode: string
  ): Promise<{ balanceBasis: number; entryCount: number; headTally: string }> {
    const account = await this.account(groupId, fundCode);
    const entries = await this.store.listEntries(account.id);
    const tallies = verifyChain(entries);
    const head = tallies.get(account.id);
    const balanceBasis = entries.reduce((s, e) => s + e.amountBasis, 0);
    return {
      balanceBasis,
      entryCount: entries.length,
      headTally: head?.headTally ?? ''
    };
  }

  /**
   * Monthly rollup for a fund — income (credits) vs expenses (debits) per
   * calendar month, for the dashboard charts. Returns `months` points ending
   * with the current month, zero-filled when a month has no activity. The
   * series is verified against the hash chain like `balance`.
   */
  async series(
    groupId: string,
    fundCode: string,
    months = 6
  ): Promise<Array<{ month: string; incomeBasis: number; expenseBasis: number; netBasis: number }>> {
    const account = await this.store.getAccountByFund(groupId, fundCode);
    const entries = account ? await this.store.listEntries(account.id) : [];
    if (entries.length) verifyChain(entries);

    const byMonth = new Map<string, { income: number; expense: number }>();
    for (const e of entries) {
      const month = e.postedAt.slice(0, 7); // 'YYYY-MM'
      const bucket = byMonth.get(month) ?? { income: 0, expense: 0 };
      if (e.kind === 'credit') bucket.income += e.amountBasis;
      else bucket.expense += -e.amountBasis;
      byMonth.set(month, bucket);
    }

    const now = new Date();
    const points: Array<{ month: string; incomeBasis: number; expenseBasis: number; netBasis: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byMonth.get(month) ?? { income: 0, expense: 0 };
      const incomeBasis = bucket.income;
      const expenseBasis = bucket.expense;
      points.push({ month, incomeBasis, expenseBasis, netBasis: incomeBasis - expenseBasis });
    }
    return points;
  }

  /** Tamper-proof diff between two copies of the same ledger. */
  async diff(otherEngine: LedgerEngine, groupId: string): Promise<{
    accounts: Set<string>;
    mismatched: Array<{ fundCode?: string; detail: string }>;
    ok: boolean;
  }> {
    const [mine, theirs] = await Promise.all([
      this.store.listAll(a => a.groupId === groupId),
      otherEngine.store.listAll(a => a.groupId === groupId)
    ]);
    const accounts = new Set<string>();
    for (const e of [...mine, ...theirs]) accounts.add(String(e.accountId));

    const summarize = (rows: LedgerEntryRow[]) => {
      const tallies = verifyChain(rows);
      const byAccount = new Map<number, { seq: number; tally: string }>();
      for (const [accId, { headSeq, headTally }] of tallies) {
        byAccount.set(accId, { seq: headSeq, tally: headTally });
      }
      return byAccount;
    };
    const mineMap = summarize(mine);
    const theirsMap = summarize(theirs);
    const mismatched: Array<{ fundCode?: string; detail: string }> = [];
    for (const accountId of accounts) {
      const a = mineMap.get(Number(accountId));
      const b = theirsMap.get(Number(accountId));
      if (a && b && a.seq === b.seq && a.tally === b.tally) continue;
      mismatched.push({
        detail: `account ${accountId}: mine seq=${a?.seq ?? 0} tally=${a?.tally?.slice(0, 8) ?? '(none)'}, theirs seq=${b?.seq ?? 0} tally=${b?.tally?.slice(0, 8) ?? '(none)'}`
      });
    }
    return { accounts, mismatched, ok: mismatched.length === 0 };
  }
}