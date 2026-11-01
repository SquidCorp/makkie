import { EXPRESSIONS } from "../data/expressions";
import { summarize } from "../lib/metrics";
import { uuidV4 } from "../lib/random";
import { loadState, saveState } from "../lib/state";
import { browserStorage } from "./browser-storage";

const IDS = EXPRESSIONS.map((e) => e.id);

function setMetric(name: string, value: string): void {
	const node = document.querySelector<HTMLElement>(`[data-metric="${name}"]`);
	if (node !== null) node.textContent = value;
}

export function initJeuxPage(): void {
	const storage = browserStorage();
	const now = new Date();
	const state = loadState(storage, IDS, now, uuidV4);
	saveState(storage, state);
	const summary = summarize(state, IDS, now);
	setMetric("mastered", `${summary.mastered} / ${summary.total}`);
	setMetric("to-review", String(summary.toReview));
	setMetric("sessions", String(summary.completeSessions));
}
