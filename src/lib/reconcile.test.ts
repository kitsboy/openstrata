import { describe, expect, it } from 'vitest';
import {
  matchTransfer,
  reconcileTransfers,
  type ETransfer,
  type UnitRef
} from './reconcile';

const UNITS: UnitRef[] = [
  { id: '101', names: ['Chen', 'M Chen'], aliases: ['101', 'unit 101'] },
  { id: '102', names: ['Williams', 'J Williams'], aliases: ['102', 'unit 102'] },
  { id: '201', names: [], aliases: ['201', 'unit 201'] },
  { id: '202', names: ['Patel', 'A Patel'], aliases: ['202', 'unit 202'] },
  { id: '301', names: ['OBrien', 'S OBrien'], aliases: ['301', 'unit 301'] },
  { id: '302', names: ['Chen', 'M Chen'], aliases: ['302', 'unit 302'] }
];

function tx(overrides: Partial<ETransfer> = {}): ETransfer {
  return { id: 'ET-1', from: 'Payer', message: 'ref', amount: 100, date: '2026-08-01', ...overrides };
}

describe('matchTransfer', () => {
  it('auto-matches a clear unit reference in the message', () => {
    const res = matchTransfer(tx({ id: 'A', message: 'Unit 302 May fees' }), UNITS);
    expect(res.kind).toBe('auto');
    expect(res.unitId).toBe('302');
  });

  it('auto-matches a bare numeric reference', () => {
    const res = matchTransfer(tx({ id: 'B', message: '302' }), UNITS);
    expect(res.kind).toBe('auto');
    expect(res.unitId).toBe('302');
  });

  it('flags an ambiguous reference that matches multiple distinct units', () => {
    // "Chen" (a shared owner surname) maps to both unit 101 and unit 302.
    const res = matchTransfer(tx({ id: 'C', message: 'Chen thanks' }), UNITS);
    expect(res.kind).toBe('ambiguous');
    expect(res.unitId).toBeNull();
  });

  it('flags an unmatched message when no unit reference is present', () => {
    const res = matchTransfer(tx({ id: 'D', message: 'For the pool fund thanks' }), UNITS);
    expect(res.kind).toBe('unmatched');
    expect(res.unitId).toBeNull();
  });

  it('ignores the payer name in brief mode, so an owner pays via a shared name as unambiguous', () => {
    // "Chen" matches both unit 101 and 302 by name, but only briefly references
    // nothing in the message — should be unmatched (payer is not read).
    const res = matchTransfer(tx({ id: 'E', from: 'Chen', message: 'nothing here' }), UNITS);
    expect(res.kind).toBe('unmatched');
  });

  it('uses the payer name in full mode to disambiguate', () => {
    const res = matchTransfer(tx({ id: 'F', from: 'J Williams', message: 'thanks' }), UNITS, {
      mode: 'full'
    });
    expect(res.kind).toBe('auto');
    expect(res.unitId).toBe('102');
  });

  it('normalizes punctuation and case in references', () => {
    const res = matchTransfer(tx({ id: 'G', message: '  U.nit 30-2  ' }), UNITS);
    expect(res.kind).toBe('auto');
    expect(res.unitId).toBe('302');
  });
});

describe('reconcileTransfers', () => {
  it('buckets a mixed batch into auto, ambiguous, and unmatched', () => {
    const batch: ETransfer[] = [
      tx({ id: '1', message: 'Unit 301' }),
      tx({ id: '2', message: 'pool fund' }), // unmatched
      tx({ id: '3', message: 'Chen' }) // ambiguous (shared surname, 101 + 302)
    ];
    const result = reconcileTransfers(batch, UNITS);
    expect(result.auto.map((r) => r.transferId)).toEqual(['1']);
    expect(result.auto[0].unitId).toBe('301');
    expect(result.unmatched.map((r) => r.transferId)).toEqual(['2']);
    expect(result.ambiguous.map((r) => r.transferId)).toEqual(['3']);
  });

  it('returns empty buckets for an empty batch', () => {
    const result = reconcileTransfers([], UNITS);
    expect(result.auto).toEqual([]);
    expect(result.ambiguous).toEqual([]);
    expect(result.unmatched).toEqual([]);
  });
});