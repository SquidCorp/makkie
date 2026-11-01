import { MASTERY_CORRECT_COUNT, QUESTIONS_PER_SESSION, classify, sameInstant } from "./schedule";
import { progressOf } from "./state";
import type { SessionRecord, StoreState } from "./types";

/** Local calendar day, e.g. "2025-03-14". */
export function localDay(iso: string): string {
	const date = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isMastered(state: StoreState, id: string, now: Date): boolean {
	const progress = progressOf(state, id);
	return (
		progress.correct_count >= MASTERY_CORRECT_COUNT &&
		sameInstant(progress.presented_at, progress.last_correct_at) &&
		classify(progress, now) === "later"
	);
}

export function isToReview(state: StoreState, id: string, now: Date): boolean {
	const urgency = classify(progressOf(state, id), now);
	return urgency === "failed" || urgency === "due";
}

export function countMastered(state: StoreState, ids: readonly string[], now: Date): number {
	return ids.filter((id) => isMastered(state, id, now)).length;
}

export function countToReview(state: StoreState, ids: readonly string[], now: Date): number {
	return ids.filter((id) => isToReview(state, id, now)).length;
}

/** Returning browser on a later calendar day than the first visit. */
export function isReturningNextDay(state: StoreState): boolean {
	return localDay(state.last_seen_at) !== localDay(state.first_seen_at);
}

export function isCompleteSession(session: SessionRecord): boolean {
	return session.questions_answered === QUESTIONS_PER_SESSION;
}

/** Share of correct answers in a session, or null if nothing was answered. */
export function sessionAccuracy(session: SessionRecord): number | null {
	if (session.questions_answered === 0) return null;
	return session.correct_count / session.questions_answered;
}

export interface Summary {
	total: number;
	mastered: number;
	toReview: number;
	completeSessions: number;
}

/** Header metrics for the games page. Computed on the fly, nothing stored. */
export function summarize(state: StoreState, ids: readonly string[], now: Date): Summary {
	return {
		total: ids.length,
		mastered: countMastered(state, ids, now),
		toReview: countToReview(state, ids, now),
		completeSessions: state.sessions.filter(isCompleteSession).length,
	};
}
