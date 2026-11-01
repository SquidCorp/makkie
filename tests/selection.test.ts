import { describe, expect, it } from "vitest";
import { type Question, buildQuestion, pickNextExpression } from "../src/lib/selection";
import type { SelectionContext } from "../src/lib/selection";
import { recordAnswer } from "../src/lib/state";
import type { StoreState } from "../src/lib/types";
import { IDS, NOW, at, freshState, must, seededRng, seqRng } from "./helpers";

const ctx = (excluded: string[] = [], newUsed = 0): SelectionContext => ({
	excluded: new Set(excluded),
	newUsed,
});

/** Answers `id` correctly `times` times at `when`. */
function correct(state: StoreState, id: string, when: Date, times = 1): StoreState {
	let s = state;
	for (let i = 0; i < times; i++) s = recordAnswer(s, id, true, when);
	return s;
}

function wrong(state: StoreState, id: string, when: Date): StoreState {
	return recordAnswer(state, id, false, when);
}

/** Every expression except the first `n` is answered correctly today (not urgent). */
function allLaterExcept(state: StoreState, exceptions: string[]): StoreState {
	let s = state;
	for (const id of IDS) {
		if (!exceptions.includes(id)) s = correct(s, id, at(-0.2));
	}
	return s;
}

describe("pickNextExpression priority", () => {
	it("prefers never-tried over due", () => {
		const state = correct(freshState(), IDS[0] ?? "", at(-10)); // due, others never tried
		expect(pickNextExpression(state, IDS, ctx(), NOW, seqRng([0]))).toBe(IDS[1]);
	});

	it("prefers failed over due", () => {
		let state = correct(freshState(), IDS[0] ?? "", at(-10)); // due
		state = correct(state, IDS[1] ?? "", at(-10));
		state = wrong(state, IDS[1] ?? "", at(-1)); // failed
		state = allLaterExcept(state, [IDS[0] ?? "", IDS[1] ?? ""]);
		expect(pickNextExpression(state, IDS, ctx(), NOW, seqRng([0]))).toBe(IDS[1]);
	});

	it("picks randomly inside the same tier", () => {
		let state = correct(freshState(), IDS[0] ?? "", at(-10));
		state = correct(state, IDS[1] ?? "", at(-10));
		state = allLaterExcept(state, [IDS[0] ?? "", IDS[1] ?? ""]);
		expect(pickNextExpression(state, IDS, ctx(), NOW, seqRng([0]))).toBe(IDS[0]);
		expect(pickNextExpression(state, IDS, ctx(), NOW, seqRng([0.99]))).toBe(IDS[1]);
	});

	it("when nothing is urgent: lowest correct_count, then oldest presentation", () => {
		let state = freshState();
		state = correct(state, IDS[0] ?? "", at(-0.4), 2); // count 2
		state = correct(state, IDS[1] ?? "", at(-0.3)); // count 1, newer
		state = correct(state, IDS[2] ?? "", at(-0.45)); // count 1, oldest
		for (const id of IDS.slice(3)) state = correct(state, id, at(-0.2)); // count 1
		expect(pickNextExpression(state, IDS, ctx(), NOW, seqRng([0]))).toBe(IDS[2]);
	});
});

describe("pickNextExpression session rules", () => {
	it("never returns excluded ids", () => {
		expect(pickNextExpression(freshState(), IDS, ctx(IDS.slice(0, 16)), NOW, seqRng([0]))).toBe(
			IDS[16],
		);
	});

	it("returns null when everything is excluded", () => {
		expect(pickNextExpression(freshState(), IDS, ctx(IDS), NOW, seqRng([0]))).toBeNull();
	});

	it("caps new expressions at 3 per session while revisions exist", () => {
		let state = freshState();
		for (const id of IDS.slice(4)) state = correct(state, id, at(-0.2)); // IDS[0..3] never tried
		state = wrong(state, IDS[4] ?? "", at(-1)); // failed: a revision is available
		// 3 new already used: a never-tried one must not be picked.
		expect(pickNextExpression(state, IDS, ctx([], 3), NOW, seqRng([0]))).toBe(IDS[4]);
	});

	it("falls back to new expressions when no revision is left (first session)", () => {
		const pick = pickNextExpression(freshState(), IDS, ctx([], 3), NOW, seqRng([0]));
		expect(pick).not.toBeNull();
	});

	it("is reproducible with the same rng", () => {
		const a = pickNextExpression(freshState(), IDS, ctx(), NOW, seededRng(42));
		const b = pickNextExpression(freshState(), IDS, ctx(), NOW, seededRng(42));
		expect(a).toBe(b);
	});
});

function countDistractors(counts: Map<string, number>, target: string, rng: () => number): void {
	const options = buildQuestion(target, IDS, rng).options.filter((id) => id !== target);
	for (const id of options) counts.set(id, (counts.get(id) ?? 0) + 1);
}

describe("buildQuestion", () => {
	it("returns 4 distinct options including the target", () => {
		const q: Question = buildQuestion(IDS[5] ?? "", IDS, seededRng(1));
		expect(q.options).toHaveLength(4);
		expect(new Set(q.options).size).toBe(4);
		expect(q.options).toContain(IDS[5]);
	});

	it("only uses ids from the base", () => {
		const q = buildQuestion(IDS[0] ?? "", IDS, seededRng(7));
		for (const option of q.options) expect(IDS).toContain(option);
	});

	it("places the target at each of the 4 positions over many draws", () => {
		const rng = seededRng(2024);
		const positions = new Set<number>();
		for (let i = 0; i < 200; i++) {
			positions.add(buildQuestion(IDS[0] ?? "", IDS, rng).options.indexOf(IDS[0] ?? ""));
		}
		expect([...positions].sort()).toEqual([0, 1, 2, 3]);
	});

	it("draws distractors uniformly from the other expressions", () => {
		const rng = seededRng(99);
		const target = must(IDS[0]);
		const draws = 3000;
		const counts = new Map<string, number>();
		for (let i = 0; i < draws; i++) countDistractors(counts, target, rng);
		const expected = (draws * 3) / 16;
		for (const id of IDS.slice(1)) {
			expect(Math.abs((counts.get(id) ?? 0) - expected)).toBeLessThan(expected * 0.2);
		}
	});

	it("throws when the base has fewer than 4 expressions", () => {
		expect(() => buildQuestion("a", ["a", "b", "c"], seqRng([0]))).toThrow();
	});
});
