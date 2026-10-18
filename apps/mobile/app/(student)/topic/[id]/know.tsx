import { router, Stack, useLocalSearchParams } from 'expo-router';
import { KnowSkipSheet } from '@/components/learn/KnowSkipSheet';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { backOr } from '@/features/learn/navigation';
import { useTopic } from '@/features/learn/queries';
import { useLearnText } from '@/features/learn/useLearnText';

/**
 * "Bilirəm, keç" as a sheet over the screen it was opened from (hive or topic page). The
 * transparent presentation is set here until the student stack layout lists this route.
 */
export default function KnowSkipScreen() {
  const { t } = useLearnText();
  const { id } = useLocalSearchParams<{ id: string }>();
  const view = useTopic(id);
  const close = () => backOr(() => router.replace({ pathname: '/topic/[id]', params: { id } }));
  const options = (
    <Stack.Screen options={{ presentation: 'transparentModal', animation: 'fade' }} />
  );

  if (view.status === 'ready')
    return (
      <>
        {options}
        <KnowSkipSheet
          hive={view.hive}
          place={view.place}
          unitIndex={view.hive.units.indexOf(view.place.unit)}
          onClose={close}
        />
      </>
    );
  return (
    <Screen>
      {options}
      <ScreenHeader title="" />
      {view.status === 'pending' ? (
        <LoadingState />
      ) : view.status === 'error' ? (
        <ErrorState onRetry={view.retry} />
      ) : (
        <EmptyState title={t('learn.topic.missing')} description={t('learn.topic.missingBody')} />
      )}
    </Screen>
  );
}
