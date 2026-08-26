/**
 * Payment request persistence — makes rail quotes durable and idempotent so the
 * shared `referenceCode` (used by Ziggy + the ledger to reconcile) survives
 * restarts and is never issued twice for the same (refId, unitRef, rail).
 */

import type { Rail, RailInvoice } from './rails.js';

export type { Rail } from './rails.js';

export type PaymentRequestStatus = 'quoted' | 'paid' | 'expired' | 'cancelled';

export interface PaymentRequest {
  refId: string;
  unitRef: string;
  communityId: string;
  rail: Rail;
  referenceCode: string;
  amountBasis: number;
  currency: string;
  recipient: string;
  invoice: string;
  fiatLockedBasis: number;
  amountSat: number;
  expiresAt?: string;
  status: PaymentRequestStatus;
  createdAt: string;
}

/**
 * Every lookup is scoped by `communityId` (the tenant/council) so two councils
 * can quote the same (refId, unitRef, rail) without colliding and a reference
 * code from council A can never resolve to council B's payment.
 */
export interface PaymentRequestStore {
  getByKey(
    communityId: string,
    refId: string,
    unitRef: string,
    rail: Rail
  ): Promise<PaymentRequest | null>;
  findByReference(communityId: string, referenceCode: string): Promise<PaymentRequest | null>;
  save(req: PaymentRequest): Promise<void>;
  markStatus(
    communityId: string,
    referenceCode: string,
    status: PaymentRequestStatus
  ): Promise<void>;
}

export interface QuoteSeed {
  refId: string;
  unitRef: string;
  communityId: string;
  rail: Rail;
  amountBasis: number;
  currency: string;
  recipient: string;
  invoice?: string;
  referenceCode: string;
  fiatLockedBasis?: number;
  amountSat?: number;
  expiresAt?: string;
}

export function toPaymentRequest(seed: QuoteSeed, now = new Date().toISOString()): PaymentRequest {
  return {
    refId: seed.refId,
    unitRef: seed.unitRef,
    communityId: seed.communityId,
    rail: seed.rail,
    referenceCode: seed.referenceCode,
    amountBasis: seed.amountBasis,
    currency: seed.currency,
    recipient: seed.recipient,
    invoice: seed.invoice ?? '',
    fiatLockedBasis: seed.fiatLockedBasis ?? 0,
    amountSat: seed.amountSat ?? 0,
    expiresAt: seed.expiresAt,
    status: 'quoted',
    createdAt: now
  };
}

export function fromInvoice(
  seed: Omit<QuoteSeed, 'recipient' | 'invoice' | 'amountSat' | 'fiatLockedBasis' | 'expiresAt'>,
  invoice: RailInvoice
): PaymentRequest {
  return toPaymentRequest({
    ...seed,
    recipient: invoice.recipient,
    invoice: invoice.invoice,
    fiatLockedBasis: invoice.fiatLockedBasis,
    amountSat: invoice.amountSat,
    expiresAt: invoice.expiresAt
  });
}

/**
 * Idempotent issuance: if a request already exists for (refId, unitRef, rail),
 * return it (and the pre-existing referenceCode) instead of minting a new one.
 * Returns `created` false on a hit so the API can tell callers apart.
 */
export async function getOrCreateQuote(
  store: PaymentRequestStore,
  seed: Omit<QuoteSeed, 'referenceCode'>,
  buildInvoice: () => RailInvoice,
  now = new Date().toISOString()
): Promise<{ request: PaymentRequest; created: boolean }> {
  const existing = await store.getByKey(seed.communityId, seed.refId, seed.unitRef, seed.rail);
  if (existing) return { request: existing, created: false };

  const invoice = buildInvoice();
  const request = fromInvoice({ ...seed, referenceCode: invoice.referenceCode }, invoice);
  await store.save(request);
  return { request, created: true };
}