import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { leaveTo } from '@/features/study/leave';
import { isAnswered, stepVerdict } from '@/features/study/steps';
import { useStudyStore } from '@/features/study/studyStore';
import type { StudyTest } from '@/features/study/types';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { TestMathContext } from '@/features/tests/testMath';
import { playCue } from '@/lib/cues';
import { FeedbackPanel } from './FeedbackPanel';
import { StepBody } from './StepBody';
import { TestExitDialog } from './TestExitDialog';
import { TestSessionHeader } from './TestSessionHeader';

type TestSessionProps = {
  study: StudyTest;
  /** "Mövzu testi · 4.3". */
  kind: string;
};

/**
 * One question at a time: answer → "Yoxla" → feedback (right, calm wrong with the right
 * answer and the source, or sent to the teacher) → next. Leaving keeps the run for later.
 */
export function TestSession({ study, kind }: TestSessionProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { test, steps } = study;
  const { session, start, restart, select, check, next, finish } = useTestSessionStore();
  const startTest = useStudyStore((s) => s.startTest);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const resumed = useTestSessionStore.getState().session?.testId === test.id;
    start(test.id);
    startTest(test.id, !resumed);
  }, [start, startTest, test.id]);

  const active = session?.testId === test.id ? session : null;
  const step = active ? steps[active.index] : undefined;
  // A run saved for an older version of the same test (fewer steps now) starts over.
  useEffect(() => {
    if (active && !step) restart(test.id);
  }, [active, step, restart, test.id]);
  if (!active || !step) return null;

  const answer = active.answers[step.id];
  const verdict = stepVerdict(step, answer);
  const isLast = active.index === steps.length - 1;
  const answeredCount = Object.keys(active.answers).length;

  const onCheck = () => {
    check();
    playCue(verdict === 'correct' ? 'correct' : verdict === 'wrong' ? 'wrong' : 'tap');
  };
  const onContinue = () => {
    if (!isLast) return next();
    finish(test);
    router.replace({ pathname: '/test/[id]/result', params: { id: test.id } });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <TestSessionHeader
        kind={kind}
        index={active.index}
        total={steps.length}
        onClose={() => (answeredCount > 0 ? setExiting(true) : leaveTo('/learn'))}
      />
      <TestMathContext.Provider value={test.math}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-4 pb-5 pt-3">
          <StepBody
            key={step.id}
            step={step}
            answer={answer}
            checked={active.checked}
            onAnswer={(value) => select(step.id, value)}
            onSubmit={() => {
              if (isAnswered(step, answer) && !active.checked) onCheck();
            }}
          />
        </ScrollView>
        {active.checked ? (
          <FeedbackPanel
            step={step}
            answer={answer}
            verdict={verdict}
            isLast={isLast}
            onContinue={onContinue}
          />
        ) : (
          // The home indicator inset is device-specific, so it cannot be a static class.
          <View className="px-4 pt-2.5" style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}>
            <Button
              label={step.kind === 'written' ? t('study.test.send') : t('study.common.check')}
              icon={step.kind === 'written' ? 'send' : undefined}
              disabled={!isAnswered(step, answer)}
              onPress={onCheck}
            />
          </View>
        )}
      </TestMathContext.Provider>
      <TestExitDialog
        visible={exiting}
        answered={answeredCount}
        position={active.index + 1}
        total={steps.length}
        onStay={() => setExiting(false)}
        onLeave={() => {
          setExiting(false);
          leaveTo('/learn');
        }}
      />
    </SafeAreaView>
  );
}
