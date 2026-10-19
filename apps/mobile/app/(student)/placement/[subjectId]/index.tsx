import { useLocalSearchParams } from 'expo-router';
import { HivePreparing } from '@/components/learn/HivePreparing';
import { PlacementIntro } from '@/components/learn/PlacementIntro';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { skipPlacement, startPlacement } from '@/features/learn/navigation';
import { placementRange } from '@/features/learn/placement';
import { useHive, usePlacementQuestions } from '@/features/learn/queries';

/** "Haradan başlayaq?" for a hive (the route's subjectId is the hive id). */
export default function PlacementIntroScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const view = useHive(subjectId);
  const questions = usePlacementQuestions(view.status === 'ready' ? view.hive.id : subjectId);

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
  const { hive } = view;
  return (
    <PlacementIntro
      hive={hive}
      range={placementRange(hive, questions.data)}
      onCheck={() => startPlacement(hive.id)}
      onZero={() => skipPlacement(hive.id)}
    />
  );
}
