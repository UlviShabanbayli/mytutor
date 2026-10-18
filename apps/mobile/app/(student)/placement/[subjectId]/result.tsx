import { router, useLocalSearchParams } from 'expo-router';
import { HivePreparing } from '@/components/learn/HivePreparing';
import { PlacementResultView } from '@/components/learn/PlacementResultView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useHive } from '@/features/learn/queries';
import { useLearnStore } from '@/features/learn/store';
import { useLearnText } from '@/features/learn/useLearnText';

/** The result of "Bilirəm, yoxla" (kept on the device until the placement API exists). */
export default function PlacementResultScreen() {
  const { t } = useLearnText();
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const view = useHive(subjectId);
  const hiveId = view.status === 'ready' ? view.hive.id : subjectId;
  const outcome = useLearnStore((s) => s.placement[hiveId]?.outcome);

  if (view.status === 'pending')
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (view.status === 'preparing') return <HivePreparing subject={view.subject} />;
  if (view.status === 'error')
    return (
      <Screen>
        <ScreenHeader title="" />
        <ErrorState onRetry={view.retry} />
      </Screen>
    );
  if (!outcome)
    return (
      <Screen>
        <ScreenHeader title="" />
        <EmptyState
          title={t('learn.result.missing')}
          description={t('learn.result.missingBody')}
          actionLabel={t('learn.result.missingAction')}
          onAction={() =>
            router.replace({ pathname: '/placement/[subjectId]', params: { subjectId: hiveId } })
          }
        />
      </Screen>
    );
  return <PlacementResultView hive={view.hive} outcome={outcome} />;
}
