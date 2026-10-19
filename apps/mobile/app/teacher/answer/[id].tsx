import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AnswerEditor } from '@/components/teacher/AnswerEditor';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { ErrorState, LoadingState } from '@/components/ui';
import { shortName } from '@/features/teacher/people';
import { useInboxQuestion, useTeacherClasses, useTopics } from '@/features/teacher/queries';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

/** Answer a student's question by checking the AI's solution (design t-answer). */
export default function AnswerScreen() {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = useInboxQuestion(id);
  const classes = useTeacherClasses();
  const topics = useTopics();
  const q = question.data;
  const cls = classes.data?.find((c) => c.id === q?.classId);
  const header = (
    <TeacherHeader
      title={t('teacher.answer.title')}
      subtitle={
        q
          ? t('teacher.answer.subtitle', {
              name: shortName(q.studentName),
              class: cls?.shortName ?? '',
              wait: f.wait(q.askedAt),
            })
          : undefined
      }
    />
  );

  if (question.isError || topics.isError)
    return (
      <TeacherScreen header={header}>
        <ErrorState onRetry={() => void question.refetch()} />
      </TeacherScreen>
    );
  if (!q || !topics.data)
    return (
      <TeacherScreen header={header}>
        <LoadingState />
      </TeacherScreen>
    );
  return <AnswerEditor key={q.id} header={header} question={q} topics={topics.data} />;
}
