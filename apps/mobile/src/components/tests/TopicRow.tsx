import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Topic } from '@mytutor/types';
import { Badge, Icon, PressableCard, Text } from '@/components/ui';

type TopicRowProps = {
  topic: Topic;
  onPress: () => void;
};

export function TopicRow({ topic, onPress }: TopicRowProps) {
  const { t } = useTranslation();
  const available = topic.questionCount > 0;
  const grade = t('common.grade', { count: topic.grade, ordinal: true });
  const meta = available
    ? t('common.questionsCount', { count: topic.questionCount })
    : t('common.comingSoon');

  return (
    <PressableCard
      onPress={onPress}
      disabled={!available}
      accessibilityLabel={`${topic.title}, ${grade}, ${meta}`}
      accessibilityHint={available ? undefined : t('subject.topicUnavailable')}
      contentClassName="flex-row items-center gap-3"
    >
      <View className="flex-1 gap-1.5">
        <Text variant="subheading">{topic.title}</Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label={grade} tone="primary" />
          <Badge label={meta} tone={available ? 'neutral' : 'accent'} />
        </View>
      </View>
      {available ? <Icon name="chevron-forward" color="muted-foreground" /> : null}
    </PressableCard>
  );
}
