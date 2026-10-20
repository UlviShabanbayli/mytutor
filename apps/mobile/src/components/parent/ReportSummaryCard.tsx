import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { summaryClauses, type SummaryClause } from '@/features/parent/report';
import { genitiveAz, joinList } from '@/features/parent/text';
import type { WeekReport } from '@mytutor/types';

type ReportSummaryCardProps = { name: string; report: WeekReport };

/** The week in one calm, factual sentence; only the child's own progress, no comparisons. */
export function ReportSummaryCard({ name, report }: ReportSummaryCardProps) {
  const { t } = useTranslation();
  const clauses = summaryClauses(report);

  const say = (c: SummaryClause) => {
    switch (c.kind) {
      case 'days':
        return t('parent.report.clause.days', { count: c.count });
      case 'topics':
        return t('parent.report.clause.topics', { count: c.count });
      case 'tasksAll':
        return t('parent.report.clause.tasksAll', { count: c.count });
      case 'tasksSome':
        return t('parent.report.clause.tasksSome', { onTime: c.onTime, total: c.total });
    }
  };

  const sentence =
    clauses.length === 0
      ? t('parent.report.summaryQuiet')
      : t('parent.report.summary', {
          name,
          clauses: joinList(
            clauses.map(say),
            t('parent.report.clauseSeparator'),
            t('parent.report.clauseLast'),
          ),
        });

  return (
    <View className="gap-1 rounded-[18px] bg-raised px-3.5 py-3">
      <Text className="font-sans-semibold">{sentence}</Text>
      <Text className="text-xs text-muted">
        {t('parent.report.ownOnly', { name, nameGen: genitiveAz(name) })}
      </Text>
    </View>
  );
}
