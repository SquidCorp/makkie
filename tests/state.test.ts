import { describe, expect, it } from "vitest";
import { EXPRESSIONS, EXPRESSION_IDS } from "../src/data/expressions";
import {
	STORAGE_KEY,
	closeAbandonedSessions,
	createState,
	loadState,
	progressOf,
	recordAnswer,
	saveState,
	startSession,
} from "../src/lib/state";
import { IDS, NOW, at, memoryStorage } from "./helpers";

const ANON = "11111111-1111-4111-8111-111111111111";

describe("loadState / saveState", () => {
	it("creates a fresh state with all expressions at zero", () => {
		const state = loadState(memoryStorage(), IDS, NOW, () => ANON);
		expect(state.anonymous_id).toBe(ANON);
		expect(state.first_seen_at).toBe(NOW.toISOString());
		expect(state.last_seen_at).toBe(NOW.toISOString());
		expect(state.sessions).toEqual([]);
		expect(Object.keys(state.expressions)).toHaveLength(IDS.length);
		expect(state.expressions[IDS[0] ?? ""]).toEqual({
			presented_at: null,
			last_correct_at: null,
			correct_count: 0,
		});
	});

	it("keeps anonymous_id and first_seen_at across visits, updates last_seen_at", () => {
		const storage = memoryStorage();
		const first = loadState(storage, IDS, NOW, () => ANON);
		saveState(storage, first);
		const again = loadState(storage, IDS, at(1), () => "other-id");
		expect(again.anonymous_id).toBe(ANON);
		expect(again.first_seen_at).toBe(NOW.toISOString());
		expect(again.last_seen_at).toBe(at(1).toISOString());
	});

	it("regenerates a state when stored JSON is corrupt", () => {
		const storage = memoryStorage({ [STORAGE_KEY]: "{not json" });
		const state = loadState(storage, IDS, NOW, () => "fresh");
		expect(state.anonymous_id).toBe("fresh");
	});

	it("adds missing expressions when the base grows", () => {
		const storage = memoryStorage();
		saveState(storage, createState(IDS.slice(0, 5), NOW, ANON));
		const state = loadState(storage, IDS, NOW, () => "x");
		expect(Object.keys(state.expressions)).toHaveLength(IDS.length);
	});
});

describe("sessions", () => {
	it("startSession appends an open session", () => {
		const state = startSession(createState(IDS, NOW, ANON), at(0));
		expect(state.sessions).toEqual([
			{
				started_at: NOW.toISOString(),
				ended_at: null,
				questions_answered: 0,
				correct_count: 0,
			},
		]);
	});

	it("a correct answer updates the expression and the open session", () => {
		let state = startSession(createState(IDS, NOW, ANON), NOW);
		state = recordAnswer(state, IDS[0] ?? "", true, at(0, 1));
		expect(progressOf(state, IDS[0] ?? "")).toEqual({
			presented_at: at(0, 1).toISOString(),
			last_correct_at: at(0, 1).toISOString(),
			correct_count: 1,
		});
		expect(state.sessions[0]).toMatchObject({ questions_answered: 1, correct_count: 1 });
	});

	it("a wrong answer only touches presented_at and the session counters", () => {
		let state = recordAnswer(createState(IDS, NOW, ANON), IDS[0] ?? "", true, at(-2));
		state = startSession(state, at(0));
		state = recordAnswer(state, IDS[0] ?? "", false, at(0, 1));
		expect(progressOf(state, IDS[0] ?? "")).toEqual({
			presented_at: at(0, 1).toISOString(),
			last_correct_at: at(-2).toISOString(),
			correct_count: 1,
		});
		expect(state.sessions[0]).toMatchObject({ questions_answered: 1, correct_count: 0 });
	});

	it("closes the session after 5 answers", () => {
		let state = startSession(createState(IDS, NOW, ANON), NOW);
		for (let i = 0; i < 4; i++) state = recordAnswer(state, IDS[i] ?? "", true, at(0, i));
		expect(state.sessions[0]?.ended_at).toBeNull();
		state = recordAnswer(state, IDS[4] ?? "", false, at(0, 5));
		expect(state.sessions[0]).toMatchObject({
			questions_answered: 5,
			correct_count: 4,
			ended_at: at(0, 5).toISOString(),
		});
	});

	it("closes an abandoned session at its last answer (or start if none)", () => {
		let state = startSession(createState(IDS, NOW, ANON), NOW);
		state = recordAnswer(state, IDS[0] ?? "", true, at(0, 2));
		state = closeAbandonedSessions(state);
		expect(state.sessions[0]).toMatchObject({
			questions_answered: 1,
			ended_at: at(0, 2).toISOString(),
		});

		let empty = startSession(createState(IDS, NOW, ANON), at(0, 1));
		empty = closeAbandonedSessions(empty);
		expect(empty.sessions[0]?.ended_at).toBe(at(0, 1).toISOString());
	});

	it("keeps finished sessions untouched when closing abandoned ones", () => {
		let state = startSession(createState(IDS, NOW, ANON), NOW);
		for (let i = 0; i < 5; i++) state = recordAnswer(state, IDS[i] ?? "", true, at(0, i));
		const before = state.sessions[0];
		expect(closeAbandonedSessions(state).sessions[0]).toEqual(before);
	});
});

describe("data", () => {
	it("has 17 expressions with unique ids and unique situations", () => {
		expect(EXPRESSIONS).toHaveLength(17);
		expect(new Set(EXPRESSION_IDS).size).toBe(17);
		expect(new Set(EXPRESSIONS.map((e) => e.situation)).size).toBe(17);
	});

	it("expression names are unique", () => {
		expect(new Set(EXPRESSIONS.map((e) => e.nl.toLowerCase())).size).toBe(17);
	});
});
