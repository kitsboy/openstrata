import { describe, it, expect } from 'vitest';
import {
  createRegistry,
  normalizeUnitRef,
  unitArFundCode,
  unitReferenceCode,
  demoUnits
} from '../src/units/model.js';

describe('unit master-data model', () => {
  it('normalizes unit references consistently', () => {
    expect(normalizeUnitRef('302')).toBe('302');
    expect(normalizeUnitRef('U-302')).toBe('302');
    expect(normalizeUnitRef('unit 302')).toBe('302');
    expect(normalizeUnitRef('u302')).toBe('302');
    expect(normalizeUnitRef(' 3 0 2 ')).toBe('302');
  });

  it('derives a unique AR ledger fund code per unit', () => {
    expect(unitArFundCode('302')).toBe('ar:unit-302');
    expect(unitArFundCode('U-1120')).toBe('ar:unit-1120');
    // Distinct units never share an AR account.
    expect(unitArFundCode('101')).not.toBe(unitArFundCode('102'));
  });

  it('throws on an empty unit ref when deriving a fund code', () => {
    expect(() => unitArFundCode('')).toThrow();
    expect(() => unitArFundCode('---')).toThrow();
  });

  it('builds a registry with building-ordered units', () => {
    const reg = createRegistry(demoUnits());
    const all = reg.all();
    expect(all).toHaveLength(6);
    expect(all[0].unitRef).toBe('101'); // floor 1 first
    expect(all[5].unitRef).toBe('302'); // floor 3 last
  });

  it('looks up units by normalized id and guards existence', () => {
    const reg = createRegistry(demoUnits());
    expect(reg.has('302')).toBe(true);
    expect(reg.has('U-302')).toBe(true);
    expect(reg.get('301')).toMatchObject({ unitRef: '301', floor: 3 });
    expect(reg.has('999')).toBe(false);
    expect(reg.get('999')).toBeNull();
  });

  it('exposes reconciliation keys that resolve uniquely', () => {
    const reg = createRegistry(demoUnits());
    expect(reg.refs('302')).toContain('302');
    expect(reg.isUniqueRef('302')).toBe(true);
    expect(reg.isUniqueRef('9999')).toBe(false);
    // A reference shared by multiple occupants/units is not unique.
    const shared = createRegistry([
      ...demoUnits(),
      { unitRef: '999', floor: 9, occupancy: 'vacant' }
    ]);
    expect(shared.isUniqueRef('302')).toBe(true);
    expect(reg.refs('202')).toContain('patel');
  });

  it('derives deterministic payment reference codes', () => {
    expect(unitReferenceCode('302', 'fees-2026-02')).toBe('unit-302-fees-2026-02');
    expect(unitReferenceCode('U-302', 'Fees')).toBe('unit-302-fees');
  });

  it('silently drops duplicate unit refs (first wins)', () => {
    const reg = createRegistry([
      { unitRef: '101', floor: 1, occupancy: 'occupied' },
      { unitRef: 'U-101', floor: 9, occupancy: 'vacant' } // duplicate after normalize
    ]);
    expect(reg.all()).toHaveLength(1);
    expect(reg.get('101')).toMatchObject({ floor: 1 });
  });
});