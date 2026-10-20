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
import { useClassComparison, useMyProgress, useTextbookProgress } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import { useTestSessionStore } from '@/features/tests/sessionStore';

/**
 * "İrəliləyiş": mastery per textbook, the last seven days and the recent results, all from the
 * demo world (a finished test is a `test.finished` event).
 */
export default function ProgressScreen() {
  const { t } = useTranslation();
  const textbooks = useTextbookProgress();
  const comparison = useClassComparison();
  const progress = useMyProgress();
  const recent = progress.data?.recentTests ?? [];
  // A result finished in this app session opens its answers; an older one opens the test.
  const onDevice = useTestSessionStore((s) => s.results);
  const open = (testId: string | null) => {
    if (!testId) return undefined;
    const done = onDevice.some((r) => r.testId === testId);
    return () =>
      router.push({ pathname: done ? '/test/[id]/result' : '/test/[id]', params: { id: testId } });
  };
  const guest = useMeStore((s) => s.guest);
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
      {!guest && comparison.data != null ? (
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
        {recent.length === 0 ? (
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
          recent.map((r) => (
            <ResultHistoryRow
              key={r.id}
              result={{
                title: r.title,
                correct: r.correct,
                total: r.questions,
                finishedAt: r.takenAt,
              }}
              onPress={open(r.testId)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
