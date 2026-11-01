import type { ExpressionProgress } from "./types";

export const QUESTIONS_PER_SESSION = 5;
export const MAX_NEW_PER_SESSION = 3;
export const MASTERY_CORRECT_COUNT = 3;
export const MIN_EXPRESSIONS_FOR_QUIZ = 4;

const DAY_MS = 24 * 60 * 60 * 1000;
/** Review interval in days, indexed by correct_count (4+ uses the last entry). */
const INTERVAL_DAYS = [0, 1, 3, 7, 14] as const;

export type Urgency = "new" | "failed" | "due" | "later";

/** Lower rank = more urgent. */
export const URGENCY_RANK: Record<Urgency, number> = {
	new: 0,
	failed: 1,
	due: 2,
	later: 3,
};

export function toMs(iso: string): number {
	return Date.parse(iso);
}

export function sameInstant(a: string | null, b: string | null): boolean {
	return a !== null && b !== null && toMs(a) === toMs(b);
}

export function intervalMs(correctCount: number): number {
	const index = Math.min(Math.max(correctCount, 0), INTERVAL_DAYS.length - 1);
	return (INTERVAL_DAYS[index] ?? 0) * DAY_MS;
}

export function classify(progress: ExpressionProgress, now: Date): Urgency {
	const { presented_at: presented, last_correct_at: correct } = progress;
	if (presented === null) return "new";
	if (correct === null || toMs(presented) > toMs(correct)) return "failed";
	if (now.getTime() >= toMs(correct) + intervalMs(progress.correct_count)) return "due";
	return "later";
}
