import type { PracticeTest, TestAnswers } from '@mytutor/types';
import { isCorrect } from './answers';

export type ScoreTier = 'excellent' | 'good' | 'practice';

export function countCorrect(test: PracticeTest, answers: TestAnswers): number {
  return test.questions.filter((q) => isCorrect(q, answers[q.id])).length;
}

/** Percentage 0–100, rounded. */
export function percent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function scoreTier(scorePercent: number): ScoreTier {
  if (scorePercent >= 85) return 'excellent';
  if (scorePercent >= 60) return 'good';
  return 'practice';
}
