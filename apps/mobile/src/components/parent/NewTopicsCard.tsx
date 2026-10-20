import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Text } from '@/components/ui';
import type { TopicRef } from '@mytutor/types';
import { ReportTile } from './ReportTile';

type NewTopicsCardProps = { topics: TopicRef[]; completedUnit: string | null };

/** Topics that became honey this week, as numbered cells, and a unit completed in full. */
export function NewTopicsCard({ topics, completedUnit }: NewTopicsCardProps) {
  const { t } = useTranslation();
  const spoken = topics
    .map((topic) => t('parent.report.topicMastered', { number: topic.number, title: topic.title }))
    .join(', ');

  return (
    <ReportTile
      icon="learn"
      label={t('parent.report.newTopics', { count: topics.length })}
      accessibilityLabel={[t('parent.report.newTopicsAria'), spoken].join(': ')}
    >
      {topics.length === 0 ? (
        <Text variant="caption" tone="muted" className="font-sans">
          {t('parent.report.noNewTopics')}
        </Text>
      ) : (
        <View className="flex-row flex-wrap items-center gap-1.5">
          {topics.map((topic) => (
            <HexCell key={topic.number} state="mastered" size={36} label={topic.number} />
          ))}
          {completedUnit ? (
            <Text className="ml-1 min-w-[120px] flex-1 text-xs text-muted">
              {t('parent.report.unitCompleted', { unit: completedUnit })}
            </Text>
          ) : null}
        </View>
      )}
    </ReportTile>
  );
}
