/**
 * Agent-facing API surface: machine-readable capabilities and a deliberately
 * minimized council snapshot. Tools are read-only; financial execution and
 * legal decisions remain on human-operated API paths.
 */
import type { UnitRecord } from '../units/model.js';
import type { DeadlineItem } from '../deadlines/deadlines.js';
import type { EntryKind } from '../ledger/model.js';

export const AGENT_PROTOCOL_VERSION = 'openstrata-agent/1';

export const agentManifest = {
  protocol: AGENT_PROTOCOL_VERSION,
  name: 'OpenStrata Council Read API',
  mode: 'read-only',
  authentication: 'Bearer council session; credentials are never returned by these routes',
  privacy: 'This manifest describes only tools exposed under /api/v1/agent/*; it does not grant access to every listed route.',
  tools: [
    { id: 'council_context', method: 'GET', path: '/api/v1/agent/context', description: 'Get a privacy-minimized council snapshot, fund balances, and upcoming deadlines.', sideEffects: false, minimumRole: 'member' }
  ],
  safety: {
    humanApprovalRequiredForWrites: true,
    agentsMayMoveMoney: false,
    agentsMayIssueNotices: false,
    dedicatedAgentCredentialsAvailable: false,
    note: 'Use a dedicated, least-privilege identity when available. Do not give an agent a human admin or treasurer token.'
  }
} as const;

export interface AgentFundLedgerEntry {
  seq: number;
  amountBasis: number;
  kind: EntryKind;
  tallyRoot: string;
  postedAt: string;
}

export interface AgentFundSummary {
  balanceBasis: number;
  entryCount: number;
  verifiedHead: string | null;
}

export interface AgentContextInput {
  council: { id: string; name: string };
  units: readonly UnitRecord[];
  deadlines: readonly DeadlineItem[];
  funds: Readonly<Record<string, readonly AgentFundLedgerEntry[] | AgentFundSummary>>;
  generatedAt: string;
}

/** Summarize signed ledger entries without returning descriptions or references. */
export function summarizeFund(entries: readonly AgentFundLedgerEntry[]) {
  const last = entries.reduce<AgentFundLedgerEntry | null>(
    (latest, entry) => (!latest || entry.seq > latest.seq ? entry : latest),
    null
  );
  return {
    balanceBasis: entries.reduce((balance, entry) => balance + entry.amountBasis, 0),
    entryCount: entries.length,
    verifiedHead: last?.tallyRoot ?? null
  };
}

/** Build a shareable, PII-minimized read-only context for an agent. */
export function buildAgentContext(input: AgentContextInput) {
  const units = input.units;
  const funds = Object.fromEntries(
    Object.entries(input.funds).map(([fundCode, entries]) => [fundCode, Array.isArray(entries) ? summarizeFund(entries) : entries])
  );
  return {
    protocol: AGENT_PROTOCOL_VERSION,
    generatedAt: input.generatedAt,
    // This is JSON, not HTML; preserve the original value and let the UI escape
    // it at its rendering boundary.
    scope: { type: 'council', id: input.council.id, name: input.council.name },
    mode: 'read-only',
    summary: {
      unitCount: units.length,
      occupancy: {
        occupied: units.filter((unit) => unit.occupancy === 'occupied').length,
        vacant: units.filter((unit) => unit.occupancy === 'vacant').length,
        shortTerm: units.filter((unit) => unit.occupancy === 'short-term').length
      },
      missingFormK: units.filter((unit) => unit.formK === 'missing').length
    },
    funds,
    deadlines: input.deadlines.slice(0, 50).map((deadline) => ({
      kind: deadline.kind,
      id: deadline.kind === 'quote' ? 'quote' : deadline.id,
      // Quote refs can include owner/unit/payment identifiers; don't disclose them.
      title: deadline.kind === 'quote' ? 'Open payment quote' : deadline.title,
      dueAt: deadline.dueAt,
      daysLeft: deadline.daysLeft,
      severity: deadline.severity,
      jurisdiction: deadline.jurisdiction
    })),
    safeguards: {
      personalContactDetailsIncluded: false,
      source: 'authenticated council API',
      actionsExecuted: false,
      note: 'This snapshot is informational. It does not authorize payments, notices, votes, or legal decisions.'
    }
  } as const;
}
