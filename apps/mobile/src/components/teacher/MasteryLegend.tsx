import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { type CellState, HexCell, Text } from '@/components/ui';

const STATES: CellState[] = [
  'reinforced',
  'mastered',
  'lesson_completed',
  'needs_practice',
  'not_started',
];

/** What the letters and fills of the cells mean. */
export function MasteryLegend() {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('teacher.insights.legend')}
      className="mt-1 flex-row flex-wrap gap-x-2.5 gap-y-1 border-t border-border pt-1.5"
    >
      {STATES.map((s) => (
        <View key={s} className="flex-row items-center gap-1">
          <HexCell state={s} size={18} label={t(`teacher.levelLetters.${s}`)} />
          <Text className="font-sans-bold text-2xs text-muted">{t(`teacher.levels.${s}`)}</Text>
        </View>
      ))}
    </View>
  );
}
