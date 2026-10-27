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

import { randomBytes } from 'node:crypto';
import type { SpendVerdict } from './ziggy.js';
import { validateOnchainAddress } from '../rails/rails.js';

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
  /** One-time server-side authorization context. Never accept this object back as authority. */
  issuedAt: string;
  expiresAt: string;
  policy: { network: 'mainnet' | 'testnet'; maxFeeSats: number; resolutionId?: string };
  /** Random opaque handle; orchestration remains server-side. */
  planToken: string;
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
  network?: 'mainnet' | 'testnet';
  maxFeeSats?: number;
  resolutionId?: string;
  now?: Date;
}

/** Deterministic plan id from the authorization inputs. */
export function psbtPlanId(fundCode: string, poRef: string, amountBasis: number): string {
  return `psbt:${fundCode}:${poRef}:${amountBasis}`.replace(/[^a-zA-Z0-9:]/g, '_');
}

export function buildPsbtPlan(input: BuildPsbtInput): PsbtPlan {
  if (!input.verdict.allow) {
    throw new Error(`cannot build PSBT for a blocked spend: ${input.verdict.reason}`);
  }
  if (!Number.isInteger(input.totalSigners) || input.totalSigners < 1 || input.totalSigners > 15 ||
      !Number.isInteger(input.requiredSignatures) || input.requiredSignatures <= 0 || input.requiredSignatures > input.totalSigners) {
    throw new Error('signer threshold must be within 1..totalSigners (maximum 15)');
  }
  if (!Number.isSafeInteger(input.amountSats) || input.amountSats <= 0 || !Number.isSafeInteger(input.feeSats) || input.feeSats < 0) {
    throw new Error('amountSats must be positive and feeSats must be a non-negative integer');
  }
  if (input.inputs.length < 1 || input.inputs.length > 100) throw new Error('inputs must contain 1..100 UTXOs');
  const seenInputs = new Set<string>();
  for (const utxo of input.inputs) {
    if (!/^[0-9a-f]{64}$/i.test(utxo.txid) || !Number.isInteger(utxo.vout) || utxo.vout < 0 || utxo.vout > 0xffffffff || !Number.isSafeInteger(utxo.sats) || utxo.sats <= 0) {
      throw new Error('each input must have a 32-byte txid, valid vout, and positive integer sats');
    }
    const outpoint = `${utxo.txid.toLowerCase()}:${utxo.vout}`;
    if (seenInputs.has(outpoint)) throw new Error('duplicate input outpoint');
    seenInputs.add(outpoint);
  }
  const address = validateOnchainAddress(input.recipient);
  if (!address.ok) throw new Error(`invalid recipient: ${address.reason}`);
  const maxFeeSats = input.maxFeeSats ?? 100_000;
  if (!Number.isSafeInteger(maxFeeSats) || maxFeeSats < 0 || input.feeSats > maxFeeSats) {
    throw new Error(`feeSats exceeds the configured ceiling (${maxFeeSats})`);
  }
  const totalInputSats = input.inputs.reduce((sum, u) => sum + u.sats, 0);
  if (!Number.isSafeInteger(totalInputSats) || totalInputSats < input.amountSats + input.feeSats) {
    throw new Error(`insufficient inputs: ${totalInputSats} < ${input.amountSats + input.feeSats}`);
  }
  if (input.resolutionId !== undefined && !/^[A-Za-z0-9._:-]{1,128}$/.test(input.resolutionId)) {
    throw new Error('resolutionId must be 1..128 safe identifier characters');
  }
  const now = input.now ?? new Date();
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  const planToken = randomBytes(32).toString('base64url');

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
    issuedAt,
    expiresAt,
    policy: { network: input.network ?? 'mainnet', maxFeeSats, resolutionId: input.resolutionId },
    planToken,
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
  if (!signatureB64 || signatureB64.length > 1024 || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(signatureB64)) {
    throw new Error('signature must be non-empty bounded base64');
  }
  const next: PsbtPlan = {
    ...plan,
    signatures: { ...plan.signatures, [String(signerIndex)]: signatureB64 }
  };
  const signedCount = Object.values(next.signatures).filter(Boolean).length;
  next.ready = signedCount >= next.requiredSignatures;
  return { plan: next, ready: next.ready };
}
