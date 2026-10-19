import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, PressableCard, SourceLine, Text } from '@/components/ui';
import type { AssignmentDetail } from '@/features/me/types';
import { Hex } from './Hex';

type TopicLinkCardProps = { topic: AssignmentDetail['topic'] };

/** The textbook topic a task is about, with its mandatory source line; opens the topic. */
export function TopicLinkCard({ topic }: TopicLinkCardProps) {
  const { t } = useTranslation();
  return (
    <PressableCard
      accessibilityLabel={t('me.assignment.topicLabel', {
        number: topic.number,
        title: topic.title,
      })}
      onPress={() => router.push({ pathname: '/topic/[id]', params: { id: topic.id } })}
      contentClassName="flex-row items-center gap-3 rounded-lg px-3 py-2.5"
      className="rounded-lg"
    >
      <Hex width={40} fill="honey">
        <Text className="font-sans-black text-xs text-on-honey">{topic.number}</Text>
      </Hex>
      <View className="flex-1 gap-1">
        <Text className="font-sans-black text-sm">{topic.title}</Text>
        <SourceLine source={topic.source} />
      </View>
      <Icon name="chevron" size={18} color="muted" />
    </PressableCard>
  );
}
