import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Text } from '@/components/ui';
import { genitiveAz } from '@/features/parent/text';
import type { TopicRef } from '@mytutor/types';
import { ReportTile } from './ReportTile';

type WeakSpotsCardProps = { name: string; topics: TopicRef[] };

/** Crystallised topics that need a repeat; already in the child's review plan, not a warning. */
export function WeakSpotsCard({ name, topics }: WeakSpotsCardProps) {
  const { t } = useTranslation();
  const note = t('parent.report.weakNote', {
    count: topics.length,
    name,
    nameGen: genitiveAz(name),
  });
  const spoken = topics
    .map((topic) => t('parent.report.weakAria', { number: topic.number, title: topic.title }))
    .join(', ');

  return (
    <ReportTile
      icon="refresh"
      label={t('parent.report.weakTitle')}
      accessibilityLabel={`${t('parent.report.weakTitle')}: ${spoken}. ${note}`}
    >
      <View className="flex-row flex-wrap gap-2">
        {topics.map((topic) => (
          <View key={topic.number} className="min-w-[45%] flex-1 flex-row items-center gap-2">
            <HexCell state="needs_practice" size={34} label={topic.number} />
            <Text className="min-w-0 flex-1 font-sans-black text-sm">{topic.title}</Text>
          </View>
        ))}
      </View>
      <Text className="text-xs text-muted">{note}</Text>
    </ReportTile>
  );
}
