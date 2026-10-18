import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { type CellState, HexCell, Text } from '@/components/ui';

type SubjectSummaryCardProps = { done: number; total: number };

const legend: {
  state: CellState;
  key: 'mastered' | 'reinforced' | 'learning' | 'practice' | 'empty';
}[] = [
  { state: 'mastered', key: 'mastered' },
  { state: 'reinforced', key: 'reinforced' },
  { state: 'lesson_completed', key: 'learning' },
  { state: 'needs_practice', key: 'practice' },
  { state: 'not_started', key: 'empty' },
];

/** "15 / 26 hüceyrə mənimsənilib" and what each cell colour means (never colour alone). */
export function SubjectSummaryCard({ done, total }: SubjectSummaryCardProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-2 rounded-[18px] bg-raised px-3.5 py-3">
      <View
        accessible
        accessibilityLabel={t('parent.subject.masteredAria', { done, total })}
        className="flex-row items-baseline gap-2"
      >
        <Text className="font-display-black text-2xl">{`${done} / ${total}`}</Text>
        <Text className="font-sans-semibold text-sm">{t('parent.subject.mastered')}</Text>
      </View>
      <View
        accessibilityLabel={t('parent.subject.legendLabel')}
        className="flex-row flex-wrap gap-x-3 gap-y-1"
      >
        {legend.map((item) => (
          <View key={item.key} className="flex-row items-center gap-[5px]">
            <HexCell state={item.state} size={13} />
            <Text className="font-sans-semibold text-xs text-muted">
              {t(`parent.subject.legend.${item.key}`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
