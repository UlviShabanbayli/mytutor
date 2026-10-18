import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useClassAssignments } from '@/features/teacher/queries';
import type { TeacherClass } from '@/features/teacher/types';
import { AssignmentCard } from './AssignmentCard';

type ClassAssignmentsProps = { cls: TeacherClass };

/** The "Tapşırıqlar" section of a class, newest first. */
export function ClassAssignments({ cls }: ClassAssignmentsProps) {
  const { t } = useTranslation();
  const list = useClassAssignments(cls.id);

  if (list.isPending) return <LoadingState />;
  if (list.isError) return <ErrorState onRetry={() => void list.refetch()} />;
  if (list.data.length === 0)
    return (
      <EmptyState
        title={t('teacher.class.emptyAssignments')}
        description={t('teacher.class.emptyAssignmentsBody')}
      />
    );
  return (
    <>
      {list.data.map((a) => (
        <AssignmentCard key={a.id} assignment={a} cls={cls} />
      ))}
    </>
  );
}
