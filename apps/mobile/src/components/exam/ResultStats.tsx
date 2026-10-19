import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { minutesLabel } from '@/features/exam/labels';
import type { MockScore } from '@/features/exam/mockScoring';

type ResultStatsProps = {
  score: MockScore;
  minutes: number;
};

/** Right answers, time spent, wrong and empty — three tiles. */
export function ResultStats({ score, minutes }: ResultStatsProps) {
  const { t } = useTranslation();
  const tiles = [
    {
      value: t('exam.result.correct', { correct: score.correct, total: score.total }),
      label: t('exam.result.correctLabel', { percent: score.percent }),
    },
    { value: minutesLabel(t, minutes), label: t('exam.result.spentLabel') },
    {
      value: t('exam.result.wrongEmpty', { wrong: score.wrong, empty: score.empty }),
      label: t('exam.result.wrongEmptyLabel'),
    },
  ];

  return (
    <View className="flex-row gap-2">
      {tiles.map((tile) => (
        <View
          key={tile.label}
          accessible
          accessibilityLabel={`${tile.value}, ${tile.label}`}
          className="min-w-0 flex-1 gap-0.5 rounded-lg border border-border bg-surf p-2.5"
        >
          <Text numberOfLines={1} adjustsFontSizeToFit className="font-display-black text-lg">
            {tile.value}
          </Text>
          <Text tone="muted" className="font-sans-bold text-xs">
            {tile.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
