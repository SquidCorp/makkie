import { EXPRESSIONS, type Expression } from "../data/expressions";
import { type Feedback, buildFeedback } from "../lib/feedback";
import { countMastered, countToReview, sessionAccuracy } from "../lib/metrics";
import { uuidV4 } from "../lib/random";
import { QUESTIONS_PER_SESSION } from "../lib/schedule";
import type { Question } from "../lib/selection";
import { type SessionCursor, advanceCursor, emptyCursor, nextQuestion } from "../lib/session";
import {
	closeAbandonedSessions,
	latestSession,
	loadState,
	recordAnswer,
	saveState,
	startSession,
} from "../lib/state";
import type { KeyValueStorage, StoreState } from "../lib/types";
import { browserStorage } from "./browser-storage";

const IDS = EXPRESSIONS.map((e) => e.id);
const BY_ID = new Map<string, Expression>(EXPRESSIONS.map((e) => [e.id, e]));

type Screen = "home" | "question" | "end";

interface Controller {
	storage: KeyValueStorage;
	state: StoreState;
	cursor: SessionCursor;
	question: Question | null;
	answered: boolean;
}

function el<T extends HTMLElement = HTMLElement>(id: string): T {
	const node = document.getElementById(id);
	if (node === null) throw new Error(`Missing element #${id}`);
	return node as T;
}

function expressionOf(id: string): Expression {
	const expression = BY_ID.get(id);
	if (expression === undefined) throw new Error(`Unknown expression ${id}`);
	return expression;
}

function showScreen(screen: Screen): void {
	el("screen-home").hidden = screen !== "home";
	el("screen-question").hidden = screen !== "question";
	el("screen-end").hidden = screen !== "end";
}

function renderHome(state: StoreState): void {
	const now = new Date();
	const mastered = countMastered(state, IDS, now);
	const toReview = countToReview(state, IDS, now);
	el("home-stats").textContent =
		`Maîtrisées : ${mastered} / ${IDS.length} · À réviser : ${toReview}`;
}

function answeredInSession(state: StoreState): number {
	return latestSession(state)?.questions_answered ?? 0;
}

function optionButton(ctl: Controller, id: string, index: number): HTMLButtonElement {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "option";
	button.dataset.id = id;
	const letter = document.createElement("span");
	letter.className = "option-letter";
	letter.textContent = String.fromCharCode(65 + index);
	const label = document.createElement("span");
	label.textContent = expressionOf(id).nl;
	button.append(letter, label);
	button.addEventListener("click", () => answer(ctl, id));
	return button;
}

function renderQuestion(ctl: Controller, question: Question): void {
	const position = answeredInSession(ctl.state) + 1;
	el("q-progress").textContent = `Question ${position} / ${QUESTIONS_PER_SESSION}`;
	el("q-situation").textContent = expressionOf(question.target).situation;
	el("q-feedback").hidden = true;
	el("q-options").replaceChildren(...question.options.map((id, i) => optionButton(ctl, id, i)));
	showScreen("question");
}

function markOptions(target: string, chosen: string): void {
	for (const button of el("q-options").querySelectorAll<HTMLButtonElement>("button")) {
		button.disabled = true;
		if (button.dataset.id === target) button.classList.add("correct");
		else if (button.dataset.id === chosen) button.classList.add("wrong");
	}
}

function showFeedback(ctl: Controller, feedback: Feedback): void {
	const title = el("f-title");
	title.textContent = feedback.title;
	title.className = feedback.correct ? "fb-title ok" : "fb-title ko";
	el("f-text").textContent = feedback.detail;
	el("q-feedback").hidden = false;
	const last = answeredInSession(ctl.state) >= QUESTIONS_PER_SESSION;
	el("next-btn").textContent = last ? "Voir le score" : "Question suivante";
}

function answer(ctl: Controller, chosen: string): void {
	const question = ctl.question;
	if (question === null || ctl.answered) return;
	ctl.answered = true;
	const correct = chosen === question.target;
	// Cursor first: it reads the pre-answer state to know whether the target was new.
	ctl.cursor = advanceCursor(ctl.cursor, ctl.state, question.target);
	ctl.state = recordAnswer(ctl.state, question.target, correct, new Date());
	saveState(ctl.storage, ctl.state);
	markOptions(question.target, chosen);
	showFeedback(ctl, buildFeedback(expressionOf(question.target), correct));
}

function endSession(ctl: Controller): void {
	const session = latestSession(ctl.state);
	const accuracy = session ? sessionAccuracy(session) : null;
	const pct = accuracy === null ? "" : ` (${Math.round(accuracy * 100)} %)`;
	el("end-score").textContent =
		`Score : ${session?.correct_count ?? 0} / ${session?.questions_answered ?? 0}${pct}.`;
	showScreen("end");
}

function drawQuestion(ctl: Controller): void {
	ctl.answered = false;
	ctl.question = nextQuestion(ctl.state, IDS, ctl.cursor, new Date(), Math.random);
	if (ctl.question === null) {
		endSession(ctl);
		return;
	}
	renderQuestion(ctl, ctl.question);
}

function startNewSession(ctl: Controller): void {
	ctl.state = startSession(ctl.state, new Date());
	saveState(ctl.storage, ctl.state);
	ctl.cursor = emptyCursor();
	drawQuestion(ctl);
}

function goNext(ctl: Controller): void {
	if (answeredInSession(ctl.state) >= QUESTIONS_PER_SESSION) {
		endSession(ctl);
		return;
	}
	drawQuestion(ctl);
}

export function initSessionPage(): void {
	const storage = browserStorage();
	const state = closeAbandonedSessions(loadState(storage, IDS, new Date(), uuidV4));
	saveState(storage, state);
	const ctl: Controller = {
		storage,
		state,
		cursor: emptyCursor(),
		question: null,
		answered: false,
	};
	renderHome(state);
	showScreen("home");
	el("start-btn").addEventListener("click", () => startNewSession(ctl));
	el("next-btn").addEventListener("click", () => goNext(ctl));
	el("end-home-btn").addEventListener("click", () => {
		renderHome(ctl.state);
		showScreen("home");
	});
}
