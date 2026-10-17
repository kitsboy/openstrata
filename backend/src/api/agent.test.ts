import { describe, expect, it } from 'vitest';
import { AGENT_PROTOCOL_VERSION, agentManifest, buildAgentContext, summarizeFund } from './agent.js';

describe('agentManifest', () => {
  it('exposes only read-only tools and warns against privileged human credentials', () => {
    expect(agentManifest.protocol).toBe(AGENT_PROTOCOL_VERSION);
    expect(agentManifest.mode).toBe('read-only');
    expect(agentManifest.privacy).toContain('does not grant access');
    expect(agentManifest.tools.map((tool) => tool.path)).toEqual(['/api/v1/agent/context']);
    expect(agentManifest.tools.length).toBeGreaterThan(0);
    expect(agentManifest.tools.every((tool) => tool.sideEffects === false)).toBe(true);
    expect(agentManifest.safety).toMatchObject({
      humanApprovalRequiredForWrites: true,
      agentsMayMoveMoney: false,
      agentsMayIssueNotices: false,
      dedicatedAgentCredentialsAvailable: false
    });
  });
});

describe('summarizeFund', () => {
  it('returns a net balance and verified chain head without transaction descriptions', () => {
    expect(summarizeFund([
      { seq: 1, amountBasis: 10000, kind: 'credit', tallyRoot: 'first', postedAt: '2026-10-01T00:00:00Z' },
      { seq: 2, amountBasis: -2500, kind: 'debit', tallyRoot: 'last', postedAt: '2026-10-02T00:00:00Z' }
    ])).toEqual({ balanceBasis: 7500, entryCount: 2, verifiedHead: 'last' });
    expect(summarizeFund([])).toEqual({ balanceBasis: 0, entryCount: 0, verifiedHead: null });
  });
});

describe('buildAgentContext', () => {
  it('summarizes council operations without contacts or action capabilities', () => {
    const result = buildAgentContext({
      council: { id: 'council-1', name: '<img src=x onerror=1> Cedar Point' },
      generatedAt: '2026-10-17T12:00:00.000Z',
      units: [
        { unitRef: '101', floor: 1, occupancy: 'occupied', formK: 'signed', member: { owner: 'Private Owner', occupants: [] } },
        { unitRef: '102', floor: 1, occupancy: 'vacant', formK: 'missing', tenant: 'Private Tenant' },
        { unitRef: '201', floor: 2, occupancy: 'short-term', formK: 'signed' }
      ],
      deadlines: [{ id: 'd1', kind: 'epr', title: 'EPR filing', dueAt: '2026-12-31', daysLeft: 75, severity: 'routine', jurisdiction: 'BC' }],
      funds: { operating: [{ seq: 1, amountBasis: 2500, kind: 'credit', tallyRoot: 'root', postedAt: '2026-10-01T00:00:00Z' }] }
    });

    expect(result.summary).toEqual({ unitCount: 3, occupancy: { occupied: 1, vacant: 1, shortTerm: 1 }, missingFormK: 1 });
    expect(result.funds.operating).toEqual({ balanceBasis: 2500, entryCount: 1, verifiedHead: 'root' });
    expect(result.deadlines).toHaveLength(1);
    expect(result.scope.name).toBe('<img src=x onerror=1> Cedar Point');
    expect(buildAgentContext({
      council: { id: 'council-1', name: 'Cedar Point' },
      generatedAt: '2026-10-17T12:00:00.000Z',
      units: [],
      deadlines: [{ id: 'q1', kind: 'quote', title: 'Payment quote PAY-PRIVATE for unit 101 is open', dueAt: '2026-10-18', daysLeft: 1, severity: 'urgent', jurisdiction: 'BC' }],
      funds: { operating: { balanceBasis: 0, entryCount: 0, verifiedHead: null } }
    }).deadlines[0].title).toBe('Open payment quote');
    expect(JSON.stringify(result)).not.toContain('Private Owner');
    expect(JSON.stringify(result)).not.toContain('Private Tenant');
    expect(JSON.stringify(result)).not.toContain('PAY-PRIVATE');
    expect(result).toMatchObject({
      mode: 'read-only',
      safeguards: { personalContactDetailsIncluded: false, actionsExecuted: false }
    });
  });
});
