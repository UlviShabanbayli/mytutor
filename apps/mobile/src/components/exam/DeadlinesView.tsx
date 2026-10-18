import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { deadlineText } from '@/features/exam/deadlineText';
import { groupDeadlines, type DeadlineGroupKey } from '@/features/exam/deadlines';
import { DEMO_DAYS_LEFT } from '@/features/exam/demo';
import { examDaysLeft, examGoalOf } from '@/features/exam/goal';
import { monthHeading } from '@/features/exam/labels';
import { useDeadlines } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import type { Deadline } from '@/features/exam/types';
import { DeadlineRow } from './DeadlineRow';
import { ReminderToggle } from './ReminderToggle';

const boxTone = (d: Deadline) =>
  d.kind === 'assignment' ? 'info' : d.kind === 'registrationEnds' ? 'raised' : 'spot';

/** One calendar: class assignments, mock registration and dates, the official DİM dates. */
export function DeadlinesView() {
  const { t } = useTranslation();
  const query = useDeadlines();
  const goal = examGoalOf(useAppStore((s) => s.profile.goal));
  const reminders = useExamStore((s) => s.reminders);
  const setReminders = useExamStore((s) => s.setReminders);
  const registeredMocks = useExamStore((s) => s.registeredMocks);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const today = new Date();
  const groups = groupDeadlines(query.data.items, today);
  const context = {
    goal,
    daysLeft: goal ? examDaysLeft(goal, today, DEMO_DAYS_LEFT) : DEMO_DAYS_LEFT,
    registered: registeredMocks.includes(query.data.generalMockId),
  };
  const heading = (key: DeadlineGroupKey) =>
    key.kind === 'thisWeek'
      ? t('exam.deadlines.thisWeek')
      : key.kind === 'official'
        ? t('exam.deadlines.official')
        : monthHeading(t, key.month);

  return (
    <View className="gap-1.5">
      <ReminderToggle on={reminders} onChange={setReminders} />
      {groups.length === 0 ? (
        <EmptyState
          moment="aiThinking"
          title={t('exam.deadlines.emptyTitle')}
          description={t('exam.deadlines.emptyBody')}
        />
      ) : (
        groups.map((group) => (
          <View key={group.id} className="gap-1.5">
            <Text
              variant="overline"
              tone="muted"
              accessibilityRole="header"
              className="mt-2 text-xs"
            >
              {heading(group.key)}
            </Text>
            {group.items.map((item) => (
              <DeadlineRow
                key={item.id}
                date={item.date}
                tone={boxTone(item)}
                text={deadlineText(t, item, context)}
              />
            ))}
          </View>
        ))
      )}
    </View>
  );
}
