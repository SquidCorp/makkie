import { describe, expect, it } from "vitest";
import { classify, intervalMs } from "../src/lib/schedule";
import { NOW, at } from "./helpers";

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString();

describe("intervalMs", () => {
	it("follows the spec table and caps at 14 days", () => {
		expect(intervalMs(0)).toBe(0);
		expect(intervalMs(1)).toBe(1 * DAY);
		expect(intervalMs(2)).toBe(3 * DAY);
		expect(intervalMs(3)).toBe(7 * DAY);
		expect(intervalMs(4)).toBe(14 * DAY);
		expect(intervalMs(9)).toBe(14 * DAY);
	});
});

describe("classify", () => {
	it("is new when never presented", () => {
		expect(classify({ presented_at: null, last_correct_at: null, correct_count: 0 }, NOW)).toBe(
			"new",
		);
	});

	it("is failed when presented but never correct", () => {
		const p = { presented_at: iso(NOW), last_correct_at: null, correct_count: 0 };
		expect(classify(p, at(1))).toBe("failed");
	});

	it("is failed when the last attempt was wrong", () => {
		const p = {
			presented_at: iso(at(2)),
			last_correct_at: iso(NOW),
			correct_count: 1,
		};
		expect(classify(p, at(2))).toBe("failed");
	});

	it("is later right after a correct answer", () => {
		const p = { presented_at: iso(NOW), last_correct_at: iso(NOW), correct_count: 1 };
		expect(classify(p, NOW)).toBe("later");
	});

	it("is due once the interval has elapsed", () => {
		const p = { presented_at: iso(NOW), last_correct_at: iso(NOW), correct_count: 1 };
		expect(classify(p, at(0.99))).toBe("later");
		expect(classify(p, at(1))).toBe("due");
	});

	it("uses 14 days for correct_count 4+", () => {
		const p = { presented_at: iso(NOW), last_correct_at: iso(NOW), correct_count: 5 };
		expect(classify(p, at(13))).toBe("later");
		expect(classify(p, at(14))).toBe("due");
	});
});
