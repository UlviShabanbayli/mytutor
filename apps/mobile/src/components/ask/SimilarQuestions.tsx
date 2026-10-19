import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, PressableCard, SourceLine, Text } from '@/components/ui';
import type { SimilarQuestion } from '@/features/ask/types';

type SimilarQuestionsProps = {
  items: SimilarQuestion[];
};

/** Questions of the same topic to practise next, each with its source. */
export function SimilarQuestions({ items }: SimilarQuestionsProps) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <View className="gap-2">
      <Text variant="heading" className="text-md">
        {t('ask.answer.similar')}
      </Text>
      {items.map((item) => (
        <PressableCard
          key={item.id}
          accessibilityLabel={`${item.text}. ${t('ui.source', { source: item.source })}`}
          onPress={() => router.push({ pathname: '/topic/[id]', params: { id: item.topicId } })}
          className="rounded-lg"
          contentClassName="min-h-[64px] flex-row items-center gap-2.5 rounded-lg px-3 py-2.5"
        >
          <View className="min-w-0 flex-1 gap-1">
            <Text className="font-sans-black leading-5">{item.text}</Text>
            <SourceLine source={item.source} />
          </View>
          <Icon name="chevron" size={18} color="muted" />
        </PressableCard>
      ))}
    </View>
  );
}
