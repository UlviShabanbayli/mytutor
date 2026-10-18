import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { WeekReport } from '@/features/parent/types';

type ReportStatusTilesProps = {
  name: string;
  report: WeekReport;
  sharesAssignments: boolean;
  sharesExam: boolean;
};

const caps = 'font-sans-black text-2xs uppercase tracking-[0.9px]';

/** Assignments on time and exam readiness; what the child keeps private shows a calm lock. */
export function ReportStatusTiles({
  name,
  report,
  sharesAssignments,
  sharesExam,
}: ReportStatusTilesProps) {
  const { t } = useTranslation();
  const tasks = report.assignments;
  const allOnTime = tasks !== null && tasks.total > 0 && tasks.onTime === tasks.total;

  const locked = (label: string, spoken: string) => (
    <View
      accessible
      accessibilityLabel={spoken}
      className="min-h-[52px] min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5"
    >
      <Icon name="lock" size={18} color="lock-ink" />
      <View className="min-w-0 flex-1 gap-px">
        <Text className={cn(caps, 'text-lock-ink')}>{label}</Text>
        <Text className="font-sans-black text-sm text-lock-ink">
          {t('parent.report.examNotShared')}
        </Text>
      </View>
    </View>
  );

  const tasksValue =
    tasks && tasks.total > 0
      ? t('parent.report.assignmentsValue', { onTime: tasks.onTime, total: tasks.total })
      : t('parent.report.assignmentsNone');
  const examValue =
    report.examReadiness === null
      ? t('parent.report.examNoPlan')
      : t('parent.report.examReadiness', { value: report.examReadiness });

  return (
    <View className="flex-row gap-2">
      {sharesAssignments ? (
        <View
          accessible
          accessibilityLabel={
            tasks && tasks.total > 0
              ? t('parent.report.assignmentsAria', { onTime: tasks.onTime, total: tasks.total })
              : `${t('parent.report.assignments')}: ${tasksValue}`
          }
          className={cn(
            'min-h-[52px] min-w-0 flex-1 flex-row items-center gap-2 rounded-lg px-3 py-1.5',
            allOnTime ? 'bg-ok-bg' : 'bg-raised',
          )}
        >
          <Icon
            name={allOnTime ? 'check' : 'list'}
            size={20}
            color={allOnTime ? 'ok' : 'honey-text'}
          />
          <View className="min-w-0 flex-1 gap-px">
            <Text className={cn(caps, allOnTime ? 'text-ok' : 'text-honey-text')}>
              {t('parent.report.assignments')}
            </Text>
            <Text className={cn('font-sans-black text-sm', allOnTime ? 'text-ok' : 'text-ink')}>
              {tasksValue}
            </Text>
          </View>
        </View>
      ) : (
        locked(t('parent.report.assignments'), t('parent.state.notSharedTitle', { name }))
      )}
      {sharesExam ? (
        <View
          accessible
          accessibilityLabel={`${t('parent.report.exam')}: ${examValue}`}
          className="min-h-[52px] min-w-0 flex-1 flex-row items-center gap-2 rounded-lg bg-raised px-3 py-1.5"
        >
          <Icon name="exam" size={20} color="honey-text" />
          <View className="min-w-0 flex-1 gap-px">
            <Text className={cn(caps, 'text-honey-text')}>{t('parent.report.exam')}</Text>
            <Text className="font-sans-black text-sm">{examValue}</Text>
          </View>
        </View>
      ) : (
        locked(t('parent.report.exam'), t('parent.report.examNotSharedAria', { name }))
      )}
    </View>
  );
}
