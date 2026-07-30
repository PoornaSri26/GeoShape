import { browser } from '$app/environment';
import type { StateInfo, NeighborShape } from '$lib/ws.svelte';

const STORAGE_KEY = 'geoshape:missed_deck';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type MissedPlaceItem = {
	id: string; // `${categoryId}:${shapeId}`
	categoryId: number;
	shapeId: number;
	name: string;
	nameDe: string;
	path: string;
	viewBox: string;
	answers: string[];
	info?: StateInfo | null;
	capital?: [number, number] | null;
	context?: NeighborShape[] | null;
	revealPath?: string | null;

	timesMissed: number;
	timesReviewed: number;
	timesCorrect: number;
	stage: number; // 1..5
	intervalMin: number;
	easeFactor: number;
	nextReviewAt: number; // timestamp ms
	lastReviewedAt: number | null;
	lastMissedAt: number; // timestamp ms
	mastered: boolean;
};

const STAGE_INTERVALS: Record<number, number> = {
	1: 1, // 1 min
	2: 10, // 10 min
	3: 1440, // 1 day
	4: 4320, // 3 days
	5: 10080 // 7 days (Mastered)
};

export type AddMissedInput = {
	categoryId: number;
	shapeId: number;
	name: string;
	nameDe?: string;
	path: string;
	viewBox?: string;
	answers?: string[];
	info?: StateInfo | null;
	capital?: [number, number] | null;
	context?: NeighborShape[] | null;
	revealPath?: string | null;
};

class MissedDeckStore {
	items = $state<MissedPlaceItem[]>([]);

	constructor() {
		if (!browser) return;
		this.load();
	}

