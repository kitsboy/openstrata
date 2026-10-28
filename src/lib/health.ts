/**
 * The compliance-health score as one model, so the gauge and its history cannot
 * disagree.
 *
 * The card has always said it is built on three things — deadlines, Form K gaps
 * and AR — and for as long as it only measured deadlines it was advertising two
 * inputs it never read. This module reads all three, and the same function
 * produces the number on the gauge and the six points behind it.
 *
 * The weights are decisions, not arithmetic:
 *
 * - **Deadlines** keep the table the panel already published: an overdue tracked
 *   item costs 20, one inside 14 days costs 10, an urgent one 8, a soon one 4.
 *   Days left are counted from the statement date, so the same item scores
 *   differently a month earlier — which is the whole point of a trend.
 * - **AR past due costs one point per $250**, capped at 25. The cap matters: a
 *   council with a large special levy outstanding would otherwise score zero
 *   forever and stop reading the number. It is past-due money only, so a balance
 *   on an agreed plan is not counted — the ladder on /accounting makes the same
 *   distinction, and a score that punished a plan would contradict it.
 * - **A missing Form K costs 5**, capped at 15. Three lots is already every
 *   privacy failure the register can carry; beyond that the score is describing
 *   the building's size rather than its paperwork.
 */

import { daysBetween } from './arrears';

export type Severity = 'urgent' | 'soon' | 'routine';

export interface TrackedDeadline {
	dueAt: string;
	severity: Severity;
}

export interface HealthInputs {
	/** The deadlines the council is tracking, with the severity it gave them. */
	tracked: TrackedDeadline[];
	/** Money past its due date, excluding balances on an agreed payment plan. */
	arPastDueCents: number;
	/** Lots whose Form K is missing and whose two-week window has closed. */
	formKGaps: number;
}

export type HealthKey = 'deadlines' | 'arrears' | 'formK';

export interface Penalties {
	deadlines: number;
	arrears: number;
	formK: number;
	total: number;
}

/** What an overdue tracked deadline costs. */
export const DEADLINE_OVERDUE = 20;
/** What a deadline inside the next two weeks costs. */
export const DEADLINE_SOON = 10;
/** What an item the council itself marked urgent costs while it is further out. */
export const DEADLINE_URGENT = 8;
/** What an item marked soon costs while it is further out. */
export const DEADLINE_WATCH = 4;
/** The window, in days, that makes a deadline "soon" whatever its severity. */
export const SOON_DAYS = 14;

/** One point of AR penalty per this much past-due money. */
export const AR_STEP_CENTS = 25_000;
export const AR_CAP = 25;

/** One Form K gap costs this much, up to the cap. */
export const FORM_K_EACH = 5;
export const FORM_K_CAP = 15;
/** The bylaw window a lot has to hand in its Form K after a tenant moves in. */
export const FORM_K_DAYS = 14;

/** Deadline points at `asOf`, from due dates rather than stored day counts. */
export function deadlinePenalty(tracked: TrackedDeadline[], asOf: string): number {
	let penalty = 0;
	for (const item of tracked) {
		const daysLeft = daysBetween(asOf, item.dueAt);
		if (daysLeft < 0) penalty += DEADLINE_OVERDUE;
		else if (daysLeft <= SOON_DAYS) penalty += DEADLINE_SOON;
		else if (item.severity === 'urgent') penalty += DEADLINE_URGENT;
		else if (item.severity === 'soon') penalty += DEADLINE_WATCH;
	}
	return penalty;
}

/** Arrears points: one per $250 past due, capped. A plan balance never arrives here. */
export function arrearsPenalty(arPastDueCents: number): number {
	if (!Number.isFinite(arPastDueCents) || arPastDueCents <= 0) return 0;
	return Math.min(AR_CAP, Math.floor(arPastDueCents / AR_STEP_CENTS));
}

/** Form K points: 5 a lot, capped. */
export function formKPenalty(formKGaps: number): number {
	if (!Number.isFinite(formKGaps) || formKGaps <= 0) return 0;
	return Math.min(FORM_K_CAP, Math.floor(formKGaps) * FORM_K_EACH);
}

/** All three terms at `asOf`, and what they add to. */
export function penalties(inputs: HealthInputs, asOf: string): Penalties {
	const deadlines = deadlinePenalty(inputs.tracked, asOf);
	const arrears = arrearsPenalty(inputs.arPastDueCents);
	const formK = formKPenalty(inputs.formKGaps);
	return { deadlines, arrears, formK, total: deadlines + arrears + formK };
}

/** The score itself: 100 less the three terms, never below zero. */
export function scoreOf(penalties: Penalties): number {
	return Math.max(0, Math.min(100, 100 - penalties.total));
}

export interface HealthSnapshot {
	asOf: string;
	score: number;
	penalties: Penalties;
	inputs: HealthInputs;
}

/** One statement date's score. */
export function healthAt(inputs: HealthInputs, asOf: string): HealthSnapshot {
	const terms = penalties(inputs, asOf);
	return { asOf, score: scoreOf(terms), penalties: terms, inputs };
}

/**
 * Which input pushed the score down most since the point before it. A month
 * where nothing got worse returns null rather than inventing a mover, and a
 * month that got better names no culprit either.
 */
export function biggestMove(
	previous: Penalties,
	next: Penalties
): { key: HealthKey; points: number } | null {
	const keys: HealthKey[] = ['deadlines', 'arrears', 'formK'];
	let worst: { key: HealthKey; points: number } | null = null;
	for (const key of keys) {
		const points = next[key] - previous[key];
		if (points > 0 && (worst === null || points > worst.points)) worst = { key, points };
	}
	return worst;
}

export interface TrendPoint extends HealthSnapshot {
	/** `YYYY-MM` the point closes. */
	period: string;
	/** The input that moved the score down most since the point before it. */
	moved: { key: HealthKey; points: number } | null;
}

export interface TrendInput {
	period: string;
	asOf: string;
	inputs: HealthInputs;
}

/**
 * The series, oldest first. Each point is measured at its own statement date, so
 * a charge that was not yet due in April is not in April's arrears, and a Form K
 * whose window had not closed is not a gap.
 */
export function trend(points: TrendInput[]): TrendPoint[] {
	const ordered = [...points].sort((a, b) => a.asOf.localeCompare(b.asOf));
	return ordered.map((point, index) => {
		const snapshot = healthAt(point.inputs, point.asOf);
		const previous = index > 0 ? penalties(ordered[index - 1].inputs, ordered[index - 1].asOf) : null;
		return {
			...snapshot,
			period: point.period,
			moved: previous ? biggestMove(previous, snapshot.penalties) : null
		};
	});
}
