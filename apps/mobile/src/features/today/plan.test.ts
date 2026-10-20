import type { Topic } from '@mytutor/types';
import { planSummary, stepHref, withRecommendedTest } from './plan';
import type { PlanStep } from './types';

const step = (minutes: number | null): PlanStep => ({
  id: `s${minutes ?? 'x'}`,
  kind: 'lesson',
  targetId: 'l1',
  code: '4.3',
  cell: 'lesson_completed',
  title: 'Cəmin və fərqin kubu',
  reason: { kind: 'unfinished', stepsLeft: 2 },
  minutes,
  questionCount: null,
  points: 15,
});

const topic: Topic = {
  id: 't_1',
  subjectId: 'riyaziyyat',
  title: 'Natural ədədlər',
  grade: null,
  questionCount: 27,
};

describe('planSummary', () => {
  it('adds up minutes when every step has them', () => {
    expect(planSummary([step(4), step(8), step(5)])).toEqual({ count: 3, minutes: 17 });
  });

  it('gives no total when a step has no estimate', () => {
    expect(planSummary([step(4), step(null)])).toEqual({ count: 2, minutes: null });
  });
});

describe('stepHref', () => {
  it('leads each kind straight to its screen', () => {
    expect(stepHref('review', 'x')).toBe('/review');
    expect(stepHref('mock', 'x')).toBe('/exam/mocks');
    expect(stepHref('lesson', 'riyaziyyat-7-4-3')).toEqual({
      pathname: '/lesson/[id]',
      params: { id: 'riyaziyyat-7-4-3' },
    });
    expect(stepHref('assignment', 'a1')).toEqual({
      pathname: '/assignment/[id]',
      params: { id: 'a1' },
    });
  });
});

describe('withRecommendedTest', () => {
  it('appends the recommended test as a practice step', () => {
    const plan = withRecommendedTest([step(4)], topic);
    expect(plan).toHaveLength(2);
    expect(plan[1]).toMatchObject({
      kind: 'test',
      targetId: 't_1',
      code: null,
      minutes: null,
      questionCount: 27,
      reason: { kind: 'questions', count: 27 },
    });
  });

  it('keeps the plan as is without a recommendation or questions', () => {
    expect(withRecommendedTest([step(4)], null)).toHaveLength(1);
    expect(withRecommendedTest([step(4)], { ...topic, questionCount: 0 })).toHaveLength(1);
  });
});
