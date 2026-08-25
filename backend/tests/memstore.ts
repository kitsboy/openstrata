/**
 * In-memory LedgerStore used by the unit tests. Mirrors the Postgres adapter's
 * append-only semantics so LedgerEngine behaves the same in both.
 */

import type { AccountId, LedgerStore } from '../src/ledger/ledger.js';
import type { LedgerEntryRow } from '../src/ledger/model.js';

export class MemLedgerStore implements LedgerStore {
  private accounts = new Map<string, AccountId>();
  private seqs = new Map<number, number>();
  private entries = new Map<number, LedgerEntryRow[]>();
  private nextId = 1;

  key(groupId: string, fundCode: string): string {
    return `${groupId}\u0000${fundCode}`;
  }

  async getAccountByFund(groupId: string, fundCode: string): Promise<AccountId | null> {
    return this.accounts.get(this.key(groupId, fundCode)) ?? null;
  }

  async createAccount(
    groupId: string,
    fundCode: string,
    _label: string,
    currency = 'CAD'
  ): Promise<AccountId> {
    const existing = await this.getAccountByFund(groupId, fundCode);
    if (existing) return existing;
    const id = this.nextId++;
    const acc: AccountId = { id, groupId, fundCode, currency };
    this.accounts.set(this.key(groupId, fundCode), acc);
    return acc;
  }

  async nextSeq(accountId: number): Promise<number> {
    const next = (this.seqs.get(accountId) ?? 0) + 1;
    this.seqs.set(accountId, next);
    return next;
  }

  async insert(entry: LedgerEntryRow): Promise<void> {
    const list = this.entries.get(entry.accountId) ?? [];
    list.push(entry);
    this.entries.set(entry.accountId, list);
  }

  async listEntries(accountId: number): Promise<LedgerEntryRow[]> {
    return (this.entries.get(accountId) ?? []).slice();
  }

  async listAll(accountFilter?: (a: AccountId) => boolean): Promise<LedgerEntryRow[]> {
    const rows: LedgerEntryRow[] = [];
    for (const [accId, list] of this.entries) {
      for (const e of list) {
        const acc = [...this.accounts.values()].find((a) => a.id === accId);
        if (acc && (!accountFilter || accountFilter(acc))) rows.push(e);
      }
    }
    return rows.sort((a, b) => a.seq - b.seq);
  }
}