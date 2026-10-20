import type { PracticeTest } from '@mytutor/types';
import { isCorrect } from '@/features/tests/answers';
import { isMatchComplete, isMatchCorrect } from './matching';
import { POINTS_PER_CORRECT } from './rewards';
import type { SessionStep, StepVerdict, StudyTest } from './types';

/**
 * A practice test outside the demo world (a published test, the mistakes run) as a session: one
 * step per question, worth the points of its right answers.
 */
export function studyTestOf(test: PracticeTest): StudyTest {
  return {
    test,
    steps: test.questions.map((question) => ({ kind: 'question', id: question.id, question })),
    kind: 'topic',
    topicCode: null,
    points: test.questions.length * POINTS_PER_CORRECT,
  };
}

/** A written step's answer: how many photos were sent ("photos:2"). */
export const writtenAnswer = (sent: number) => `photos:${sent}`;
const sentPhotos = (answer: string | undefined) => Number(answer?.split(':')[1] ?? 0) || 0;

/** Whether "Yoxla" can be pressed: an option, a number, every pair, or one sent photo. */
export function isAnswered(step: SessionStep, answer: string | undefined): boolean {
  if (step.kind === 'match') return isMatchComplete(step, answer);
  if (step.kind === 'written') return sentPhotos(answer) > 0;
  return Boolean(answer?.trim());
}

/** Right or wrong; a written solution waits for the teacher. */
export function stepVerdict(step: SessionStep, answer: string | undefined): StepVerdict {
  if (step.kind === 'written') return 'pending';
  const right =
    step.kind === 'match' ? isMatchCorrect(step, answer) : isCorrect(step.question, answer);
  return right ? 'correct' : 'wrong';
}

/** Right answers over the steps the app can check itself (written ones are the teacher's). */
export function scoreSteps(
  steps: SessionStep[],
  answers: Record<string, string>,
): { correct: number; scored: number; pending: number } {
  return steps.reduce(
    (sum, step) => {
      const verdict = stepVerdict(step, answers[step.id]);
      if (verdict === 'pending') return { ...sum, pending: sum.pending + 1 };
      return {
        ...sum,
        scored: sum.scored + 1,
        correct: sum.correct + (verdict === 'correct' ? 1 : 0),
      };
    },
    { correct: 0, scored: 0, pending: 0 },
  );
}
