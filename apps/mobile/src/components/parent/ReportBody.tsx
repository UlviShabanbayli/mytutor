import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatDuration } from '@/features/parent/format';
import type { WeekReport } from '@mytutor/types';
import type { ChildView } from '@/features/parent/types';
import { ActiveDaysCard } from './ActiveDaysCard';
import { NewTopicsCard } from './NewTopicsCard';
import { ReportStatusTiles } from './ReportStatusTiles';
import { ReportSummaryCard } from './ReportSummaryCard';
import { ReportTile, TileValue } from './ReportTile';
import { TeacherNoteCard } from './TeacherNoteCard';
import { WeakSpotsCard } from './WeakSpotsCard';

type ReportBodyProps = { child: ChildView; report: WeekReport };

/** One week of the report (V2): summary, time, accuracy, days, topics, status, notes. */
export function ReportBody({ child, report }: ReportBodyProps) {
  const { t } = useTranslation();
  const { correct, total } = report.answers;
  const accuracy =
    total > 0 ? t('parent.percent', { value: Math.round((correct / total) * 100) }) : '—';
  const accuracyNote =
    total > 0 ? t('parent.report.accuracyOf', { correct, total }) : t('parent.report.accuracyNone');
  const time = formatDuration(t, report.minutes, 'short');
  const previous =
    report.previousMinutes === null
      ? null
      : t('parent.report.timePrevious', {
          value: formatDuration(t, report.previousMinutes, 'short'),
        });

  return (
    <View className="gap-2">
      <ReportSummaryCard name={child.name} report={report} />
      <View className="flex-row gap-2">
        <ReportTile
          icon="clock"
          label={t('parent.report.time')}
          accessibilityLabel={[t('parent.report.timeAria'), time, previous]
            .filter(Boolean)
            .join(', ')}
          className="flex-1"
        >
          <TileValue>{time}</TileValue>
          {previous ? <Text className="text-xs text-muted">{previous}</Text> : null}
        </ReportTile>
        <ReportTile
          icon="target"
          label={t('parent.report.accuracy')}
          accessibilityLabel={`${t('parent.report.accuracyAria')}, ${accuracy}, ${accuracyNote}`}
          className="flex-1"
        >
          <TileValue>{accuracy}</TileValue>
          <Text className="text-xs text-muted">{accuracyNote}</Text>
        </ReportTile>
      </View>
      <ActiveDaysCard days={report.activeDays} weekStart={report.weekStart} />
      <NewTopicsCard topics={report.newTopics} completedUnit={report.completedUnit} />
      <ReportStatusTiles
        name={child.name}
        report={report}
        sharesAssignments={child.grants.includes('assignments')}
        sharesExam={child.grants.includes('exam')}
      />
      {report.weakSpots.length > 0 ? (
        <WeakSpotsCard name={child.name} topics={report.weakSpots} />
      ) : null}
      {report.teacherNote ? (
        <TeacherNoteCard
          teacherName={report.teacherNote.teacherName}
          text={report.teacherNote.text}
        />
      ) : null}
    </View>
  );
}
