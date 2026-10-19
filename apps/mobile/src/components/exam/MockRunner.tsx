import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MockAttempt } from '@/features/exam/mockRunStore';
import { useMockRunStore } from '@/features/exam/mockRunStore';
import { scoreMock } from '@/features/exam/mockScoring';
import { remainingMs } from '@/features/exam/mockTimer';
import type { MockExam } from '@/features/exam/types';
import { useNow } from '@/features/exam/useNow';
import { playCue } from '@/lib/cues';
import { MockOptions } from './MockOptions';
import { MockQuestionCard } from './MockQuestionCard';
import { MockRunFooter } from './MockRunFooter';
import { MockRunHeader } from './MockRunHeader';
import { QuestionMapSheet } from './QuestionMapSheet';

type MockRunnerProps = {
  mock: MockExam;
  attempt: MockAttempt;
};

/**
 * A running mock: one question at a time, answers saved as they are chosen, flags, the map.
 * The clock counts from the start time; when it runs out the attempt is finished as it stands.
 * Finishing is the store's change only: the route then moves to the result.
 */
export function MockRunner({ mock, attempt }: MockRunnerProps) {
  const now = useNow();
  const select = useMockRunStore((s) => s.select);
  const toggleFlag = useMockRunStore((s) => s.toggleFlag);
  const goTo = useMockRunStore((s) => s.goTo);
  const finish = useMockRunStore((s) => s.finish);
  const [mapOpen, setMapOpen] = useState(false);

  const left = remainingMs(attempt.startedAt, mock.durationMinutes, now);
  const timeUp = left <= 0;
  const total = mock.questions.length;
  const index = Math.min(attempt.index, total - 1);
  const question = mock.questions[index];
  const group = mock.groups.find((g) => g.id === question?.groupId);

  const finishAttempt = (timedOut: boolean) =>
    finish(mock.id, Date.now(), scoreMock(mock, attempt.answers).percent, timedOut);

  useEffect(() => {
    if (timeUp) finish(mock.id, Date.now(), scoreMock(mock, attempt.answers).percent, true);
  }, [timeUp, finish, mock, attempt.answers]);

  if (!question) return null;

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-page">
      <MockRunHeader
        index={index}
        total={total}
        answered={Object.keys(attempt.answers).length}
        remainingMs={left}
        onExit={() => (router.canGoBack() ? router.back() : router.replace('/exam/mocks'))}
      />
      <ScrollView contentContainerClassName="gap-2.5 px-4 pb-4 pt-1">
        <MockQuestionCard
          question={question}
          number={index + 1}
          group={group?.short ?? ''}
          flagged={attempt.flagged.includes(question.id)}
          onToggleFlag={() => toggleFlag(mock.id, question.id)}
        />
        <MockOptions
          question={question}
          selected={attempt.answers[question.id]}
          onSelect={(key) => {
            playCue('tap');
            select(mock.id, question.id, key);
          }}
        />
      </ScrollView>
      <MockRunFooter
        canGoBack={index > 0}
        onPrev={() => goTo(mock.id, index - 1)}
        onMap={() => setMapOpen(true)}
        onNext={() => (index < total - 1 ? goTo(mock.id, index + 1) : setMapOpen(true))}
      />
      <QuestionMapSheet
        visible={mapOpen}
        questions={mock.questions}
        answers={attempt.answers}
        flagged={attempt.flagged}
        index={index}
        remainingMs={left}
        onJump={(n) => {
          goTo(mock.id, n);
          setMapOpen(false);
        }}
        onClose={() => setMapOpen(false)}
        onFinish={() => {
          setMapOpen(false);
          playCue('complete');
          finishAttempt(false);
        }}
      />
    </SafeAreaView>
  );
}
