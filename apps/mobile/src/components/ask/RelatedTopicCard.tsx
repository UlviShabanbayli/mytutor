import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, HexCell, PressableCard, Text } from '@/components/ui';
import type { AskTopicRef } from '@/features/ask/types';

type RelatedTopicCardProps = {
  topic: AskTopicRef;
};

/** The topic the teacher linked the question to, opening its lesson. */
export function RelatedTopicCard({ topic }: RelatedTopicCardProps) {
  const { t } = useTranslation();

  return (
    <PressableCard
      accessibilityLabel={t('ask.answer.relatedA11y', { number: topic.number, title: topic.title })}
      onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: topic.lessonId } })}
      className="rounded-lg"
      contentClassName="min-h-[64px] flex-row items-center gap-3 rounded-lg px-3 py-2"
    >
      <HexCell state="lesson_completed" size={42} label={topic.number} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="overline" tone="muted">
          {t('ask.answer.related')}
        </Text>
        <Text className="font-sans-black">{topic.title}</Text>
      </View>
      <Badge
        label={t('ask.answer.lessonChip', { minutes: topic.lessonMinutes })}
        tone="honey"
        icon="play"
        className="self-center"
      />
    </PressableCard>
  );
}
