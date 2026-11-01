import { describe, expect, it } from "vitest";
import {
	countMastered,
	countToReview,
	isCompleteSession,
	isReturningNextDay,
	localDay,
	sessionAccuracy,
} from "../src/lib/metrics";
import { createState, recordAnswer } from "../src/lib/state";
import type { StoreState } from "../src/lib/types";
import { IDS, NOW, at, freshState } from "./helpers";

function masteredState(): StoreState {
	let state = freshState();
	// 3 correct answers, last one today: mastered while not overdue.
	state = recordAnswer(state, IDS[0] ?? "", true, at(-2));
	state = recordAnswer(state, IDS[0] ?? "", true, at(-1));
	state = recordAnswer(state, IDS[0] ?? "", true, at(0));
	return state;
}

describe("mastery", () => {
	it("needs at least 3 correct answers and a correct last attempt", () => {
		expect(countMastered(masteredState(), IDS, NOW)).toBe(1);
	});

	it("is not mastered when the last attempt was wrong", () => {
		const state = recordAnswer(masteredState(), IDS[0] ?? "", false, at(0, 1));
		expect(countMastered(state, IDS, at(0, 2))).toBe(0);
	});

	it("is not mastered when overdue", () => {
		// correct_count 3 => 7-day interval; last correct 8 days ago.
		let state = freshState();
		for (const d of [-20, -15, -8]) state = recordAnswer(state, IDS[0] ?? "", true, at(d));
		expect(countMastered(state, IDS, NOW)).toBe(0);
	});
});

describe("to review", () => {
	it("counts failed and due expressions", () => {
		let state = recordAnswer(freshState(), IDS[0] ?? "", false, at(-1)); // failed
		state = recordAnswer(state, IDS[1] ?? "", true, at(-5)); // due (1-day interval)
		state = recordAnswer(state, IDS[2] ?? "", true, at(0)); // later
		expect(countToReview(state, IDS, NOW)).toBe(2);
	});
});

describe("returning browser", () => {
	it("is false the same calendar day", () => {
		const state = createState(IDS, new Date(2025, 2, 14, 8, 0), "a");
		const same = { ...state, last_seen_at: new Date(2025, 2, 14, 22, 0).toISOString() };
		expect(isReturningNextDay(same)).toBe(false);
	});

	it("is true on another calendar day", () => {
		const state = createState(IDS, new Date(2025, 2, 14, 23, 50), "a");
		const next = { ...state, last_seen_at: new Date(2025, 2, 15, 0, 10).toISOString() };
		expect(isReturningNextDay(next)).toBe(true);
	});
});

describe("sessions", () => {
	it("localDay uses the local calendar date", () => {
		expect(localDay(new Date(2025, 0, 5, 12).toISOString())).toBe("2025-01-05");
	});

	it("complete session means 5 answers", () => {
		const base = { started_at: NOW.toISOString(), ended_at: null, correct_count: 0 };
		expect(isCompleteSession({ ...base, questions_answered: 5 })).toBe(true);
		expect(isCompleteSession({ ...base, questions_answered: 4 })).toBe(false);
	});

	it("accuracy is correct / answered, null when nothing answered", () => {
		const base = { started_at: NOW.toISOString(), ended_at: null };
		expect(sessionAccuracy({ ...base, questions_answered: 5, correct_count: 3 })).toBeCloseTo(0.6);
		expect(sessionAccuracy({ ...base, questions_answered: 0, correct_count: 0 })).toBeNull();
	});
});
