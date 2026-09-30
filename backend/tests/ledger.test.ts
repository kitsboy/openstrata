import { describe, it, expect } from 'vitest';
import { MemLedgerStore } from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import {
  nextTally,
  verifyChain,
  initialState,
  assertValidAmount,
  assertTransferRequiresResolution,
  basisFromAmount
} from '../src/ledger/model.js';

function makeEngine(): LedgerEngine {
  return new LedgerEngine(new MemLedgerStore());
}

describe('ledger model basis math', () => {
  it('converts CAD amounts to integer basis points without float drift', () => {
    expect(basisFromAmount(100)).toBe(10000);
    expect(basisFromAmount(0.1)).toBe(10);
    expect(basisFromAmount(123.45)).toBe(12345);
  });

  it('rejects zero and wrong-sign entries (Invariant 5)', () => {
    expect(() => assertValidAmount(0, 'credit')).toThrow(/must not be zero/);
    expect(() => assertValidAmount(-5, 'credit')).toThrow(/positive/);
    expect(() => assertValidAmount(5, 'debit')).toThrow(/negative/);
    expect(() => assertValidAmount(1.5, 'credit')).toThrow(/integer/);
  });

  it('rejects transfers without a resolution (no co-mingling)', () => {
    expect(() => assertTransferRequiresResolution('xfer:r1', undefined)).toThrow(
      /requires a resolution_id/
    );
    expect(() => assertTransferRequiresResolution('xfer:r1', 'res-1')).not.toThrow();
  });
});

describe('trust ledger engine', () => {
  it('posts a credit and a debit to isolated accounts with balanced math', async () => {
    const engine = makeEngine();
    const credit = await engine.post('demo', 'operating', 10000, 'credit', {
      type: 'strata_fee',
      referenceCode: 'unit-302',
      reconRef: 'ET-1046'
    });
    const debit = await engine.post('demo', 'crf', -2500, 'debit', {
      type: 'transfer',
      resolutionId: 'res-1'
    });
    expect(credit.seq).toBe(1);
    expect(credit.tallyRoot).toBeTruthy();
    expect(debit.seq).toBe(1); // independent account -> independent chain
    const op = await engine.balance('demo', 'operating');
    const crf = await engine.balance('demo', 'crf');
    expect(op.balanceBasis).toBe(10000);
    expect(crf.balanceBasis).toBe(-2500);
  });

  it('appends sequentially to a single account with chained tallies', async () => {
    const engine = makeEngine();
    const a = await engine.post('demo', 'operating', 5000, 'credit', { type: 'fee' });
    const b = await engine.post('demo', 'operating', 5000, 'credit', { type: 'fee' });
    expect(a.seq).toBe(1);
    expect(b.seq).toBe(2);
    expect(b.prevTally).toBe(a.tallyRoot);
    expect(b.tallyRoot).not.toBe(a.tallyRoot);
    const balance = await engine.balance('demo', 'operating');
    expect(balance.entryCount).toBe(2);
    expect(balance.headTally).toBe(b.tallyRoot);
  });

  it('performs a balanced two-sided transfer via a resolution', async () => {
    const engine = makeEngine();
    await engine.post('demo', 'operating', 100000, 'credit', { type: 'fee' });
    await engine.transfer(
      { groupId: 'demo', fundCode: 'operating' },
      { groupId: 'demo', fundCode: 'crf' },
      10000,
      { type: 'transfer', resolutionId: 'res-2026-01' }
    );
    const op = await engine.balance('demo', 'operating');
    const crf = await engine.balance('demo', 'crf');
    expect(op.balanceBasis).toBe(90000);
    expect(crf.balanceBasis).toBe(10000);
  });

  it('throws when a transfer omits a resolution', async () => {
    const engine = makeEngine();
    await engine.post('demo', 'operating', 1000, 'credit', { type: 'fee' });
    await expect(
      engine.transfer(
        { groupId: 'demo', fundCode: 'operating' },
        { groupId: 'demo', fundCode: 'crf' },
        100,
        { type: 'transfer', resolutionId: '' }
      )
    ).rejects.toThrow(/resolution/);
  });
});

