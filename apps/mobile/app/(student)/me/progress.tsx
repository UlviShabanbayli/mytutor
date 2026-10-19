import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InfoNote } from '@/components/me/InfoNote';
import { MasteryCard } from '@/components/me/MasteryCard';
import { TextbookChips } from '@/components/me/TextbookChips';
import { ResultHistoryRow } from '@/components/progress/ResultHistoryRow';
import { WeekActivity } from '@/components/progress/WeekActivity';
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { useClassComparison, useTextbookProgress } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import { useTestSessionStore } from '@/features/tests/sessionStore';

/** "İrəliləyiş": mastery per textbook (demo), this week and results history (real). */
export default function ProgressScreen() {
  const { t } = useTranslation();
  const textbooks = useTextbookProgress();
  const comparison = useClassComparison();
  const results = useTestSessionStore((s) => s.results);
  const inClass = useMeStore((s) => s.classIds.length > 0 && !s.guest);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (textbooks.isPending) {
    return (
      <Screen>
        <ScreenHeader title={t('me.progress.title')} />
        <LoadingState />
      </Screen>
    );
  }
  if (textbooks.isError) {
    return (
      <Screen>
        <ScreenHeader title={t('me.progress.title')} />
        <ErrorState onRetry={() => void textbooks.refetch()} />
      </Screen>
    );
  }

  const selected =
    textbooks.data.find((b) => b.id === selectedId) ??
    textbooks.data.find((b) => b.status === 'ready');

  return (
    <Screen className="gap-2.5">
      <ScreenHeader title={t('me.progress.title')} />
      {selected ? (
        <>
          <TextbookChips
            textbooks={textbooks.data}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
          <MasteryCard textbook={selected} />
        </>
      ) : null}
      <WeekActivity />
      {inClass && comparison.data !== undefined ? (
        <InfoNote
          icon="users"
          lead={t('me.progress.comparisonLead', { percent: comparison.data })}
          caption={t('me.progress.comparisonBody')}
        />
      ) : null}
      <View className="gap-1.5">
        <Text accessibilityRole="header" className="font-display-bold text-base">
          {t('me.progress.historyTitle')}
        </Text>
        {results.length === 0 ? (
          <Card className="gap-2">
            <Text className="font-sans-black">{t('me.progress.historyEmptyTitle')}</Text>
            <Text tone="muted" className="text-sm">
              {t('me.progress.historyEmptyBody')}
            </Text>
            <Button
              label={t('me.progress.historyEmptyAction')}
              variant="secondary"
              size="md"
              onPress={() => router.push('/learn')}
            />
          </Card>
        ) : (
          results.map((r) => <ResultHistoryRow key={r.finishedAt} result={r} />)
        )}
      </View>
    </Screen>
  );
}
