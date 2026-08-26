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

import type {
  PaymentRequestStore,
  PaymentRequest,
  PaymentRequestStatus,
  Rail
} from '../src/rails/payment-request.js';

/**
 * In-memory PaymentRequestStore for unit + API route tests. Mirrors the
 * Postgres adapter: every lookup is scoped by community (tenant) and a request
 * is a single logical row shared by the by-key and by-reference indexes.
 */
export class MemPaymentRequestStore implements PaymentRequestStore {
  private byKey = new Map<string, PaymentRequest>();
  private byRef = new Map<string, PaymentRequest>();

  key(communityId: string, refId: string, unitRef: string, rail: Rail): string {
    return `${communityId}\u0000${refId}\u0000${unitRef}\u0000${rail}`;
  }

  async getByKey(
    communityId: string,
    refId: string,
    unitRef: string,
    rail: Rail
  ): Promise<PaymentRequest | null> {
    return this.byKey.get(this.key(communityId, refId, unitRef, rail)) ?? null;
  }

  async findByReference(communityId: string, referenceCode: string): Promise<PaymentRequest | null> {
    return this.byRef.get(`${communityId}\u0000${referenceCode}`) ?? null;
  }

  async save(req: PaymentRequest): Promise<void> {
    this.byKey.set(this.key(req.communityId, req.refId, req.unitRef, req.rail), req);
    this.byRef.set(`${req.communityId}\u0000${req.referenceCode}`, req);
  }

  async markStatus(
    communityId: string,
    referenceCode: string,
    status: PaymentRequestStatus
  ): Promise<void> {
    // A request is a single logical row: propagate the status to both the
    // by-reference and by-key index so getByKey/re-fetch observe the update,
    // matching how a Postgres row behaves for find/quote lookups.
    const key = `${communityId}\u0000${referenceCode}`;
    const existing = this.byRef.get(key);
    if (!existing) return;
    const updated = { ...existing, status };
    this.byRef.set(key, updated);
    this.byKey.set(this.key(updated.communityId, updated.refId, updated.unitRef, updated.rail), updated);
  }

  async listByUnit(communityId: string, unitRef: string): Promise<PaymentRequest[]> {
    const out: PaymentRequest[] = [];
    for (const req of this.byKey.values()) {
      if (req.communityId === communityId && req.unitRef === unitRef) out.push(req);
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

import type { UnitRecord } from '../src/units/model.js';
import { demoUnits } from '../src/units/model.js';
import type { UnitStore } from '../src/units/store.js';

/**
 * In-memory UnitStore for unit + API route tests. Mirrors the Postgres
 * adapter: every read/write is tenant-scoped by communityId and a unit is a
 * single row keyed on (communityId, unitRef).
 */
export class MemUnitStore implements UnitStore {
  private byCouncil = new Map<string, Map<string, UnitRecord>>();

  private table(communityId: string): Map<string, UnitRecord> {
    let t = this.byCouncil.get(communityId);
    if (!t) {
      t = new Map();
      this.byCouncil.set(communityId, t);
    }
    return t;
  }

  async list(communityId: string): Promise<UnitRecord[]> {
    return [...this.table(communityId).values()].sort(
      (a, b) => a.floor - b.floor || a.unitRef.localeCompare(b.unitRef)
    );
  }

  async get(communityId: string, unitRef: string): Promise<UnitRecord | null> {
    return this.table(communityId).get(unitRef) ?? null;
  }

  async upsert(communityId: string, unit: UnitRecord): Promise<UnitRecord> {
    this.table(communityId).set(unit.unitRef, { ...unit });
    return { ...unit };
  }

  async remove(communityId: string, unitRef: string): Promise<boolean> {
    return this.table(communityId).delete(unitRef);
  }

  async seedDefault(communityId: string): Promise<UnitRecord[]> {
    for (const unit of demoUnits()) {
      this.table(communityId).set(unit.unitRef, { ...unit });
    }
    return this.list(communityId);
  }
}

export { MemAuthStore } from '../src/auth/mem-store.js';
export type { Council, UserRecord, UserRole } from '../src/auth/model.js';
