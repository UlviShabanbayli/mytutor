import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { AssignmentKind, Audience } from '@mytutor/types';
import { AssignForm } from '@/components/teacher/AssignForm';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { ErrorState, LoadingState } from '@/components/ui';
import {
  useClassMembers,
  useTeacherClass,
  useTeacherClasses,
  useUnit,
} from '@/features/teacher/queries';

const KINDS: AssignmentKind[] = ['lesson', 'test', 'homework', 'mock'];

type Params = { classId?: string; kind?: string; topic?: string; students?: string };

/**
 * Give an assignment (design t-assign-new). Opened from a class, or from the class report with
 * `kind`, `topic` and `students` filled in (Vızı's suggestion turned into an assignment).
 */
export default function AssignScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<Params>();
  const classes = useTeacherClasses();
  const classId = params.classId ?? classes.data?.[0]?.id ?? '';
  const cls = useTeacherClass(classId);
  const members = useClassMembers(classId);
  const unit = useUnit();
  const header = (
    <TeacherHeader leading="close" title={t('teacher.assign.title')} subtitle={cls.data?.name} />
  );

  if (cls.isError || members.isError || unit.isError || classes.isError)
    return (
      <TeacherScreen header={header}>
        <ErrorState onRetry={() => void cls.refetch()} />
      </TeacherScreen>
    );
  if (!cls.data || !members.data || !unit.data)
    return (
      <TeacherScreen header={header}>
        <LoadingState />
      </TeacherScreen>
    );

  const topics = unit.data.topics;
  const students = params.students?.split(',').filter(Boolean) ?? [];
  const audience: Audience =
    students.length > 0 ? { type: 'students', ids: students } : { type: 'class' };
  const kind = KINDS.find((k) => k === params.kind) ?? 'test';
  const topic = topics.find((x) => x.id === params.topic)?.id ?? topics[0]?.id ?? '';

  return (
    <AssignForm
      header={header}
      cls={cls.data}
      members={members.data}
      unit={unit.data}
      initial={{ kind, topic, audience }}
    />
  );
}
