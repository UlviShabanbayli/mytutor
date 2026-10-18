import { Pressable, View } from 'react-native';
import { HexCell, Text } from '@/components/ui';
import { openTopic } from '@/features/learn/navigation';
import type { HiveTopic } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type PrereqChipsProps = {
  topics: HiveTopic[];
};

/** "Bu mövzu bunlara söykənir": the topics this one builds on, with their levels. */
export function PrereqChips({ topics }: PrereqChipsProps) {
  const { t, levelShort, levelAria } = useLearnText();
  if (topics.length === 0) return null;

  return (
    <View accessibilityLabel={t('learn.topic.prereqGroup')} className="gap-2">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('learn.topic.prereq')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {topics.map((topic) => (
          <Pressable
            key={topic.id}
            accessibilityRole="button"
            accessibilityLabel={`${topic.number} ${topic.title}: ${levelAria(topic.level)}`}
            onPress={() => openTopic(topic.id)}
            className="rounded-md bg-border pb-0.5"
          >
            <View className="h-[44px] flex-row items-center gap-2 rounded-md border border-border bg-surf pl-1.5 pr-3">
              <HexCell state={topic.level} size={26} />
              <Text className="font-sans-black text-sm">{topic.number}</Text>
              <Text className="font-sans-bold text-xs" tone="muted">
                {levelShort(topic.level)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
