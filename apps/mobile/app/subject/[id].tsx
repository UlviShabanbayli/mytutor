import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopicRow } from '@/components/tests/TopicRow';
import { ErrorState, LoadingState, Screen, ScreenHeader, Text } from '@/components/ui';
import { useSubject } from '@/features/tests/queries';

export default function SubjectScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useSubject(id);

  if (query.isPending)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <ErrorState onRetry={() => void query.refetch()} />
      </Screen>
    );

  const { subject, topics } = query.data;

  return (
    <Screen>
      <ScreenHeader
        title={subject.title}
        subtitle={t('common.topicsCount', { count: topics.length })}
      />
      <View className="gap-3">
        <Text variant="heading">{t('subject.topicsTitle')}</Text>
        {topics.length === 0 ? (
          <Text tone="muted">{t('tests.emptyDescription')}</Text>
        ) : (
          topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              onPress={() => router.push({ pathname: '/test/[id]', params: { id: topic.id } })}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
