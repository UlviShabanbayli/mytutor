import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MasteryGrid } from '@/components/teacher/MasteryGrid';
import { MissedRow } from '@/components/teacher/MissedRow';
import { NoteLine } from '@/components/teacher/NoteLine';
import { ScoutCard } from '@/components/teacher/ScoutCard';
import { SectionHeading } from '@/components/teacher/SectionHeading';
import { StatTile } from '@/components/teacher/StatTile';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { hardestTopicIndex, reviewSuggestion } from '@/features/teacher/insights';
import { firstName } from '@/features/teacher/people';
import { useClassInsights, useTeacherClass } from '@/features/teacher/queries';

/** Class report (design t-insights, M7): only students who allowed it are shown. */
export default function InsightsScreen() {
  const { t } = useTranslation();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const cls = useTeacherClass(classId);
  const insights = useClassInsights(classId);
  const data = insights.data;
  const header = (
    <TeacherHeader
      title={t('teacher.insights.title')}
      subtitle={
        cls.data && data
          ? t('teacher.insights.subtitle', {
              class: cls.data.shortName,
              unit: data.unit,
              days: data.days,
            })
          : cls.data?.name
      }
    />
  );

  if (insights.isError)
    return (
      <TeacherScreen header={header}>
        <ErrorState onRetry={() => void insights.refetch()} />
      </TeacherScreen>
    );
  if (insights.isPending)
    return (
      <TeacherScreen header={header}>
        <LoadingState />
      </TeacherScreen>
    );
  if (!data || data.rows.length === 0)
    return (
      <TeacherScreen header={header}>
        <EmptyState
          moment="weakSpot"
          title={t('teacher.insights.emptyTitle')}
          description={t('teacher.insights.emptyBody')}
        />
      </TeacherScreen>
    );

  const hardest = hardestTopicIndex(data.rows, data.topics.length);
  const suggestion = reviewSuggestion(data.rows, data.topics);

  return (
    <TeacherScreen header={header} contentClassName="gap-2.5">
      <View className="flex-row gap-2">
        <StatTile
          value={`${Math.round(data.completion * 100)}%`}
          label={t('teacher.insights.statCompletion')}
        />
        <StatTile
          value={`${data.activeThisWeek}/${data.studentCount}`}
          label={t('teacher.insights.statActive')}
        />
        <StatTile
          value={hardest === null ? '—' : (data.topics[hardest] ?? '—')}
          label={t('teacher.insights.statHardest')}
        />
      </View>
      <NoteLine icon="eye">
        {t('teacher.insights.privacy', { shown: data.rows.length, hidden: data.hiddenCount })}
      </NoteLine>
      <MasteryGrid topics={data.topics} rows={data.rows} />
      {suggestion ? (
        <ScoutCard
          topicId={suggestion.topicId}
          names={suggestion.students.map((s) => firstName(s.name))}
          onAssign={() =>
            router.push({
              pathname: '/teacher/assign',
              params: {
                classId,
                kind: 'test',
                topic: suggestion.topicId,
                students: suggestion.students.map((s) => s.studentId).join(','),
              },
            })
          }
        />
      ) : null}
      <SectionHeading className="pt-0.5">{t('teacher.insights.missed')}</SectionHeading>
      {data.missed.map((m) => (
        <MissedRow key={m.id} item={m} />
      ))}
    </TeacherScreen>
  );
}
