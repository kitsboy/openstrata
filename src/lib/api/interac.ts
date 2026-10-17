/**
 * Frontend wiring for an Interac e-Transfer Business Request Money request.
 *
 * Two calls, both on the council's own host: start a request (the host holds the
 * merchant credential and returns the gateway URL Interac gave it), and read the
 * request's status back after the payer returns. Neither one is ever called with
 * a merchant secret from this static build — the secret stays on the host.
 */

import { apiFetch } from './client';
import { getToken } from './token';
import type { InteracRequestBody } from '$lib/interac';

export interface InteracRequestResult {
	ok: boolean;
	/** The provider's identifier for this request — the thread a return follows. */
	requestId: string;
	/** Where the payer is sent to choose their bank and approve. */
	gatewayUrl: string;
	/** Hosts the council's host allows for its provider; absent = Interac's own. */
	gatewayHosts?: string[];
	status: string;
	amountBasis: number;
	referenceCode: string;
	expiresAt?: string;
	/** True when the host answered from its simulation instead of a live provider. */
	demo: boolean;
	reason?: string;
}

export async function startInteracRequest(
	body: InteracRequestBody
): Promise<InteracRequestResult> {
	return apiFetch<InteracRequestResult>('/api/v1/payments/interac/request', {
		method: 'POST',
		body,
		token: getToken()
	});
}

export interface InteracStatusResult {
	ok: boolean;
	requestId: string;
	status: string;
	amountBasis: number;
	referenceCode: string;
	expiresAt?: string;
	demo: boolean;
	reason?: string;
}

export async function interacRequestStatus(requestId: string): Promise<InteracStatusResult> {
	return apiFetch<InteracStatusResult>(
		`/api/v1/payments/interac/request/${encodeURIComponent(requestId)}`,
		{ token: getToken() }
	);
}
