import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { TopicView } from '@/features/teacher/types';

type BuilderTopicTilesProps = {
  topics: TopicView[];
  counts: Record<string, number>;
  value: string;
  onChange: (topicId: string) => void;
};

/** The unit's topics with how many questions are picked from each. */
export function BuilderTopicTiles({ topics, counts, value, onChange }: BuilderTopicTilesProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t('teacher.builder.topics')}
      className="flex-row gap-1.5"
    >
      {topics.map(({ id, number }) => {
        const on = id === value;
        const n = counts[id] ?? 0;
        const picked =
          n > 0 ? t('teacher.builder.picked', { count: n }) : t('teacher.builder.none');
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={
              n > 0
                ? t('teacher.builder.topicLabel', { id: number, picked })
                : t('teacher.builder.topicNone', { id: number })
            }
            onPress={() => onChange(id)}
            className={cn(
              'min-h-[50px] flex-1 items-center justify-center gap-px rounded-md border-2 p-0.5 active:opacity-80',
              on ? 'border-honey bg-raised' : 'border-border bg-surf',
            )}
          >
            <Text className="font-sans-black text-sm">{number}</Text>
            <Text numberOfLines={1} className="font-sans-bold text-2xs text-muted">
              {picked}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
