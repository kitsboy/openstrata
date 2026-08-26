/**
 * Ziggy — PSBT/multisig execution seam (item #15).
 *
 * The council treasury is a 3-of-5 multisig: no single key can move funds, and
 * broadcast happens only after the signature threshold is met. The real
 * secp256k1 signing lives on council hardware wallets; this module is the
 * deterministic orchestration skeleton — it builds a PSBT plan from a verified
 * spend, tracks incoming signatures, and reports readiness at the threshold.
 *
 * The signature "bytes" here are placeholders (the format must match what the
 * hardware wallets sign). This is the seam the real signing backend plugs into.
 */

import type { SpendVerdict } from './ziggy.js';

export interface PsbtInputRef {
  /** UTXO txid. */
  txid: string;
  vout: number;
  /** Value in sats. */
  sats: number;
}

export interface PsbtPlan {
  id: string;
  /** Spend verdict that authorized this plan (never unsigned). */
  authorization: {
    allowed: boolean;
    fundCode: string;
    amountBasis: number;
  };
  recipient: string;
  /** Amount out in sats (positive). */
  amountSats: number;
  feeSats: number;
  inputs: PsbtInputRef[];
  totalSigners: number;
  requiredSignatures: number;
  /** Signature slots, keyed by participant index. */
  signatures: Record<string, string | undefined>;
  /** Base64 placeholder for the serialized PSBT (real builder plugs in). */
  psbtB64: string | null;
  ready: boolean;
}

export interface BuildPsbtInput {
  verdict: SpendVerdict;
  amountSats: number;
  feeSats: number;
  recipient: string;
  inputs: PsbtInputRef[];
  /** Total signers on the multisig wallet. */
  totalSigners: number;
  /** Signatures required to broadcast. */
  requiredSignatures: number;
}

/** Deterministic plan id from the authorization inputs. */
export function psbtPlanId(fundCode: string, poRef: string, amountBasis: number): string {
  return `psbt:${fundCode}:${poRef}:${amountBasis}`.replace(/[^a-zA-Z0-9:]/g, '_');
}

export function buildPsbtPlan(input: BuildPsbtInput): PsbtPlan {
  if (!input.verdict.allow) {
    throw new Error(`cannot build PSBT for a blocked spend: ${input.verdict.reason}`);
  }
  if (input.requiredSignatures <= 0 || input.requiredSignatures > input.totalSigners) {
    throw new Error('requiredSignatures must be within 1..totalSigners');
  }
  const totalInputSats = input.inputs.reduce((sum, u) => sum + u.sats, 0);
  if (totalInputSats < input.amountSats + input.feeSats) {
    throw new Error(`insufficient inputs: ${totalInputSats} < ${input.amountSats + input.feeSats}`);
  }

  const signatures: Record<string, string | undefined> = {};
  for (let i = 0; i < input.totalSigners; i++) signatures[String(i)] = undefined;

  return {
    id: psbtPlanId(input.verdict.pulledFrom, 'spend', input.verdict.basis),
    authorization: {
      allowed: true,
      fundCode: input.verdict.pulledFrom,
      amountBasis: input.verdict.basis
    },
    recipient: input.recipient,
    amountSats: input.amountSats,
    feeSats: input.feeSats,
    inputs: input.inputs,
    totalSigners: input.totalSigners,
    requiredSignatures: input.requiredSignatures,
    signatures,
    psbtB64: null, // placeholder — real builder serializes here
    ready: false
  };
}

/**
 * Record a participant's signature. Returns the updated plan and whether the
 * threshold has been reached (ready to broadcast).
 */
export function recordSignature(
  plan: PsbtPlan,
  signerIndex: number,
  signatureB64: string
): { plan: PsbtPlan; ready: boolean } {
  if (signerIndex < 0 || signerIndex >= plan.totalSigners) {
    throw new Error(`unknown signer index ${signerIndex}`);
  }
  const next: PsbtPlan = {
    ...plan,
    signatures: { ...plan.signatures, [String(signerIndex)]: signatureB64 }
  };
  const signedCount = Object.values(next.signatures).filter(Boolean).length;
  next.ready = signedCount >= next.requiredSignatures;
  return { plan: next, ready: next.ready };
}
