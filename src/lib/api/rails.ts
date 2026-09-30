/**
 * Sovereign payment rail status (`GET /api/v1/rails/status`) — which payment
 * rails are enabled on the host (fiat, onchain, lightning, liquid, paynym,
 * nostr) plus the current CAD-per-BTC rate used for quoting.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export interface RailInfo {
  enabled: boolean;
  label?: string;
}

export interface RailsStatus {
  rails: Record<string, RailInfo>;
  cadPerBtc: number;
}

export async function fetchRailsStatus(): Promise<RailsStatus> {
  return apiFetch<RailsStatus>('/api/v1/rails/status', { token: getToken() });
}
