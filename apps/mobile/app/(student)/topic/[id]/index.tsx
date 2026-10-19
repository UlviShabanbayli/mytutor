import { router, useLocalSearchParams } from 'expo-router';
import { TopicView } from '@/components/learn/TopicView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useOnline, useTopic } from '@/features/learn/queries';
import { useLearnText } from '@/features/learn/useLearnText';

/** A topic page: the four steps, teacher material, prerequisites ("Bilirəm, keç" too). */
export default function TopicScreen() {
  const { t } = useLearnText();
  const { id } = useLocalSearchParams<{ id: string }>();
  const view = useTopic(id);
  const online = useOnline();

  if (view.status === 'pending')
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (view.status === 'error')
    return (
      <Screen>
        <ScreenHeader title="" />
        <ErrorState onRetry={view.retry} />
      </Screen>
    );
  if (view.status === 'preparing')
    return (
      <Screen>
        <ScreenHeader title="" />
        <EmptyState
          title={t('learn.topic.missing')}
          description={t('learn.topic.missingBody')}
          actionLabel={t('learn.topic.missingAction')}
          onAction={() => router.navigate('/learn')}
        />
      </Screen>
    );
  return <TopicView hive={view.hive} place={view.place} online={online} />;
}
