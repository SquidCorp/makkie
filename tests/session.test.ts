import { describe, expect, it } from "vitest";
import { advanceCursor, emptyCursor, nextQuestion } from "../src/lib/session";
import { recordAnswer } from "../src/lib/state";
import { IDS, NOW, at, freshState, must, seededRng } from "./helpers";

describe("session cursor", () => {
	it("tracks asked ids and new expressions used", () => {
		const state = freshState();
		let cursor = advanceCursor(emptyCursor(), state, IDS[0] ?? "");
		cursor = advanceCursor(cursor, state, IDS[1] ?? "");
		expect([...cursor.excluded]).toEqual([IDS[0], IDS[1]]);
		expect(cursor.newUsed).toBe(2);
	});

	it("does not count revisions as new", () => {
		const state = recordAnswer(freshState(), IDS[0] ?? "", true, at(-3));
		const cursor = advanceCursor(emptyCursor(), state, IDS[0] ?? "");
		expect(cursor.newUsed).toBe(0);
	});

	it("never asks the same expression twice in a session", () => {
		let state = freshState();
		let cursor = emptyCursor();
		const asked: string[] = [];
		const rng = seededRng(5);
		for (let i = 0; i < 5; i++) {
			const q = must(nextQuestion(state, IDS, cursor, NOW, rng));
			asked.push(q.target);
			cursor = advanceCursor(cursor, state, q.target);
			state = recordAnswer(state, q.target, i % 2 === 0, at(0, i));
		}
		expect(new Set(asked).size).toBe(5);
	});

	it("limits new expressions to 3 per session when revisions exist", () => {
		let state = freshState();
		// 5 failed revisions exist, so the 3-new cap can be enforced.
		for (const id of IDS.slice(0, 5)) state = recordAnswer(state, id, false, at(-1));
		let cursor = emptyCursor();
		const rng = seededRng(11);
		let newCount = 0;
		for (let i = 0; i < 5; i++) {
			const q = must(nextQuestion(state, IDS, cursor, NOW, rng));
			if (!state.expressions[q.target]?.presented_at) newCount++;
			cursor = advanceCursor(cursor, state, q.target);
			state = recordAnswer(state, q.target, false, at(0, i));
		}
		expect(newCount).toBe(3);
	});
});
