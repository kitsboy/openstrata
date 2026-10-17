import { describe, it, expect } from 'vitest';
import {
	DEFAULT_GATEWAY_HOSTS,
	INTERAC_INSTITUTIONS,
	advance,
	buildRequest,
	contactKind,
	findInstitutions,
	handshakeStage,
	isDeposited,
	isExpired,
	isPayerContact,
	isTerminal,
	isTrustedGateway,
	normalizeContact,
	normalizeStatus,
	parseReturn,
	returnClaim,
	returnUrl
} from './interac';

describe('provider status vocabulary', () => {
	it('reads the provider spellings into the seven states', () => {
		expect(normalizeStatus('REQUESTED')).toBe('requested');
		expect(normalizeStatus(' request-sent ')).toBe('requested');
		expect(normalizeStatus('pending')).toBe('awaiting_payer');
		expect(normalizeStatus('Authorized')).toBe('approved');
		expect(normalizeStatus('deposited')).toBe('deposited');
		expect(normalizeStatus('timed_out')).toBe('expired');
		expect(normalizeStatus('Canceled')).toBe('cancelled');
	});

	it('refuses to guess at a status it does not know', () => {
		expect(normalizeStatus('whatever_the_bank_said')).toBeNull();
		expect(normalizeStatus('')).toBeNull();
		expect(normalizeStatus(null)).toBeNull();
		expect(normalizeStatus(42)).toBeNull();
	});

	it('treats only the four closed states as terminal, and only one as money', () => {
		expect(['deposited', 'declined', 'expired', 'cancelled'].every((s) => isTerminal(s as never))).toBe(true);
		expect(['requested', 'awaiting_payer', 'approved'].some((s) => isTerminal(s as never))).toBe(false);
		expect(isDeposited('deposited')).toBe(true);
		expect(isDeposited('approved')).toBe(false);
	});

	it('puts each state on the beat the payer sees', () => {
		expect(handshakeStage('requested')).toBe(1);
		expect(handshakeStage('awaiting_payer')).toBe(2);
		expect(handshakeStage('approved')).toBe(3);
		expect(handshakeStage('deposited')).toBe(4);
		// A stopped handshake did not reach a stage of its own.
		expect(handshakeStage('declined')).toBe(2);
		expect(handshakeStage('expired')).toBe(2);
	});
});

describe('simulated handshake transitions', () => {
	it('moves one step at a time, in the order a bank would', () => {
		expect(advance('requested', 'start')).toBe('awaiting_payer');
		expect(advance('awaiting_payer', 'approve')).toBe('approved');
		expect(advance('approved', 'settle')).toBe('deposited');
	});

	it('refuses what the rail would refuse', () => {
		// No settling without approval, and no approving twice into a new state.
		expect(advance('awaiting_payer', 'settle')).toBe('awaiting_payer');
		expect(advance('approved', 'approve')).toBe('approved');
		// A completed transfer is never cancelled or re-settled.
		expect(advance('deposited', 'cancel')).toBe('deposited');
		expect(advance('declined', 'approve')).toBe('declined');
		expect(advance('expired', 'start')).toBe('expired');
	});

	it('lets the payer stop it while it is still open', () => {
		expect(advance('requested', 'cancel')).toBe('cancelled');
		expect(advance('awaiting_payer', 'decline')).toBe('declined');
		expect(advance('approved', 'decline')).toBe('declined');
	});
});

describe('payer contact', () => {
	it('accepts an email or a ten-digit Canadian mobile', () => {
		expect(isPayerContact('owner@example.com')).toBe(true);
		expect(isPayerContact('604-555-0134')).toBe(true);
		expect(isPayerContact('+1 (604) 555-0134')).toBe(true);
		expect(isPayerContact('1 604 555 0134')).toBe(true);
	});

	it('rejects what Interac cannot address', () => {
		expect(isPayerContact('')).toBe(false);
		expect(isPayerContact('owner@')).toBe(false);
		expect(isPayerContact('604 555 013')).toBe(false);
		expect(isPayerContact('604 555 01345')).toBe(false);
	});

	it('keeps one shape per person, so two devices are one identifier', () => {
		expect(normalizeContact('Owner@Example.COM ')).toBe('owner@example.com');
		expect(normalizeContact('(604) 555-0134')).toBe('+16045550134');
		expect(normalizeContact('+1 604 555 0134')).toBe('+16045550134');
	});

	it('tells the two kinds apart', () => {
		expect(contactKind('owner@example.com')).toBe('email');
		expect(contactKind('6045550134')).toBe('mobile');
		expect(contactKind('nonsense')).toBe('invalid');
		expect(contactKind('  ')).toBe('invalid');
	});
});

