import type { TestResult } from '@mytutor/types';
import { answeredPerDay, chartMax, goalDays, weekAccuracy } from './weekStats';

const result = (finishedAt: string, answered: number, correct: number): TestResult => ({
  testId: 't',
  subjectId: 's',
  title: 'Test',
  correct,
  total: answered,
  answers: Object.fromEntries(Array.from({ length: answered }, (_, i) => [`q${i}`, 'A'])),
  finishedAt,
});

// Thursday, 15 October 2026.
const now = new Date(2026, 9, 15, 18, 0);

describe('week stats', () => {
  const results = [
    result(new Date(2026, 9, 12, 9).toISOString(), 10, 8), // Monday
    result(new Date(2026, 9, 15, 8).toISOString(), 5, 5), // Thursday
    result(new Date(2026, 9, 15, 17).toISOString(), 6, 3), // Thursday
    result(new Date(2026, 9, 9, 17).toISOString(), 20, 20), // last Friday: not this week
  ];

  it('counts answered questions per day, Monday first', () => {
    expect(answeredPerDay(results, now)).toEqual([10, 0, 0, 11, 0, 0, 0]);
  });

  it('computes this week accuracy only', () => {
    expect(weekAccuracy(results, now)).toEqual({ answered: 21, correct: 16, percent: 76 });
    expect(weekAccuracy([], now).percent).toBeNull();
  });

  it('counts goal days and scales the chart above the goal', () => {
    expect(goalDays([10, 0, 0, 11, 0, 0, 0], 10)).toBe(2);
    expect(chartMax([10, 0, 0, 11, 0, 0, 0], 10)).toBe(15);
    expect(chartMax([30, 0, 0, 0, 0, 0, 0], 10)).toBe(30);
  });
});
