import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppearancePicker } from '@/components/progress/AppearancePicker';
import { ResultHistoryRow } from '@/components/progress/ResultHistoryRow';
import { StatTile } from '@/components/progress/StatTile';
import { WeekActivity } from '@/components/progress/WeekActivity';
import { Avatar, Card, Icon, ListRow, Screen, Text } from '@/components/ui';
import { answerTotals, streakDays } from '@/features/tests/progress';
import { percent } from '@/features/tests/scoring';
import { useTestSessionStore } from '@/features/tests/sessionStore';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const totals = answerTotals(results);
  const name = t('progress.guestName');

  return (
    <Screen>
      <View className="flex-row items-center gap-3.5">
        <Avatar name={name} size="lg" />
        <View className="flex-1 gap-0.5">
          <Text variant="title">{name}</Text>
          <Text variant="label" tone="muted">
            {t('progress.guestDescription')}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <StatTile value={String(streakDays(results))} label={t('progress.streak')} />
        <StatTile value={String(totals.answered)} label={t('progress.answered')} />
        <StatTile
          value={`${percent(totals.correct, totals.answered)}%`}
          label={t('progress.accuracy')}
        />
      </View>

      <WeekActivity />

      <View className="gap-2.5">
        <Text variant="subheading" accessibilityRole="header">
          {t('progress.historyTitle')}
        </Text>
        {results.length === 0 ? (
          <Card className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <Icon name="stats-chart-outline" size={22} color="secondary-foreground" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="font-sans-black">{t('results.emptyTitle')}</Text>
              <Text variant="label" tone="muted" className="font-sans-medium">
                {t('results.emptyDescription')}
              </Text>
            </View>
          </Card>
        ) : (
          <Card className="p-0">
            {results.map((r, i) => (
              <ResultHistoryRow key={r.finishedAt} result={r} divider={i < results.length - 1} />
            ))}
          </Card>
        )}
      </View>

      <View className="gap-2.5">
        <Text variant="subheading" accessibilityRole="header">
          {t('progress.settingsTitle')}
        </Text>
        <Card className="p-0">
          <View className="border-b border-border">
            <AppearancePicker />
          </View>
          <ListRow
            icon="language-outline"
            label={t('progress.language')}
            accessory={<Text tone="muted">{t('progress.languageName')}</Text>}
          />
        </Card>
      </View>
    </Screen>
  );
}
