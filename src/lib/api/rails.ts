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

/**
 * The single CAD-per-BTC figure used by every rate tile when no host is
 * connected (demo mode). One named source so two "live" tiles on the same
 * screen cannot contradict each other — a connected host overrides this with
 * the value from /api/v1/rails/status.
 */
export const DEMO_CAD_PER_BTC = 96_500;

export async function fetchRailsStatus(): Promise<RailsStatus> {
  return apiFetch<RailsStatus>('/api/v1/rails/status', { token: getToken() });
}
