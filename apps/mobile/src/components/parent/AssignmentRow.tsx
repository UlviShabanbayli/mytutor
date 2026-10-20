import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { formatDayMonth, formatDayMonthTime } from '@/features/parent/format';
import { assignmentTone, type AssignmentTone } from '@/features/parent/report';
import type { AssignmentItem } from '@/features/parent/types';

const tones: Record<
  AssignmentTone,
  { box: string; text: string; color: ColorName; icon: IconName | null }
> = {
  work: { box: 'bg-raised', text: 'text-honey-text', color: 'honey-text', icon: 'edit' },
  late: { box: 'bg-err-bg', text: 'text-err', color: 'err', icon: 'clock' },
  ok: { box: 'bg-ok-bg', text: 'text-ok', color: 'ok', icon: 'check' },
  check: { box: 'bg-info-bg', text: 'text-info', color: 'info', icon: 'check' },
  idle: { box: 'bg-wax', text: 'text-lock-ink', color: 'lock-ink', icon: null },
};

type AssignmentRowProps = { assignment: AssignmentItem };

/** One class assignment: title, due or hand-in date, and a status pill with a word and icon. */
export function AssignmentRow({ assignment: a }: AssignmentRowProps) {
  const { t } = useTranslation();
  const tone = tones[assignmentTone(a)];
  const done = a.state === 'submitted' || a.state === 'checked';
  const sub = done
    ? t(a.onTime ? 'parent.assignments.doneOnTime' : 'parent.assignments.doneLate', {
        date: formatDayMonth(t, new Date(a.submittedAt ?? a.dueAt), true),
      })
    : t('parent.assignments.due', { date: formatDayMonthTime(t, new Date(a.dueAt)) });

  const score =
    a.score === null
      ? null
      : a.score.kind === 'points'
        ? t('parent.assignments.status.points', { value: a.score.value, max: a.score.max })
        : t('parent.percent', { value: a.score.value });

  const status = (() => {
    switch (a.state) {
      case 'in_progress':
        return a.progress
          ? t('parent.assignments.status.inProgress', a.progress)
          : t('parent.assignments.status.inProgressPlain');
      case 'late':
        return t('parent.assignments.status.late', { count: a.lateDays });
      case 'checked':
        return score
          ? t('parent.assignments.status.checked', { score })
          : t('parent.assignments.status.checkedPlain');
      case 'submitted':
        return a.onTime
          ? t('parent.assignments.status.submitted')
          : t('parent.assignments.status.submittedLate');
      default:
        return t('parent.assignments.status.notStarted');
    }
  })();

  return (
    <View
      accessible
      accessibilityLabel={`${a.title}, ${sub}, ${status}`}
      className="min-h-[64px] flex-row items-center gap-2.5 rounded-lg border border-border bg-surf px-3 py-2.5"
    >
      <View className="min-w-0 flex-1 gap-[3px]">
        <Text className="font-sans-black">{a.title}</Text>
        <View className="flex-row items-center gap-1">
          <Icon name="calendar" size={13} color="muted" />
          <Text className="min-w-0 flex-1 text-xs text-muted">{sub}</Text>
        </View>
      </View>
      <View className={cn('h-[28px] flex-row items-center gap-1 rounded-full px-[9px]', tone.box)}>
        {tone.icon ? <Icon name={tone.icon} size={14} color={tone.color} /> : null}
        <Text numberOfLines={1} className={cn('font-sans-black text-xs', tone.text)}>
          {status}
        </Text>
      </View>
    </View>
  );
}
