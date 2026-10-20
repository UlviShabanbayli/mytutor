import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { QuestionFilterChips } from '@/components/ask/QuestionFilterChips';
import { QuestionRow } from '@/components/ask/QuestionRow';
import {
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  LoadingState,
  Screen,
  ScreenHeader,
  StaggerGroup,
  StaggerItem,
  Text,
} from '@/components/ui';
import { dayHeading, formatClock, daysAgo } from '@/features/ask/dates';
import { questionNote } from '@/features/ask/labels';
import { useAskQuestions } from '@/features/ask/queries';
import {
  filterCounts,
  groupByDay,
  matchesFilter,
  type QuestionFilter,
} from '@/features/ask/questions';

/** Suallarım: every photo question by day, filtered by waiting or ready. */
export default function MyQuestionsScreen() {
  const { t, i18n } = useTranslation();
  const query = useAskQuestions();
  const [filter, setFilter] = useState<QuestionFilter>('all');
  const now = new Date();
  const newQuestion = () => router.push('/ask/camera');
  const header = (
    <ScreenHeader
      title={t('ask.mine.title')}
      actions={
        <IconButton
          icon="camera"
          color="on-honey"
          accessibilityLabel={t('ask.mine.newQuestion')}
          onPress={newQuestion}
          className="bg-honey active:bg-honey-deep"
        />
      }
    />
  );

  if (query.isPending)
    return (
      <Screen>
        {header}
        <LoadingState />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        {header}
        <ErrorState onRetry={() => void query.refetch()} />
      </Screen>
    );

  const questions = query.data ?? [];
  if (questions.length === 0)
    return (
      <Screen>
        {header}
        <EmptyState
          moment="aiThinking"
          title={t('ask.mine.emptyTitle')}
          description={t('ask.mine.emptyBody')}
          actionLabel={t('ask.mine.emptyAction')}
          onAction={newQuestion}
        />
      </Screen>
    );

  const groups = groupByDay(questions.filter((q) => matchesFilter(q, filter)));
  // Rows are counted across the days, so the first-load stagger runs down the whole list.
  const offsets = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.items.length, 0),
  );

  return (
    <Screen className="gap-3" onRefresh={() => query.refetch()}>
      {header}
      <QuestionFilterChips value={filter} counts={filterCounts(questions)} onChange={setFilter} />
      <View className="flex-row items-center gap-1.5">
        <Icon name="lock" size={14} color="muted" />
        <Text variant="caption" tone="muted" className="flex-1 font-sans">
          {t('ask.mine.privacy')}
        </Text>
      </View>
      {groups.length === 0 ? <Text tone="muted">{t('ask.mine.filterEmpty')}</Text> : null}
      <StaggerGroup>
        {groups.map((group, g) => (
          <View key={group.key} className="gap-2">
            <Text variant="overline" tone="muted" className="mt-2 text-xs">
              {dayHeading(t, group.date, now, i18n.language)}
            </Text>
            {group.items.map((q, i) => {
              const sent = new Date(q.sentAt);
              return (
                <StaggerItem key={q.id} index={(offsets[g] ?? 0) + i}>
                  <QuestionRow
                    question={q}
                    meta={
                      daysAgo(sent, now) === 0
                        ? t('ask.state.metaSubjectTime', {
                            subject: q.subjectLabel,
                            time: formatClock(sent),
                          })
                        : q.subjectLabel
                    }
                    note={questionNote(t, q)}
                  />
                </StaggerItem>
              );
            })}
          </View>
        ))}
      </StaggerGroup>
    </Screen>
  );
}
