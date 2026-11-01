import type { Rng } from "./types";

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[result[i], result[j]] = [result[j] as T, result[i] as T];
	}
	return result;
}

export function sample<T>(items: readonly T[], count: number, rng: Rng): T[] {
	return shuffle(items, rng).slice(0, count);
}

export function pickOne<T>(items: readonly T[], rng: Rng): T | undefined {
	return items[Math.floor(rng() * items.length)];
}

export function uuidV4(bytes: Uint8Array = crypto.getRandomValues(new Uint8Array(16))): string {
	const b = bytes;
	b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
	b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
	const hex = Array.from(b, (byte) => byte.toString(16).padStart(2, "0")).join("");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
