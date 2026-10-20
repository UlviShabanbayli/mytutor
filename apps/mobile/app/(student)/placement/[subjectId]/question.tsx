import { useLocalSearchParams } from 'expo-router';
import { HivePreparing } from '@/components/learn/HivePreparing';
import { PlacementQuestionView } from '@/components/learn/PlacementQuestionView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { answerPlacement } from '@/features/learn/navigation';
import { placementStep } from '@/features/learn/placement';
import { useHive, usePlacementQuestions } from '@/features/learn/queries';
import { usePlacementSession } from '@/features/learn/store';
import type { PlacementAnswer } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

const NO_ANSWERS: PlacementAnswer[] = [];

/** "Bilirəm, yoxla": the adaptive check, one question at a time. */
export default function PlacementQuestionScreen() {
  const { t } = useLearnText();
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const view = useHive(subjectId);
  const hiveId = view.status === 'ready' ? view.hive.id : subjectId;
  const questions = usePlacementQuestions();
  // A session of another hive (or none, after a reload) starts this one from the beginning.
  const session = usePlacementSession((s) => (s.hiveId === hiveId ? s.answers : NO_ANSWERS));

  if (view.status === 'pending' || questions.isPending)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (view.status === 'preparing') return <HivePreparing subject={view.subject} />;
  if (view.status === 'error' || questions.isError)
    return (
      <Screen>
        <ScreenHeader title="" />
        <ErrorState
          onRetry={view.status === 'error' ? view.retry : () => void questions.refetch()}
        />
      </Screen>
    );
  if (questions.data.length === 0)
    return (
      <Screen>
        <ScreenHeader title="" />
        <EmptyState title={t('learn.placement.noQuestions')} />
      </Screen>
    );
  const { hive } = view;
  // A finished check opened again starts over.
  const answers = placementStep(hive, questions.data, session).next ? session : NO_ANSWERS;
  return (
    <PlacementQuestionView
      hive={hive}
      questions={questions.data}
      answers={answers}
      onAnswer={(question, choice) => answerPlacement(hive, questions.data, question, choice)}
    />
  );
}
