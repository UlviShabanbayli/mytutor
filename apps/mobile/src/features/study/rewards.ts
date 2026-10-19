import type { CellState } from '@/components/ui';

// Demo rules of the motivation layer and mastery levels until packages/learning exists
// (architecture "Öyrənmə modeli", P2): they only decide what the screens show.

/** "+10 bal" for each right answer; nothing is ever taken away for a wrong one. */
export const POINTS_PER_CORRECT = 10;

/** A topic test at or above this share fills the cell with honey (Mənimsənilib). */
export const MASTERY_PERCENT = 80;

/** The topic's cell after its test: honey when passed, still nectar (learning) when not. */
export const cellAfterTest = (scorePercent: number): CellState =>
  scorePercent >= MASTERY_PERCENT ? 'mastered' : 'lesson_completed';

/** First review of a newly mastered topic, in days (spaced review 2 → 7 → 21). */
export const FIRST_REVIEW_DAYS = 2;

/** "+5 bal" for an exercise answered like the book. */
export const EXERCISE_POINTS = 5;
