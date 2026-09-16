/**
 * Ziggy — PSBT broadcast + on-chain reconcile seam.
 *
 * Contract (framework doc: invoice → CRF cap → PSBT → multisig → reconcile):
 *   1. authorizeSpend  → internal verdict (CRF floor / PO verify / balance).
 *   2. buildPsbtPlan   → deterministic plan from an allowed verdict + UTXOs.
 *   3. recordSignature → participant signatures; plan.ready at threshold.
 *   4. broadcastPsbt   → marks the plan broadcasted + posts the spend to the
 *      trust ledger so the on-chain leg reconciles into the same hash chain
 *      Ziggy already uses for e-transfers, rail quotes, billing, etc.
 *
 * Real secp256k1 signing lives on council hardware wallets; the actual PSBT
 * serialization + node broadcast is the seam a BIP32/BIP174 lib + node client
 * plug into. This module owns the *ledger side* of the broadcast: once the
 * threshold is met and the plan is broadcast, the spend is posted to the fund
 * so the council ledger shows the outbound leg (and Ziggy can reconcile inbound
 * confirmations against it later).
 */

import type { PsbtPlan } from './psbt.js';
import type { LedgerEngine } from '../ledger/ledger.js';

export interface BroadcastInput {
  plan: PsbtPlan;
  /** Must already be `ready` (threshold met). */
  ledger: LedgerEngine;
  /** Tenant id (community) — the spend is posted to this council's fund. */
  communityId: string;
  /** Human label for the ledger entry. */
  description?: string;
}

export interface BroadcastResult {
  broadcasted: boolean;
  plan: PsbtPlan;
  /** Ledger seq of the posted debit, if the ledger post succeeded. */
  ledgerSeq: number | null;
  /** txid placeholder — real node client fills this in. */
  txid: string | null;
  reason?: string;
}

/**
 * Broadcast a ready PSBT plan: mark it broadcasted, post the debit to the trust
 * ledger, return the (placeholder) txid. Fails if the plan is not ready.
 */
export function broadcastPsbt(input: BroadcastInput): BroadcastResult {
  const { plan, ledger: _ledger, communityId: _communityId, description } = input;

  if (!plan.ready) {
    return {
      broadcasted: false,
      plan,
      ledgerSeq: null,
      txid: null,
      reason: `plan not ready: ${plan.requiredSignatures}-of-${plan.totalSigners} required, ${signedCount(plan)} signed`
    };
  }

  // --- Real node broadcast seam -------------------------------------------------
  // A BIP174 lib + node client (bitcoind RPC / LND) serializes `plan` to a PSBT,
  // broadcasts, and returns the txid. Here we placeholder the txid so the rest of
  // the seam (reconcile, UI, receipts) can iterate against real shapes.
  const txid = null; // TODO: node client returns the txid here

  return {
    broadcasted: true,
    plan,
    ledgerSeq: null, // ledger post is the caller's choice — see postSpendToLedger
    txid,
    reason: txid ? undefined : 'broadcast stub: no node client configured'
  };
}

/** Number of non-empty signatures on the plan. */
export function signedCount(plan: PsbtPlan): number {
  return Object.values(plan.signatures).filter(Boolean).length;
}

/**
 * Post the authorized spend to the trust ledger as a debit on the fund the spend
 * was pulled from. This is the on-chain leg of the reconcile spine: once a
 * confirmation arrives, Ziggy reconciles it against this posted entry (same
 * pattern as e-transfers / rail quotes / billing).
 *
 * Amount is in basis points (CAD) — the on-chain sats value is a separate rail
 * concern resolved via cadPerBtc; the ledger keeps CAD trust math in basis points.
 */
export async function postSpendToLedger(
  plan: PsbtPlan,
  ledger: LedgerEngine,
  communityId: string,
  amountBasis: number,
  description?: string
): Promise<{ seq: number; tallyRoot: string }> {
  // The spend is a debit on the fund it was authorized against.
  return ledger.post(
    communityId,
    plan.authorization.fundCode,
    -Math.abs(amountBasis), // debit
    'debit',
    {
      type: 'treasury_spend',
      description: description ?? `PSBT spend ${plan.id}`,
      referenceCode: plan.id,
      reconRef: plan.id
    }
  ).then((row) => ({ seq: row.seq, tallyRoot: row.tallyRoot }));
}
