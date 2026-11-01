import { pickOne, sample, shuffle } from "./random";
import {
	MAX_NEW_PER_SESSION,
	MIN_EXPRESSIONS_FOR_QUIZ,
	URGENCY_RANK,
	type Urgency,
	classify,
	toMs,
} from "./schedule";
import { progressOf } from "./state";
import type { ExpressionProgress, Rng, StoreState } from "./types";

export interface SelectionContext {
	/** Ids already asked in the current session (answered or not). */
	excluded: ReadonlySet<string>;
	/** Number of never-tried expressions already asked in the current session. */
	newUsed: number;
}

export interface Question {
	target: string;
	/** Four distinct ids, in display order. The target is one of them. */
	options: string[];
}

interface Candidate {
	id: string;
	progress: ExpressionProgress;
	urgency: Urgency;
}

function candidatesOf(state: StoreState, ids: readonly string[], ctx: SelectionContext, now: Date) {
	return ids
		.filter((id) => !ctx.excluded.has(id))
		.map((id): Candidate => {
			const progress = progressOf(state, id);
			return { id, progress, urgency: classify(progress, now) };
		});
}

/** Once MAX_NEW_PER_SESSION new ones are used, prefer revisions (unless none are left). */
function applyNewCap(candidates: Candidate[], ctx: SelectionContext): Candidate[] {
	if (ctx.newUsed < MAX_NEW_PER_SESSION) return candidates;
	const revisions = candidates.filter((c) => c.urgency !== "new");
	return revisions.length > 0 ? revisions : candidates;
}

/** Not urgent: least correct first, then least recently presented. */
function compareRevisions(a: Candidate, b: Candidate): number {
	if (a.progress.correct_count !== b.progress.correct_count) {
		return a.progress.correct_count - b.progress.correct_count;
	}
	const aPresented = toMs(a.progress.presented_at ?? "");
	const bPresented = toMs(b.progress.presented_at ?? "");
	return aPresented - bPresented;
}

/** Most urgent tier first, then a uniform random pick inside that tier. */
function pickUrgent(urgent: Candidate[], rng: Rng): string | null {
	const best = Math.min(...urgent.map((c) => URGENCY_RANK[c.urgency]));
	const tier = urgent.filter((c) => URGENCY_RANK[c.urgency] === best);
	return pickOne(tier, rng)?.id ?? null;
}

/** Returns the next expression to ask, or null if nothing is eligible. */
export function pickNextExpression(
	state: StoreState,
	ids: readonly string[],
	ctx: SelectionContext,
	now: Date,
	rng: Rng,
): string | null {
	const candidates = applyNewCap(candidatesOf(state, ids, ctx, now), ctx);
	if (candidates.length === 0) return null;
	const urgent = candidates.filter((c) => c.urgency !== "later");
	if (urgent.length > 0) return pickUrgent(urgent, rng);
	return [...candidates].sort(compareRevisions)[0]?.id ?? null;
}

/** Builds a QCM: the target plus 3 distractors drawn from the other expressions. */
export function buildQuestion(target: string, ids: readonly string[], rng: Rng): Question {
	if (ids.length < MIN_EXPRESSIONS_FOR_QUIZ) {
		throw new Error(`Need at least ${MIN_EXPRESSIONS_FOR_QUIZ} expressions for a quiz`);
	}
	const distractors = sample(
		ids.filter((id) => id !== target),
		3,
		rng,
	);
	return { target, options: shuffle([target, ...distractors], rng) };
}
