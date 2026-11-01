import { QUESTIONS_PER_SESSION, toMs } from "./schedule";
import type { ExpressionProgress, KeyValueStorage, SessionRecord, StoreState } from "./types";

export const STORAGE_KEY = "nl-idioms-v1";

export function emptyProgress(): ExpressionProgress {
	return { presented_at: null, last_correct_at: null, correct_count: 0 };
}

export function progressOf(state: StoreState, id: string): ExpressionProgress {
	return state.expressions[id] ?? emptyProgress();
}

export function createState(ids: readonly string[], now: Date, anonymousId: string): StoreState {
	const iso = now.toISOString();
	return {
		anonymous_id: anonymousId,
		first_seen_at: iso,
		last_seen_at: iso,
		sessions: [],
		expressions: Object.fromEntries(ids.map((id) => [id, emptyProgress()])),
	};
}

function isStoreShape(value: unknown): value is StoreState {
	if (typeof value !== "object" || value === null) return false;
	const v = value as Partial<StoreState>;
	return (
		typeof v.anonymous_id === "string" &&
		typeof v.first_seen_at === "string" &&
		Array.isArray(v.sessions) &&
		typeof v.expressions === "object" &&
		v.expressions !== null
	);
}

function parseState(raw: string | null): StoreState | null {
	if (raw === null) return null;
	try {
		const parsed: unknown = JSON.parse(raw);
		return isStoreShape(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function fillMissing(state: StoreState, ids: readonly string[]): StoreState {
	const expressions = { ...state.expressions };
	for (const id of ids) {
		expressions[id] ??= emptyProgress();
	}
	return { ...state, expressions };
}

/** Loads the state from storage, or creates a fresh one. Updates last_seen_at. */
export function loadState(
	storage: KeyValueStorage,
	ids: readonly string[],
	now: Date,
	newAnonymousId: () => string,
): StoreState {
	const stored = parseState(storage.getItem(STORAGE_KEY));
	const base = stored ?? createState(ids, now, newAnonymousId());
	return fillMissing({ ...base, last_seen_at: now.toISOString() }, ids);
}

export function saveState(storage: KeyValueStorage, state: StoreState): void {
	storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Date of the last answer given during an open session, or its start if none. */
function lastActivityAt(state: StoreState, session: SessionRecord): string {
	const startMs = toMs(session.started_at);
	let latest = session.started_at;
	for (const progress of Object.values(state.expressions)) {
		const presented = progress.presented_at;
		if (presented !== null && toMs(presented) >= startMs && toMs(presented) > toMs(latest)) {
			latest = presented;
		}
	}
	return latest;
}

/** Closes sessions left open (page closed or reloaded mid-session) as abandoned. */
export function closeAbandonedSessions(state: StoreState): StoreState {
	const sessions = state.sessions.map((session) =>
		session.ended_at === null ? { ...session, ended_at: lastActivityAt(state, session) } : session,
	);
	return { ...state, sessions };
}

export function startSession(state: StoreState, now: Date): StoreState {
	const session: SessionRecord = {
		started_at: now.toISOString(),
		ended_at: null,
		questions_answered: 0,
		correct_count: 0,
	};
	return { ...state, sessions: [...state.sessions, session] };
}

/** The most recent session, open or finished. */
export function latestSession(state: StoreState): SessionRecord | undefined {
	return state.sessions.at(-1);
}

function updateOpenSession(
	sessions: SessionRecord[],
	correct: boolean,
	iso: string,
): SessionRecord[] {
	const index = sessions.findLastIndex((session) => session.ended_at === null);
	const session = sessions[index];
	if (session === undefined) return sessions;
	const answered = session.questions_answered + 1;
	const updated: SessionRecord = {
		...session,
		questions_answered: answered,
		correct_count: session.correct_count + (correct ? 1 : 0),
		ended_at: answered >= QUESTIONS_PER_SESSION ? iso : null,
	};
	return sessions.map((item, i) => (i === index ? updated : item));
}

/** Persists an answer. Correct: presented + last_correct + count. Wrong: presented only. */
export function recordAnswer(
	state: StoreState,
	id: string,
	correct: boolean,
	now: Date,
): StoreState {
	const iso = now.toISOString();
	const previous = progressOf(state, id);
	const next: ExpressionProgress = correct
		? {
				presented_at: iso,
				last_correct_at: iso,
				correct_count: previous.correct_count + 1,
			}
		: { ...previous, presented_at: iso };
	return {
		...state,
		expressions: { ...state.expressions, [id]: next },
		sessions: updateOpenSession(state.sessions, correct, iso),
	};
}
