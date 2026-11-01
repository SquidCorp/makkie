import { createState } from "../src/lib/state";
import type { KeyValueStorage, Rng, StoreState } from "../src/lib/types";

export const IDS = Array.from({ length: 17 }, (_, i) => `expr-${String(i + 1).padStart(2, "0")}`);

export const NOW = new Date("2025-03-14T10:00:00.000Z");

export function at(offsetDays: number, hours = 0): Date {
	return new Date(NOW.getTime() + offsetDays * 86_400_000 + hours * 3_600_000);
}

/** Deterministic RNG cycling through the given values. */
export function seqRng(values: number[]): Rng {
	let i = 0;
	return () => {
		const v = values[i % values.length] ?? 0;
		i++;
		return v;
	};
}

export function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & {
	data: Map<string, string>;
} {
	const data = new Map(Object.entries(initial));
	return {
		data,
		getItem: (key) => data.get(key) ?? null,
		setItem: (key, value) => {
			data.set(key, value);
		},
	};
}

export function freshState(now: Date = NOW): StoreState {
	return createState(IDS, now, "11111111-1111-4111-8111-111111111111");
}

/** Seeded PRNG (mulberry32): reproducible pseudo-random sequence for statistical tests. */
export function seededRng(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Unwraps a value that the test guarantees to exist. */
export function must<T>(value: T | null | undefined): T {
	if (value === undefined || value === null) throw new Error("expected a value");
	return value;
}
