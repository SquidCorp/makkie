import type { KeyValueStorage } from "../lib/types";

/** localStorage when available; in-memory fallback (private mode, storage disabled). */
export function browserStorage(): KeyValueStorage {
	try {
		const probe = "__makkie_probe__";
		window.localStorage.setItem(probe, probe);
		window.localStorage.removeItem(probe);
		return window.localStorage;
	} catch {
		const memory = new Map<string, string>();
		return {
			getItem: (key) => memory.get(key) ?? null,
			setItem: (key, value) => {
				memory.set(key, value);
			},
		};
	}
}
