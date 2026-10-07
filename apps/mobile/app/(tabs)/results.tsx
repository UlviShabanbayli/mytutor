import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ResultHistoryRow } from '@/components/results/ResultHistoryRow';
import { StatTile } from '@/components/results/StatTile';
import { EmptyState, Screen, Text } from '@/components/ui';
import { percent } from '@/features/tests/scoring';
import { useTestSessionStore } from '@/features/tests/sessionStore';

export default function ResultsScreen() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const correct = results.reduce((sum, r) => sum + r.correct, 0);
  const total = results.reduce((sum, r) => sum + r.total, 0);

  return (
    <Screen>
      <Text variant="title">{t('results.title')}</Text>
      {results.length === 0 ? (
        <EmptyState
          icon="stats-chart-outline"
          title={t('results.emptyTitle')}
          description={t('results.emptyDescription')}
        />
      ) : (
        <>
          <View className="flex-row gap-3">
            <StatTile label={t('results.testsTaken')} value={String(results.length)} />
            <StatTile label={t('results.accuracy')} value={`${percent(correct, total)}%`} />
          </View>
          <View className="gap-3">
            <Text variant="heading">{t('results.historyTitle')}</Text>
            {results.map((r) => (
              <ResultHistoryRow key={r.finishedAt} result={r} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
