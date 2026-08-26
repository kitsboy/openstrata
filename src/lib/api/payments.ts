/**
 * Payment rail helpers — quote a fee payment on any enabled rail and confirm
 * it once paid (`POST /api/v1/payments/quote` + `/confirm`). The quote locks a
 * reference code + (for BTC rails) a CAD rate; confirm posts the credit to the
 * unit's AR ledger and returns the chain seq for the receipt.
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
