import { router } from 'expo-router';
import { useIsMutating } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banner, Button, EmptyState, StatusPill } from '@/components/ui';
import { useIsOnline } from '@/features/teacher/online';
import { firstName } from '@/features/teacher/people';
import { SAVE_GRADE_KEY, useSaveGrade } from '@/features/teacher/queries';
import type { Submission } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { AiReviewCard } from './AiReviewCard';
import { CommentBox } from './CommentBox';
import { GradeControl } from './GradeControl';
import { HomeworkPages } from './HomeworkPages';
import { StudentStepper } from './StudentStepper';
import { TeacherScreen } from './TeacherScreen';

type Saved = Record<string, { grade: number; comment: string }>;

type GradeSessionProps = { header: ReactNode; submissions: Submission[]; classId: string };

/**
 * Checking a homework student by student (M4). Grades are kept on the phone first: offline the
 * save waits and goes out by itself when the connection returns.
 */
export function GradeSession({ header, submissions, classId }: GradeSessionProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const online = useIsOnline();
  const save = useSaveGrade();
  const [saved, setSaved] = useState<Saved>({});
  const firstOpen = submissions.findIndex((s) => s.grade === null);
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [finished, setFinished] = useState(false);
  const sub = submissions[index];
  const current = sub
    ? (saved[sub.id] ?? (sub.grade === null ? null : { grade: sub.grade, comment: sub.comment }))
    : null;
  const [grade, setGrade] = useState(current?.grade ?? sub?.ai.suggested ?? 0);
  const [comment, setComment] = useState(current?.comment ?? sub?.comment ?? '');
  const waiting = useIsMutating({ mutationKey: SAVE_GRADE_KEY });
  const banner = online ? null : (
    <Banner
      kind="offline"
      message={
        waiting > 0
          ? `${t('teacher.grade.offline')} ${t('teacher.grade.waiting', { count: waiting })}`
          : t('teacher.grade.offline')
      }
    />
  );

  const go = (next: number) => {
    const target = submissions[next];
    if (!target) return;
    const known =
      saved[target.id] ??
      (target.grade === null ? null : { grade: target.grade, comment: target.comment });
    setIndex(next);
    setGrade(known?.grade ?? target.ai.suggested);
    setComment(known?.comment ?? target.comment);
  };
  const back = () => router.replace({ pathname: '/teacher/class/[id]', params: { id: classId } });

  if (submissions.length === 0 || !sub)
    return (
      <TeacherScreen header={header}>
        <EmptyState
          title={t('teacher.grade.emptyTitle')}
          description={t('teacher.grade.emptyBody')}
        />
      </TeacherScreen>
    );
  if (finished)
    return (
      <TeacherScreen header={header}>
        {banner}
        <EmptyState
          moment="lessonDone"
          title={t('teacher.grade.doneTitle')}
          description={online ? t('teacher.grade.doneBody') : t('teacher.grade.doneOffline')}
          actionLabel={t('teacher.grade.backToClass')}
          onAction={back}
        />
      </TeacherScreen>
    );

  const isLast = index === submissions.length - 1;
  const submit = () => {
    save.mutate({ submissionId: sub.id, grade, comment });
    setSaved((s) => ({ ...s, [sub.id]: { grade, comment } }));
    if (isLast) setFinished(true);
    else go(index + 1);
  };
  const meta = t('teacher.grade.position', {
    index: index + 1,
    total: submissions.length,
    when: f.dayAt(new Date(sub.submittedAt)),
  });

  return (
    <TeacherScreen
      header={header}
      contentClassName="gap-2.5"
      footer={
        <Button
          icon={isLast ? 'check' : 'chevron'}
          label={isLast ? t('teacher.grade.saveFinish') : t('teacher.grade.saveNext')}
          onPress={submit}
        />
      }
    >
      {banner}
      <StudentStepper
        name={sub.studentName}
        meta={meta}
        prevName={submissions[index - 1]?.studentName}
        nextName={submissions[index + 1]?.studentName}
        onPrev={() => go(index - 1)}
        onNext={() => go(index + 1)}
      />
      {current ? (
        <StatusPill
          kind="teacher"
          label={t('teacher.grade.graded', { grade: current.grade })}
          className="self-center"
        />
      ) : null}
      <HomeworkPages name={sub.studentName} pages={sub.pages} />
      <AiReviewCard submission={sub} />
      <GradeControl value={grade} suggested={sub.ai.suggested} onChange={setGrade} />
      <CommentBox name={firstName(sub.studentName)} value={comment} onChange={setComment} />
    </TeacherScreen>
  );
}