describe('request body', () => {
	const base = {
		cents: 92_100,
		reference: 'EVG-305-202610',
		unitRef: '305',
		payeeContact: 'treasurer@evergreen.example',
		payerContact: 'Owner@Example.com',
		returnUrl: 'https://openstrata.giveabit.io/pay?unit=305&rail=etransfer'
	};

	it('builds the request with integer cents and the shared reference', () => {
		const built = buildRequest(base);
		expect(built.ok).toBe(true);
		if (!built.ok) return;
		expect(built.body.amountBasis).toBe(92_100);
		expect(built.body.currency).toBe('CAD');
		expect(built.body.referenceCode).toBe('EVG-305-202610');
		expect(built.body.unitRef).toBe('305');
		expect(built.body.payerContact).toBe('owner@example.com');
	});

	it('refuses an amount that is not a positive number of cents', () => {
		expect(buildRequest({ ...base, cents: 0 }).ok).toBe(false);
		expect(buildRequest({ ...base, cents: -100 }).ok).toBe(false);
		expect(buildRequest({ ...base, cents: 12.5 }).ok).toBe(false);
	});

	it('refuses a request it cannot address or reconcile', () => {
		expect(buildRequest({ ...base, reference: '  ' }).ok).toBe(false);
		expect(buildRequest({ ...base, unitRef: '' }).ok).toBe(false);
		expect(buildRequest({ ...base, payerContact: 'no-one' }).ok).toBe(false);
		expect(buildRequest({ ...base, payeeContact: 'nope' }).ok).toBe(false);
	});

	it('never sends the payer to a url it was not told about', () => {
		const built = buildRequest(base);
		expect(built.ok && built.body.returnUrl).toBe(base.returnUrl);
	});
});

describe('gateway url', () => {
	it('trusts https on Interac and its subdomains', () => {
		expect(isTrustedGateway('https://etransfer.interac.ca/request/abc')).toBe(true);
		expect(isTrustedGateway('https://interac.ca/x')).toBe(true);
	});

	it('refuses anything else, including a lookalike host', () => {
		expect(isTrustedGateway('http://etransfer.interac.ca/x')).toBe(false);
		expect(isTrustedGateway('https://interac.ca.evil.example/x')).toBe(false);
		expect(isTrustedGateway('https://notinterac.ca/x')).toBe(false);
		expect(isTrustedGateway('https://evil.example/interac.ca')).toBe(false);
		expect(isTrustedGateway('not a url')).toBe(false);
		expect(isTrustedGateway('javascript:alert(1)')).toBe(false);
	});

	it('refuses a missing address rather than throwing on it', () => {
		// A host that answers without a gateway URL is a refusal, not a crash.
		expect(isTrustedGateway(undefined)).toBe(false);
		expect(isTrustedGateway(null)).toBe(false);
		expect(isTrustedGateway('')).toBe(false);
	});

	it('accepts the hosts a council host names for its own provider', () => {
		expect(isTrustedGateway('https://pay.bmo.com/emt/1', ['bmo.com'])).toBe(true);
		expect(isTrustedGateway('https://etransfer.interac.ca/x', ['bmo.com'])).toBe(false);
		expect(isTrustedGateway('https://anything.example/x', [''])).toBe(false);
	});

	it('ships only Interac by default', () => {
		expect([...DEFAULT_GATEWAY_HOSTS]).toEqual(['interac.ca']);
	});
});

describe('the return from the bank', () => {
	it('reads the request id and the provider word without believing it', () => {
		const signal = parseReturn('?etransfer=REQ-7&status=DEPOSITED&unit=305');
		expect(signal).toEqual({ requestId: 'REQ-7', reported: 'DEPOSITED', status: 'deposited' });
		expect(parseReturn('?unit=305')).toBeNull();
		expect(parseReturn('')).toBeNull();
	});

	it('keeps an unrecognised status as reported and unknown', () => {
		const signal = parseReturn('etransfer=REQ-8&status=mystery');
		expect(signal?.status).toBeNull();
		expect(signal?.reported).toBe('mystery');
	});

	it('says out loud what a URL may and may not claim', () => {
		expect(returnClaim('deposited')).toBe('unconfirmed');
		expect(returnClaim('approved')).toBe('unconfirmed');
		expect(returnClaim('declined')).toBe('not_completed');
		expect(returnClaim('expired')).toBe('not_completed');
		expect(returnClaim('cancelled')).toBe('not_completed');
		expect(returnClaim(null)).toBe('unknown');
	});

	it('writes the return url without dropping the context the payer arrived with', () => {
		const url = returnUrl('https://example.test/pay?unit=305&rail=etransfer', 'REQ-9');
		expect(url).toContain('unit=305');
		expect(url).toContain('rail=etransfer');
		expect(url).toContain('etransfer=REQ-9');
		expect(url).not.toContain('status=');
		expect(returnUrl('https://example.test/pay', 'REQ-9', 'deposited')).toContain('status=deposited');
	});

	it('expires only when the provider says so', () => {
		const now = Date.parse('2026-10-16T12:00:00Z');
		expect(isExpired('2026-10-16T11:59:59Z', now)).toBe(true);
		expect(isExpired('2026-10-16T12:00:01Z', now)).toBe(false);
		expect(isExpired(undefined, now)).toBe(false);
		// A value nobody can parse must not end a payer's session.
		expect(isExpired('whenever', now)).toBe(false);
	});
});

describe('institutions', () => {
	it('lists institutions once each, with a name and a kind', () => {
		const ids = INTERAC_INSTITUTIONS.map((item) => item.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(INTERAC_INSTITUTIONS.length).toBeGreaterThanOrEqual(15);
		expect(INTERAC_INSTITUTIONS.every((item) => item.name.length > 1)).toBe(true);
	});

	it('searches without case, and answers the empty query with everything', () => {
		expect(findInstitutions('vanc').map((i) => i.id)).toEqual(['vancity']);
		expect(findInstitutions('BANK')).toEqual(findInstitutions('bank'));
		expect(findInstitutions('').length).toBe(INTERAC_INSTITUTIONS.length);
		expect(findInstitutions('zzz')).toEqual([]);
	});
});