	private load(): void {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) {
					this.items = parsed.map((item) => ({
						...item,
						nameDe: item.nameDe ?? item.name,
						answers: item.answers ?? [item.name],
						viewBox: item.viewBox ?? '0 0 1000 1000',
						stage: item.stage ?? 1,
						intervalMin: item.intervalMin ?? 1,
						easeFactor: item.easeFactor ?? 2.5,
						timesMissed: item.timesMissed ?? 1,
						timesReviewed: item.timesReviewed ?? 0,
						timesCorrect: item.timesCorrect ?? 0,
						nextReviewAt: item.nextReviewAt ?? Date.now(),
						lastReviewedAt: item.lastReviewedAt ?? null,
						lastMissedAt: item.lastMissedAt ?? Date.now(),
						mastered: !!item.mastered
					}));
				}
			}
		} catch (e) {
			console.error('Failed to load missed deck store:', e);
		}
	}

	private persist(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
		} catch (e) {
			console.error('Failed to persist missed deck store:', e);
		}
	}

	get totalCount(): number {
		return this.items.length;
	}

	get dueItems(): MissedPlaceItem[] {
		const now = Date.now();
		return this.items.filter((item) => !item.mastered && item.nextReviewAt <= now);
	}

	get dueCount(): number {
		return this.dueItems.length;
	}

	get masteredCount(): number {
		return this.items.filter((item) => item.mastered).length;
	}

	get learningCount(): number {
		return this.items.filter((item) => !item.mastered).length;
	}

	/**
	 * Returns map of shapeId -> MissedPlaceItem for a given category.
	 */
	getCategoryItems(categoryId: number): Record<number, MissedPlaceItem> {
		const result: Record<number, MissedPlaceItem> = {};
		for (const item of this.items) {
			if (item.categoryId === categoryId) {
				result[item.shapeId] = item;
			}
		}
		return result;
	}

	/**
	 * Returns true if shape is currently in deck.
	 */
	has(categoryId: number, shapeId: number): boolean {
		const id = `${categoryId}:${shapeId}`;
		return this.items.some((i) => i.id === id);
	}

	/**
	 * Add or update a missed place (e.g. after failing a round in game).
	 */
	addMissed(input: AddMissedInput): MissedPlaceItem {
		const id = `${input.categoryId}:${input.shapeId}`;
		const existingIndex = this.items.findIndex((i) => i.id === id);
		const now = Date.now();

		if (existingIndex >= 0) {
			const existing = this.items[existingIndex];
			const updated: MissedPlaceItem = {
				...existing,
				path: input.path || existing.path,
				viewBox: input.viewBox || existing.viewBox,
				answers: input.answers?.length ? input.answers : existing.answers,
				info: input.info ?? existing.info,
				capital: input.capital ?? existing.capital,
				context: input.context ?? existing.context,
				revealPath: input.revealPath ?? existing.revealPath,
				timesMissed: existing.timesMissed + 1,
				stage: 1, // reset stage to learning on new miss
				intervalMin: 1,
				nextReviewAt: now, // due immediately
				lastMissedAt: now,
				mastered: false
			};
			this.items[existingIndex] = updated;
			this.persist();
			return updated;
		} else {
			const newItem: MissedPlaceItem = {
				id,
				categoryId: input.categoryId,
				shapeId: input.shapeId,
				name: input.name,
				nameDe: input.nameDe ?? input.name,
				path: input.path,
				viewBox: input.viewBox ?? '0 0 1000 1000',
				answers: input.answers ?? [input.name],
				info: input.info ?? null,
				capital: input.capital ?? null,
				context: input.context ?? null,
				revealPath: input.revealPath ?? null,

				timesMissed: 1,
				timesReviewed: 0,
				timesCorrect: 0,
				stage: 1,
				intervalMin: 1,
				easeFactor: 2.5,
				nextReviewAt: now,
				lastReviewedAt: null,
				lastMissedAt: now,
				mastered: false
			};
			this.items.push(newItem);
			this.persist();
			return newItem;
		}
	}

	/**
	 * Process SRS review outcome.
	 */
	recordReview(id: string, rating: Rating): void {
		const index = this.items.findIndex((i) => i.id === id);
		if (index < 0) return;

		const item = this.items[index];
		const now = Date.now();

		let stage = item.stage;
		let intervalMin = item.intervalMin;
		let timesCorrect = item.timesCorrect;
		let timesMissed = item.timesMissed;
		let mastered = item.mastered;

		if (rating === 'again') {
			stage = 1;
			intervalMin = 1;
			timesMissed += 1;
			mastered = false;
		} else if (rating === 'hard') {
			intervalMin = Math.max(1, Math.round(intervalMin * 1.3));
		} else if (rating === 'good') {
			stage = Math.min(5, stage + 1);
			intervalMin = STAGE_INTERVALS[stage] ?? 1440;
			timesCorrect += 1;
			mastered = stage >= 5;
		} else if (rating === 'easy') {
			stage = Math.min(5, stage + 2);
			intervalMin = STAGE_INTERVALS[stage] ?? 4320;
			timesCorrect += 1;
			mastered = stage >= 4;
		}

		const nextReviewAt = now + intervalMin * 60 * 1000;

		this.items[index] = {
			...item,
			stage,
			intervalMin,
			timesReviewed: item.timesReviewed + 1,
			timesCorrect,
			timesMissed,
			nextReviewAt,
			lastReviewedAt: now,
			mastered
		};
		this.persist();
	}

	/**
	 * Remove a place from deck.
	 */
	remove(id: string): void {
		this.items = this.items.filter((i) => i.id !== id);
		this.persist();
	}

	/**
	 * Reset an item's SRS progress.
	 */
	resetItem(id: string): void {
		const index = this.items.findIndex((i) => i.id === id);
		if (index < 0) return;
		this.items[index] = {
			...this.items[index],
			stage: 1,
			intervalMin: 1,
			nextReviewAt: Date.now(),
			mastered: false
		};
		this.persist();
	}

	/**
	 * Remove all mastered items.
	 */
	clearMastered(): void {
		this.items = this.items.filter((i) => !i.mastered);
		this.persist();
	}

	/**
	 * Clear all items in deck.
	 */
	clearAll(): void {
		this.items = [];
		this.persist();
	}
}

export const missedDeck = new MissedDeckStore();
