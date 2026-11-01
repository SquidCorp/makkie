import type { Expression } from "../data/expressions";

export interface Feedback {
	correct: boolean;
	title: string;
	detail: string;
}

/** Feedback after an answer: short confirmation + meaning, or correct answer + pitfall. */
export function buildFeedback(expression: Expression, correct: boolean): Feedback {
	if (correct) {
		return {
			correct,
			title: "Juste !",
			detail: `${expression.nl} : ${expression.sens}.`,
		};
	}
	return {
		correct,
		title: "Pas celle-là.",
		detail: `La bonne réponse : ${expression.nl} (litt. « ${expression.literal} »). Piège : ${expression.piege}.`,
	};
}
