import {
	type Question,
	type SelectionContext,
	buildQuestion,
	pickNextExpression,
} from "./selection";
import { progressOf } from "./state";
import type { Rng, StoreState } from "./types";

export type SessionCursor = SelectionContext;

export function emptyCursor(): SessionCursor {
	return { excluded: new Set(), newUsed: 0 };
}

/** Advances the cursor after an answer. Must be called before the state is updated. */
export function advanceCursor(cursor: SessionCursor, state: StoreState, id: string): SessionCursor {
	const wasNew = progressOf(state, id).presented_at === null;
	return {
		excluded: new Set([...cursor.excluded, id]),
		newUsed: cursor.newUsed + (wasNew ? 1 : 0),
	};
}

/** Draws the next question for the current session, or null if none is eligible. */
export function nextQuestion(
	state: StoreState,
	ids: readonly string[],
	cursor: SessionCursor,
	now: Date,
	rng: Rng,
): Question | null {
	const ctx: SelectionContext = { excluded: cursor.excluded, newUsed: cursor.newUsed };
	const target = pickNextExpression(state, ids, ctx, now, rng);
	return target === null ? null : buildQuestion(target, ids, rng);
}
