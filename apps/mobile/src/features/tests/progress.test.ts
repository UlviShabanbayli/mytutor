import type { TestResult } from '@mytutor/types';
import { answerTotals, streakDays, todayIndex, weekActivity } from './progress';

/** A finished test on a given local day; two answers, one correct. */
const finished = (year: number, month: number, day: number): TestResult => ({
  testId: 't',
  subjectId: 's',
  title: 'Test',
  correct: 1,
  total: 2,
  answers: { q1: 'A', q2: 'B' },
  finishedAt: new Date(year, month, day, 12).toISOString(),
});

// Wednesday, 15 October 2025.
const now = new Date(2025, 9, 15, 18);

describe('streakDays', () => {
  it('counts days in a row up to today', () => {
    expect(
      streakDays([finished(2025, 9, 15), finished(2025, 9, 14), finished(2025, 9, 13)], now),
    ).toBe(3);
  });

  it('keeps a streak that ended yesterday, and breaks on a missed day', () => {
    expect(streakDays([finished(2025, 9, 14), finished(2025, 9, 13)], now)).toBe(2);
    expect(streakDays([finished(2025, 9, 15), finished(2025, 9, 13)], now)).toBe(1);
    expect(streakDays([finished(2025, 9, 12)], now)).toBe(0);
  });
});

describe('weekActivity', () => {
  it('marks the days of this week (Monday first) with a finished test', () => {
    const week = weekActivity(
      [finished(2025, 9, 13), finished(2025, 9, 15), finished(2025, 9, 9)],
      now,
    );
    expect(week).toEqual([true, false, true, false, false, false, false]);
    expect(todayIndex(now)).toBe(2);
  });
});

describe('answerTotals', () => {
  it('sums answered and correct questions', () => {
    expect(answerTotals([finished(2025, 9, 15), finished(2025, 9, 14)])).toEqual({
      answered: 4,
      correct: 2,
    });
  });
});
