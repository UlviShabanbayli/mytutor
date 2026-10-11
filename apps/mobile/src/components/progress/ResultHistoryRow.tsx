import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TestResult } from '@mytutor/types';
import { Badge, Text } from '@/components/ui';
import { percent, scoreTier } from '@/features/tests/scoring';
import { formatDateTime } from '@/i18n/formatDateTime';
import { cn } from '@/lib/cn';

type ResultHistoryRowProps = {
  result: TestResult;
  /** Draws the divider under the row (all but the last row). */
  divider?: boolean;
};

const tierTone = { excellent: 'success', good: 'primary', practice: 'accent' } as const;

export function ResultHistoryRow({ result, divider = false }: ResultHistoryRowProps) {
  const { t } = useTranslation();
  const score = percent(result.correct, result.total);
  const date = formatDateTime(t, new Date(result.finishedAt));

  return (
    <View
      className={cn(
        'min-h-14 flex-row items-center gap-3 px-4 py-3',
        divider && 'border-b border-border',
      )}
    >
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-bold">{result.title}</Text>
        <Text variant="caption" tone="muted">
          {`${t('result.score', { correct: result.correct, total: result.total })} · ${date}`}
        </Text>
      </View>
      <Badge label={`${score}%`} tone={tierTone[scoreTier(score)]} />
    </View>
  );
}
