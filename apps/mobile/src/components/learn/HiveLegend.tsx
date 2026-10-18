import { View } from 'react-native';
import { HexCell, Text } from '@/components/ui';
import type { MasteryLevel } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

const LEVELS: MasteryLevel[] = [
  'not_started',
  'lesson_completed',
  'mastered',
  'reinforced',
  'needs_practice',
];

/** The five cell levels with their names (the key to the comb's colors and shapes). */
export function HiveLegend() {
  const { t, levelShort, levelAria } = useLearnText();

  return (
    <View
      accessibilityRole="list"
      accessibilityLabel={t('learn.hive.legend')}
      className="flex-row justify-between gap-1 px-4 pb-2 pt-2.5"
    >
      {LEVELS.map((level) => (
        <View
          key={level}
          accessible
          accessibilityLabel={levelAria(level)}
          className="flex-row items-center gap-1.5"
        >
          <HexCell state={level} size={14} />
          <Text className="font-sans-bold text-xs" tone="muted">
            {levelShort(level)}
          </Text>
        </View>
      ))}
    </View>
  );
}
