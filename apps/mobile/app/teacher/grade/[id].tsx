import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradeSession } from '@/components/teacher/GradeSession';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useAssignment, useSubmissions, useTeacherClass } from '@/features/teacher/queries';

/** Check a homework (design t-grade): handwriting, the AI's first look, grade and comment. */
export default function GradeScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assignment = useAssignment(id);
  const submissions = useSubmissions(id);
  const cls = useTeacherClass(assignment.data?.classId ?? '');
  const a = assignment.data;
  const header = (
    <TeacherHeader
      title={a ? t('teacher.grade.title', { topic: a.topic?.number ?? a.title }) : ''}
      subtitle={
        a && cls.data
          ? t('teacher.grade.subtitle', { class: cls.data.shortName, count: a.toGrade })
          : undefined
      }
    />
  );

  if (assignment.isError || submissions.isError)
    return (
      <TeacherScreen header={header}>
        <ErrorState
          onRetry={() => {
            void assignment.refetch();
            void submissions.refetch();
          }}
        />
      </TeacherScreen>
    );
  if (a === null)
    return (
      <TeacherScreen header={header}>
        <EmptyState
          title={t('teacher.grade.emptyTitle')}
          description={t('teacher.grade.emptyBody')}
        />
      </TeacherScreen>
    );
  // The session keeps its own place, so it starts only once the list is in.
  if (!a || !submissions.data)
    return (
      <TeacherScreen header={header}>
        <LoadingState />
      </TeacherScreen>
    );
  return <GradeSession header={header} submissions={submissions.data} classId={a.classId} />;
}
