import { POINTS_PER_CORRECT } from '@/features/study/rewards';
import { stepVerdict } from '@/features/study/steps';
import type { SessionStep } from '@/features/study/types';

/**
 * Points earned so far in this run, for the header counter (feedback.points C): the right
 * answers among the checked steps, at the same rate the result screen counts them.
 */
export function sessionPoints(
  steps: SessionStep[],
  answers: Record<string, string>,
  index: number,
  checked: boolean,
): number {
  const done = steps.slice(0, checked ? index + 1 : index);
  const right = done.filter((step) => stepVerdict(step, answers[step.id]) === 'correct');
  return right.length * POINTS_PER_CORRECT;
}
