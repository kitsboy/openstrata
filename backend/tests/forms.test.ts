import { describe, it, expect } from 'vitest';
import { generateForm, deliveryDeadline, deadlineStatus, type UnitLedgerView } from '../src/forms/forms.js';

const cleanUnit: UnitLedgerView = {
  unitId: '101',
  balanceBasis: 0,
  arrearsBasis: 0,
  crfBasis: 420_000,
  eprDisclosed: true
};

const debtor: UnitLedgerView = { unitId: '302', balanceBasis: 14_500, arrearsBasis: 14_500 };

describe('delivery deadline (7 days)', () => {
  it('computes the Form B due date as request + 7 days', () => {
    expect(deliveryDeadline('2026-08-25')).toBe('2026-09-01');
  });

  it('reports ok / due / overdue correctly', () => {
    expect(deadlineStatus('2026-09-01', '2026-08-25')).toBe('ok');
    expect(deadlineStatus('2026-09-01', '2026-09-01')).toBe('due');
    expect(deadlineStatus('2026-09-01', '2026-09-05')).toBe('overdue');
  });
});

describe('Form B', () => {
  it('issues with full disclosures and a due date', () => {
    const form = generateForm({ kind: 'B', unitId: '101', requestedAt: '2026-08-25' }, cleanUnit, '2026-08-25');
    expect(form.kind).toBe('B');
    expect(form.state).toBe('issued');
    expect(form.dueDate).toBe('2026-09-01');
    expect(form.status).toBe('ok');
    expect(form.disclosures.some((d) => d.includes('Balance'))).toBe(true);
  });
});

describe('Form F', () => {
  it('issues when balance is $0', () => {
    const form = generateForm({ kind: 'F', unitId: '101', requestedAt: '2026-08-25' }, cleanUnit, '2026-08-25');
    expect(form.state).toBe('issued');
    expect(form.disclosures[0]).toMatch(/Balance \$0\.00/);
  });

  it('withholds (sale blocked) when the ledger balance is > 0', () => {
    const form = generateForm({ kind: 'F', unitId: '302', requestedAt: '2026-08-25' }, debtor, '2026-08-25');
    expect(form.state).toBe('withheld');
    expect(form.withheldReason).toMatch(/greater than \$0/);
    expect(form.disclosures.some((d) => d.includes('WITHHELD'))).toBe(true);
  });
});