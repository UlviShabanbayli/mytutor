import { router } from 'expo-router';
import { useIsMutating } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SubmissionView } from '@mytutor/types';
import { Banner, Button, EmptyState, StatusPill } from '@/components/ui';
import { SAVE_GRADE_KEY, useSaveGrade } from '@/features/teacher/mutations';
import { useIsOnline } from '@/features/teacher/online';
import { firstName } from '@/features/teacher/people';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { AiReviewCard } from './AiReviewCard';
import { CommentBox } from './CommentBox';
import { GradeControl } from './GradeControl';
import { HomeworkPages } from './HomeworkPages';
import { StudentStepper } from './StudentStepper';
import { TeacherScreen } from './TeacherScreen';

/** Homework is graded out of 10. */
const OUT_OF = 10;

type Saved = Record<string, { grade: number; comment: string }>;

type GradeSessionProps = { header: ReactNode; submissions: SubmissionView[]; classId: string };

/**
 * Checking a homework student by student (M4). A grade is a demo event kept on the phone: the
 * student, the parent and Today show it. Offline the save waits and goes out by itself.
 */
export function GradeSession({ header, submissions, classId }: GradeSessionProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const online = useIsOnline();
  const save = useSaveGrade();
  const [saved, setSaved] = useState<Saved>({});
  // The session keeps the order it started with, while saved grades move students in the list.
  const [order] = useState(() => submissions.map((s) => s.id));
  const list = order.flatMap((id) => submissions.find((s) => s.id === id) ?? []);
  const firstOpen = list.findIndex((s) => s.grade === null);
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [finished, setFinished] = useState(false);
  const known = (s: SubmissionView | undefined) =>
    s
      ? (saved[s.id] ?? (s.grade === null ? null : { grade: s.grade.score, comment: s.comment }))
      : null;
  const sub = list[index];
  const current = known(sub);
  const [grade, setGrade] = useState(current?.grade ?? sub?.ai?.suggested.score ?? 0);
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
    const target = list[next];
    if (!target) return;
    const was = known(target);
    setIndex(next);
    setGrade(was?.grade ?? target.ai?.suggested.score ?? 0);
    setComment(was?.comment ?? target.comment);
  };
  const back = () => router.replace({ pathname: '/teacher/class/[id]', params: { id: classId } });

  if (list.length === 0 || !sub)
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

  const isLast = index === list.length - 1;
  const submit = () => {
    save.mutate({
      assignmentId: sub.assignmentId,
      studentId: sub.studentId,
      score: grade,
      outOf: sub.ai?.suggested.max ?? OUT_OF,
      comment,
    });
    setSaved((s) => ({ ...s, [sub.id]: { grade, comment } }));
    if (isLast) setFinished(true);
    else go(index + 1);
  };
  const meta = t('teacher.grade.position', {
    index: index + 1,
    total: list.length,
    when: sub.submittedAt ? f.dayAt(new Date(sub.submittedAt)) : '',
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
        prevName={list[index - 1]?.studentName}
        nextName={list[index + 1]?.studentName}
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
      {sub.ai ? <AiReviewCard ai={sub.ai} source={sub.source} /> : null}
      <GradeControl
        value={grade}
        suggested={sub.ai?.suggested.score ?? null}
        max={sub.ai?.suggested.max ?? OUT_OF}
        onChange={setGrade}
      />
      <CommentBox name={firstName(sub.studentName)} value={comment} onChange={setComment} />
    </TeacherScreen>
  );
}
