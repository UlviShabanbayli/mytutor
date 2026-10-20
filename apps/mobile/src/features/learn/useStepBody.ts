import type { TopicStep } from './types';
import { useLearnText } from './useLearnText';

/** The line under a step's name; the test's comes from the topic test it opens. */
export function useStepBody() {
  const { t } = useLearnText();
  return (
    step: TopicStep,
    test: { test: { questionCount: number } | null; isPending: boolean },
  ) => {
    const n = { done: step.done ?? 0, total: step.total ?? 0, minutes: step.minutes ?? 0 };
    switch (step.kind) {
      case 'lesson':
        return t('learn.step.lessonBody', n);
      case 'examples':
        return t(
          step.state === 'current' ? 'learn.step.examplesBodyCurrent' : 'learn.step.examplesBody',
          n,
        );
      case 'practice':
        return t(
          step.state === 'current' ? 'learn.step.practiceBodyCurrent' : 'learn.step.practiceBody',
          n,
        );
      case 'test':
        if (test.test) return t('learn.step.testBody', { count: test.test.questionCount });
        return t(test.isPending ? 'learn.step.testLoading' : 'learn.step.testPreparing');
    }
  };
}
