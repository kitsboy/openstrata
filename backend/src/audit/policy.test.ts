import { describe, expect, it } from 'vitest';
import {
  AUDIT_PATH_PREFIX,
  PURE_COMPUTE,
  SENSITIVE_READS,
  actionId,
  auditOutcomeFor,
  auditTarget,
  planAudit
} from './policy.js';

const plan = (over: Partial<Parameters<typeof planAudit>[0]> = {}) =>
  planAudit({
    method: 'POST',
    routeUrl: '/api/v1/ledger/post',
    status: 200,
    attributed: true,
    ...over
  });

describe('actionId', () => {
  it('drops the method verb when the last segment already reads as an action', () => {
    expect(actionId('/api/v1/ledger/post', 'POST')).toBe('ledger.post');
    expect(actionId('/api/v1/billing/run', 'POST')).toBe('billing.run');
    expect(actionId('/api/v1/auth/login', 'POST')).toBe('auth.login');
    expect(actionId('/api/v1/treasury/psbt/broadcast', 'POST')).toBe('treasury.psbt.broadcast');
  });

  it('appends the verb when it does not, and ignores path parameters', () => {
    expect(actionId('/api/v1/units', 'POST')).toBe('units.create');
    expect(actionId('/api/v1/units/:unitRef', 'DELETE')).toBe('units.delete');
    expect(actionId('/api/v1/members/:id', 'DELETE')).toBe('members.delete');
    expect(actionId('/api/v1/auth/users/:id', 'PATCH')).toBe('auth.users.update');
    expect(actionId('/api/v1/export/portable', 'GET')).toBe('export.portable.read');
  });
});

describe('auditOutcomeFor', () => {
  it('reads the decision out of the status code', () => {
    expect(auditOutcomeFor(200)).toBe('success');
    expect(auditOutcomeFor(204)).toBe('success');
    expect(auditOutcomeFor(403)).toBe('denied');
    expect(auditOutcomeFor(409)).toBe('denied');
    expect(auditOutcomeFor(500)).toBe('error');
  });
});

describe('auditTarget', () => {
  it('takes whitelisted identifiers from the body', () => {
    expect(
      auditTarget('ledger.post', {}, { fund: 'operating', amountBasis: 5000, kind: 'credit' })
    ).toBe('fund=operating kind=credit amountBasis=5000');
  });

  it('prefers a path parameter over the body', () => {
    expect(auditTarget('units.delete', { unitRef: '305' }, { unitRef: '999' })).toBe('unitRef=305');
  });

  it('never copies a field that is not on the list', () => {
    // The three shapes that must never reach a log row.
    expect(auditTarget('auth.login', {}, { email: 'a@b.test', password: 'hunter2' })).toBe(
      'email=a@b.test'
    );
    expect(auditTarget('ledger.post', {}, { password: 'hunter2' })).toBeNull();
    expect(
      auditTarget('bylaw.fine', {}, { complaint: '{"note":"private dispute"}', now: '2026-01-01' })
    ).toBeNull();
    expect(auditTarget('treasury.psbt.broadcast', {}, { readyPlan: { psbtB64: 'cHNidA==' } })).toBeNull();
  });

  it('names the account only on the actions whose subject is the account', () => {
    expect(auditTarget('auth.register', {}, { email: 'A@B.Test' })).toBe('email=a@b.test');
    expect(auditTarget('auth.users.create', {}, { email: 'x@y.test', role: 'treasurer' })).toBe(
      'role=treasurer email=x@y.test'
    );
    // A ledger post that happens to carry an email does not record it.
    expect(auditTarget('ledger.post', {}, { email: 'x@y.test', fund: 'operating' })).toBe(
      'fund=operating'
    );
  });

  it('bounds what one row can hold, even for a hostile value', () => {
    const target = auditTarget('ledger.post', { unitRef: 'x'.repeat(500) }, {})!;
    expect(target.length).toBeLessThanOrEqual(300);
    expect(target.length).toBeGreaterThan(100);
  });
});

describe('planAudit', () => {
  it('audits a state-changing request by default', () => {
    expect(plan()).toMatchObject({ action: 'ledger.post', outcome: 'success' });
    expect(plan({ routeUrl: '/api/v1/bylaw/fine' })?.action).toBe('bylaw.fine');
  });

  it('audits a route it has never seen before — the default is the safe one', () => {
    expect(plan({ routeUrl: '/api/v1/funds/reallocate' })?.action).toBe('funds.reallocate.create');
  });

  it('skips the calculators that only return an answer', () => {
    for (const routeUrl of PURE_COMPUTE) {
      expect(planAudit({ method: 'POST', routeUrl, status: 200, attributed: true })).toBeNull();
    }
  });

  it('skips ordinary reads but audits the ones whose data leaves', () => {
    expect(planAudit({ method: 'GET', routeUrl: '/api/v1/units', status: 200, attributed: true })).toBeNull();
    expect(planAudit({ method: 'GET', routeUrl: '/api/v1/ledger/balance', status: 200, attributed: true })).toBeNull();
    for (const routeUrl of SENSITIVE_READS) {
      expect(
        planAudit({ method: 'GET', routeUrl, status: 200, attributed: true })?.action
      ).toBeTruthy();
    }
  });

  it('requires a tenant-owned path', () => {
    expect(plan({ routeUrl: '/health/ready' })).toBeNull();
    expect(plan({ routeUrl: undefined })).toBeNull();
    expect(plan({ routeUrl: '/api/v2/ledger/post' })).toBeNull();
  });

  it('does not let unattributable traffic write rows, except the auth events', () => {
    expect(plan({ routeUrl: '/api/v1/payments/link/verify', attributed: false })).toBeNull();
    expect(plan({ routeUrl: '/api/v1/bylaw/complaint', attributed: false })).toBeNull();
    expect(plan({ routeUrl: '/api/v1/auth/login', attributed: false })?.action).toBe('auth.login');
    expect(plan({ routeUrl: '/api/v1/auth/register', attributed: false })?.action).toBe('auth.register');
  });

  it('ignores methods that cannot carry a decision', () => {
    expect(plan({ method: 'OPTIONS', routeUrl: '/api/v1/units' })).toBeNull();
    expect(plan({ method: 'HEAD', routeUrl: '/api/v1/units' })).toBeNull();
  });

  it('records a refusal as denied rather than dropping it', () => {
    // The interesting row: a member trying to post to the ledger.
    expect(plan({ status: 403 })).toMatchObject({ action: 'ledger.post', outcome: 'denied' });
    expect(plan({ status: 503 })).toMatchObject({ outcome: 'error' });
  });

  it('only ever names paths under the audited prefix', () => {
    expect(AUDIT_PATH_PREFIX).toBe('/api/v1/');
  });
});
