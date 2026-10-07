import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Topic } from '@mytutor/types';
import { Badge, Button, Text } from '@/components/ui';

type RecommendedTestCardProps = {
  topic: Topic;
};

/** Hero card on the home screen inviting the student into the next test. */
export function RecommendedTestCard({ topic }: RecommendedTestCardProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-4 rounded-xl bg-primary p-5">
      <View className="gap-2">
        <Badge label={t('home.recommendedTitle')} tone="primary" />
        <Text variant="title" tone="inverse">
          {topic.title}
        </Text>
        <Text variant="label" tone="inverse" className="opacity-90">
          {`${t('common.grade', { count: topic.grade, ordinal: true })} · ${t('common.questionsCount', { count: topic.questionCount })}`}
        </Text>
      </View>
      <Button
        label={t('home.startTest')}
        icon="play"
        variant="secondary"
        onPress={() => router.push({ pathname: '/test/[id]', params: { id: topic.id } })}
      />
    </View>
  );
}
