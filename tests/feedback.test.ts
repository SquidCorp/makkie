import { describe, expect, it } from "vitest";
import { EXPRESSIONS } from "../src/data/expressions";
import { buildFeedback } from "../src/lib/feedback";
import { must } from "./helpers";

const first = must(EXPRESSIONS[0]);

describe("buildFeedback", () => {
	it("confirms a correct answer with the meaning", () => {
		const f = buildFeedback(first, true);
		expect(f.correct).toBe(true);
		expect(f.title).toBe("Juste !");
		expect(f.detail).toContain(first.nl);
		expect(f.detail).toContain(first.sens);
	});

	it("reveals the right answer and the pitfall on a wrong answer", () => {
		const f = buildFeedback(first, false);
		expect(f.correct).toBe(false);
		expect(f.detail).toContain(first.nl);
		expect(f.detail).toContain(first.piege);
	});
});
