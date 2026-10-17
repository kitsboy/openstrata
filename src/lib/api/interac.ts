/**
 * Frontend wiring for an Interac e-Transfer Business Request Money request.
 *
 * Two calls, both on the council's own host: start a request (the host holds the
 * merchant credential and returns the gateway URL Interac gave it), and read the
 * request's status back after the payer returns. Neither one is ever called with
 * a merchant secret from this static build — the secret stays on the host.
 */

import { ApiError, apiFetch } from './client';
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

/**
 * Start the request. A signed-in council may post the lot it is paying for; an
 * owner holding a bill link posts the link instead, and the host takes the
 * amount, lot, reference and payee from the link's own claims — never from this
 * body, which the owner's page could have altered.
 */
export async function startInteracRequest(
	body: InteracRequestBody,
	options: { payLink?: string | null } = {}
): Promise<InteracRequestResult> {
	const result = await apiFetch<InteracRequestResult & { reason?: string }>(
		'/api/v1/payments/interac/request',
		{
			method: 'POST',
			body: options.payLink ? { ...body, payLink: options.payLink } : body,
			token: getToken()
		}
	);
	// A host that cannot start a request still answered. Treating that as a
	// started request would put a "live" badge on nothing, so it is a failure.
	if (result?.ok !== true || typeof result.requestId !== 'string' || !result.requestId) {
		throw new ApiError(502, result?.reason ?? 'the council’s host did not start the request');
	}
	return result;
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

/**
 * Read the status back. The same two credentials are accepted: a session, or the
 * bill link the request was started with (as `?t=`), which only lets its own
 * request be read.
 */
export async function interacRequestStatus(
	requestId: string,
	payLink?: string | null
): Promise<InteracStatusResult> {
	const path = `/api/v1/payments/interac/request/${encodeURIComponent(requestId)}`;
	const query = payLink ? `?t=${encodeURIComponent(payLink)}` : '';
	const result = await apiFetch<InteracStatusResult & { reason?: string }>(`${path}${query}`, {
		token: getToken()
	});
	if (result?.ok !== true || typeof result.status !== 'string') {
		throw new ApiError(502, result?.reason ?? 'the council’s host did not answer');
	}
	return result;
}