describe('hash-chain tamper evidence', () => {
  it('verifies a clean chain', () => {
    const state = initialState();
    const rows = [] as Parameters<typeof verifyChain>[0];
    let prev = state.prevTally;
    for (let i = 1; i <= 3; i++) {
      const tally = nextTally(prev, {
        accountId: 7,
        amountBasis: 1000,
        postedAt: `2026-01-0${i}T00:00:00Z`
      });
      rows.push({
        accountId: 7,
        seq: i,
        amountBasis: 1000,
        kind: 'credit',
        postedAt: `2026-01-0${i}T00:00:00Z`,
        prevTally: prev,
        tallyRoot: tally
      } as any);
      prev = tally;
    }
    const tallies = verifyChain(rows);
    expect(tallies.get(7)?.headSeq).toBe(3);
  });

  it('detects a gap (deleted entry) in the chain', () => {
    const state = initialState();
    let prev = state.prevTally;
    const rows = [] as Parameters<typeof verifyChain>[0];
    for (let i = 1; i <= 3; i++) {
      const tally = nextTally(prev, {
        accountId: 7,
        amountBasis: 1000,
        postedAt: `2026-01-0${i}T00:00:00Z`
      });
      rows.push({
        accountId: 7,
        seq: i,
        amountBasis: 1000,
        kind: 'credit',
        postedAt: `2026-01-0${i}T00:00:00Z`,
        prevTally: prev,
        tallyRoot: tally
      } as any);
      prev = tally;
    }
    // Remove seq #2 => gap at expected seq 2 (found 3).
    expect(() => verifyChain(rows.filter((r) => r.seq !== 2))).toThrow(/gap|tampering/);
  });

  it('detects a single changed amount mid-chain', () => {
    let prev = '';
    const rows = [] as Parameters<typeof verifyChain>[0];
    for (let i = 1; i <= 3; i++) {
      const tally = nextTally(prev, {
        accountId: 7,
        amountBasis: i * 1000,
        postedAt: `2026-01-0${i}T00:00:00Z`
      });
      rows.push({
        accountId: 7,
        seq: i,
        amountBasis: i * 1000,
        kind: 'credit',
        postedAt: `2026-01-0${i}T00:00:00Z`,
        prevTally: prev,
        tallyRoot: tally
      } as any);
      prev = tally;
    }
    // Corrupt row #1's amount; the recomputed root no longer matches row #1.
    const tampered = rows.map((r, i) =>
      i === 0 ? { ...r, amountBasis: 5000 } : r
    );
    expect(() => verifyChain(tampered)).toThrow(/tally mismatch/);
  });
});

describe('ledger diff between two copies', () => {
  const TS = '2026-02-01T00:00:00Z';

  it('reports OK for identical ledgers', async () => {
    const a = makeEngine();
    const b = makeEngine();
    // Same postedAt for both so the hash chains are bit-for-bit identical.
    await seedBoth(a, b, TS);
    const res = await (a as any).diff(b as any, 'demo');
    expect(res.ok).toBe(true);
    expect(res.mismatched).toHaveLength(0);
  });

  it('detects a divergent ledger (missing entry on one side)', async () => {
    const a = makeEngine();
    const b = makeEngine();
    await seedBoth(a, b, TS);
    await a.post('demo', 'operating', 9999, 'credit', { type: 'one-off', postedAt: TS });
    const res = await (a as any).diff(b as any, 'demo');
    expect(res.ok).toBe(false);
    expect(res.mismatched.length).toBeGreaterThan(0);
  });
});

async function seedBoth(a: LedgerEngine, b: LedgerEngine, ts: string): Promise<void> {
  for (const e of [a, b]) {
    await e.post('demo', 'operating', 42000, 'credit', { type: 'start', postedAt: ts });
  }
}