import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TestResult } from '@mytutor/types';
import { Badge, Card, Text } from '@/components/ui';
import { percent, scoreTier } from '@/features/tests/scoring';
import { formatDateTime } from '@/i18n/formatDateTime';

type ResultHistoryRowProps = {
  result: TestResult;
};

const tierTone = { excellent: 'success', good: 'primary', practice: 'accent' } as const;

export function ResultHistoryRow({ result }: ResultHistoryRowProps) {
  const { t } = useTranslation();
  const score = percent(result.correct, result.total);
  const date = formatDateTime(t, new Date(result.finishedAt));

  return (
    <Card className="flex-row items-center gap-3">
      <View className="flex-1 gap-0.5">
        <Text variant="subheading">{result.title}</Text>
        <Text variant="caption" tone="muted">
          {`${t('result.score', { correct: result.correct, total: result.total })} · ${date}`}
        </Text>
      </View>
      <Badge label={`${score}%`} tone={tierTone[scoreTier(score)]} />
    </Card>
  );
}
