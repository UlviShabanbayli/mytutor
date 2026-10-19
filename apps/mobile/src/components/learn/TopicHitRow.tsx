import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import type { Hive, HiveTopic } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { Highlighted } from './Highlighted';
import { SearchRow } from './SearchRow';
import { TopicCell } from './TopicCell';

type TopicHitRowProps = { hive: Hive; topic: HiveTopic; query: string; onPress: () => void };

/** A topic found by search: its cell, the highlighted name, hive · unit · level. */
export function TopicHitRow({ hive, topic, query, onPress }: TopicHitRowProps) {
  const { t, hiveName, levelName, levelAria } = useLearnText();
  const unit = hive.units.find((u) => u.topics.includes(topic));

  return (
    <SearchRow
      accessibilityLabel={t('learn.search.topicAria', {
        number: topic.number,
        title: topic.title,
        level: levelAria(topic.level),
      })}
      onPress={onPress}
    >
      <TopicCell level={topic.level} number={topic.number} size={42} numberSize="sm" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Highlighted text={topic.title} query={query} className="font-sans-black text-base" />
        <Text className="text-xs" tone="muted">
          {t('learn.search.topicMeta', {
            hive: hiveName(hive),
            unit: unit?.number ?? '',
            level: levelName(topic.level),
          })}
        </Text>
      </View>
      <Icon name="chevron" size={18} color="muted" />
    </SearchRow>
  );
}
