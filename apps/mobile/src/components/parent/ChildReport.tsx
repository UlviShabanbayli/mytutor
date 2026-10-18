import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui';
import { addDays } from '@/features/parent/format';
import { useChildReport, useMarkReportSeen } from '@/features/parent/queries';
import type { ChildOverview } from '@/features/parent/types';
import { QueryView } from './QueryView';
import { ReportBody } from './ReportBody';
import { ReportSkeleton } from './ReportSkeleton';
import { WeekSwitcher } from './WeekSwitcher';

type ChildReportProps = { child: ChildOverview };

/** Monday of the current week, for a child with no report yet. */
const thisMonday = () => {
  const now = new Date();
  return addDays(now, -((now.getDay() + 6) % 7));
};

/** The weekly report with the week switcher; opening this week's report marks it as read. */
export function ChildReport({ child }: ChildReportProps) {
  const { t } = useTranslation();
  const [week, setWeek] = useState(0);
  const page = useChildReport(child.childId, week);
  const markSeen = useMarkReportSeen();
  const { mutate } = markSeen;
  const latest = child.week ? new Date(child.week.weekStart) : thisMonday();
  const isNew = child.week?.reportIsNew === true;

  useEffect(() => {
    if (isNew) mutate(child.childId);
  }, [isNew, child.childId, mutate]);

  return (
    <View className="flex-1 gap-2">
      <WeekSwitcher
        weekStart={addDays(latest, -7 * week)}
        offset={week}
        hasPrevious={page.data?.hasPrevious ?? false}
        onChange={setWeek}
      />
      <QueryView query={page} loading={<ReportSkeleton />}>
        {({ report }) =>
          report ? (
            <ReportBody child={child} report={report} />
          ) : (
            <EmptyState
              moment="aiThinking"
              title={t('parent.report.emptyTitle')}
              description={t('parent.report.emptyBody')}
            />
          )
        }
      </QueryView>
    </View>
  );
}
