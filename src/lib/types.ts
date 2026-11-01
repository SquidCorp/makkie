export interface ExpressionProgress {
	presented_at: string | null;
	last_correct_at: string | null;
	correct_count: number;
}

export interface SessionRecord {
	started_at: string;
	ended_at: string | null;
	questions_answered: number;
	correct_count: number;
}

export interface StoreState {
	anonymous_id: string;
	first_seen_at: string;
	last_seen_at: string;
	sessions: SessionRecord[];
	expressions: Record<string, ExpressionProgress>;
}

export interface KeyValueStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

/** Random number generator returning values in [0, 1). Injected for deterministic tests. */
export type Rng = () => number;
