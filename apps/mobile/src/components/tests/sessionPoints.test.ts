import { demoStudyTest } from '@/features/study/demo';
import { POINTS_PER_CORRECT } from '@/features/study/rewards';
import { sessionPoints } from './sessionPoints';

describe('sessionPoints', () => {
  const { steps } = demoStudyTest;
  const answers = { 'demo-q1': 'C', 'demo-q2': 'A', 'demo-q3': '28' };

  it('counts only the right answers that were checked', () => {
    expect(sessionPoints(steps, answers, 0, false)).toBe(0);
    expect(sessionPoints(steps, answers, 0, true)).toBe(POINTS_PER_CORRECT);
    expect(sessionPoints(steps, answers, 1, true)).toBe(POINTS_PER_CORRECT);
    expect(sessionPoints(steps, answers, 2, true)).toBe(2 * POINTS_PER_CORRECT);
  });

  it('ignores an answer chosen but not checked yet', () => {
    expect(sessionPoints(steps, answers, 2, false)).toBe(POINTS_PER_CORRECT);
  });
});
