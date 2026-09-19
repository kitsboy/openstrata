/**
 * Payment rail helpers — quote a fee payment on any enabled rail and confirm
 * it once paid (`POST /api/v1/payments/quote` + `/confirm`). The quote locks a
 * reference code + (for BTC rails) a CAD rate; confirm posts the credit to the
 * unit's AR ledger and returns the chain seq for the receipt.
 *
 * `receiveLabel` is the per-site label the payment carries at the node and in
 * the payer's wallet (`OST northgate U302 pay-9142`). It is issued by the
 * backend's `receive-label.ts`, never composed on the client, so the string a
 * council writes on a transfer is the string the node records.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export type Rail = 'fiat' | 'onchain' | 'lightning' | 'liquid' | 'paynym_bip47' | 'nostr';

export interface PaymentQuoteInput {
  rail: Rail;
  refId: string;
  unitRef: string;
  amountBasis: number;
  currency: 'CAD' | 'BTC';
  recipient: string;
  note?: string;
}

export interface PaymentQuote {
  rail: Rail;
  /** Per-site receive label issued by the backend. */
  receiveLabel: string;
  referenceCode: string;
  recipient: string;
  invoice?: string;
  fiatLockedBasis?: number;
  amountSat?: number;
  expiresAt?: string;
  status: string;
}

export async function quotePayment(
  input: PaymentQuoteInput
): Promise<{ created: boolean; invoice: PaymentQuote }> {
  return apiFetch<{ ok: boolean; created: boolean; invoice: PaymentQuote }>(
    '/api/v1/payments/quote',
    { method: 'POST', body: input, token: getToken() }
  );
}

export interface ConfirmResult {
  seq: number;
  referenceCode: string;
  status: 'paid';
}

export async function confirmPayment(referenceCode: string): Promise<ConfirmResult> {
  return apiFetch<{ ok: boolean } & ConfirmResult>('/api/v1/payments/confirm', {
    method: 'POST',
    body: { referenceCode },
    token: getToken()
  });
}
