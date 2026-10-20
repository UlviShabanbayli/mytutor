import { router, useLocalSearchParams } from 'expo-router';
import { UnitDoneView } from '@/components/learn/UnitDoneView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useUnit } from '@/features/learn/queries';
import { useLearnText } from '@/features/learn/useLearnText';

/** The unit-sealed moment, by unit id ("riyaziyyat-7-u4"). */
export default function UnitDoneScreen() {
  const { t } = useLearnText();
  const { id } = useLocalSearchParams<{ id: string }>();
  const view = useUnit(id);

  if (view.status === 'ready')
    return (
      <UnitDoneView
        hive={view.hive}
        unit={view.unit}
        next={view.hive.units[view.index + 1]}
        result={view.unit.unitTest.result}
      />
    );
  return (
    <Screen>
      <ScreenHeader title="" />
      {view.status === 'pending' ? (
        <LoadingState />
      ) : view.status === 'error' ? (
        <ErrorState onRetry={view.retry} />
      ) : (
        <EmptyState
          title={t('learn.unitDone.missing')}
          description={t('learn.unitDone.missingBody')}
          actionLabel={t('learn.topic.missingAction')}
          onAction={() => router.navigate('/learn')}
        />
      )}
    </Screen>
  );
}
