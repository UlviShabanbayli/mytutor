import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Topic } from '@mytutor/types';
import { Button, Text } from '@/components/ui';

type RecommendedTestCardProps = {
  topic: Topic;
};

/** The home screen's main card: the next test to take. */
export function RecommendedTestCard({ topic }: RecommendedTestCardProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-4 rounded-xl border border-border bg-card p-5">
      <View className="gap-1.5">
        <Text variant="label" tone="primary">
          {t('home.recommendedTitle')}
        </Text>
        <Text variant="title">{topic.title}</Text>
        <Text variant="label" tone="muted">
          {`${t('common.grade', { count: topic.grade, ordinal: true })} · ${t('common.questionsCount', { count: topic.questionCount })}`}
        </Text>
        <Text tone="muted" className="pt-1">
          {t('home.recommendedBody')}
        </Text>
      </View>
      <Button
        label={t('home.startTest')}
        icon="play"
        onPress={() => router.push({ pathname: '/test/[id]', params: { id: topic.id } })}
      />
    </View>
  );
}
