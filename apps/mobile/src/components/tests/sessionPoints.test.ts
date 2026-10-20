import { answerDemo } from '@mytutor/demo-data';
import { studyTestSchema } from '@mytutor/schemas';
import { POINTS_PER_CORRECT } from '@/features/study/rewards';
import { sessionPoints } from './sessionPoints';

describe('sessionPoints', () => {
  const { steps } = studyTestSchema.parse(
    answerDemo('/v1/tests/test-riyaziyyat-7-4-3', {
      persona: 'nermin',
      now: new Date('2026-10-20T06:00:00.000Z'),
    }).body,
  );
  const answers = { 'q-4-3-1': 'C', 'q-4-3-2': 'A', 'q-4-3-3': '28' };

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
