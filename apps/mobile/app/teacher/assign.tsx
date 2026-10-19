import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AssignForm } from '@/components/teacher/AssignForm';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { ErrorState, LoadingState } from '@/components/ui';
import { useClassMembers, useTeacherClass, useTopics, useUnit } from '@/features/teacher/queries';
import type { AssignmentKind, Audience } from '@/features/teacher/types';

const KINDS: AssignmentKind[] = ['lesson', 'test', 'homework', 'mock'];

type Params = { classId?: string; kind?: string; topic?: string; students?: string };

/**
 * Give an assignment (design t-assign-new). Opened from a class, or from the class report with
 * `kind`, `topic` and `students` filled in (Vızı's suggestion turned into an assignment).
 */
export default function AssignScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<Params>();
  const classId = params.classId ?? '7b';
  const cls = useTeacherClass(classId);
  const members = useClassMembers(classId);
  const unit = useUnit();
  const topics = useTopics();
  const header = (
    <TeacherHeader leading="close" title={t('teacher.assign.title')} subtitle={cls.data?.name} />
  );

  if (cls.isError || members.isError || unit.isError || topics.isError)
    return (
      <TeacherScreen header={header}>
        <ErrorState onRetry={() => void cls.refetch()} />
      </TeacherScreen>
    );
  if (!cls.data || !members.data || !unit.data || !topics.data)
    return (
      <TeacherScreen header={header}>
        <LoadingState />
      </TeacherScreen>
    );

  const unitTopics = topics.data.filter((x) => unit.data.topicIds.includes(x.id));
  const students = params.students?.split(',').filter(Boolean) ?? [];
  const audience: Audience =
    students.length > 0 ? { type: 'students', ids: students } : { type: 'class' };
  const kind = KINDS.find((k) => k === params.kind) ?? 'test';

  return (
    <AssignForm
      header={header}
      cls={cls.data}
      members={members.data}
      unit={unit.data}
      topics={unitTopics}
      initial={{ kind, topic: params.topic ?? unitTopics[0]?.id ?? '', audience }}
    />
  );
}
