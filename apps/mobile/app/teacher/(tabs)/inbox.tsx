import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InboxCard } from '@/components/teacher/InboxCard';
import { LockedNote } from '@/components/teacher/LockedNote';
import { NoticesButton } from '@/components/teacher/NoticesButton';
import { SectionHeading } from '@/components/teacher/SectionHeading';
import { SurfaceTabs } from '@/components/teacher/SurfaceTabs';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { TeacherTabHeader } from '@/components/teacher/TeacherTabHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useTeacherClasses, useTeacherInbox, useTeacherProfile } from '@/features/teacher/queries';

/** Student questions with the AI's first solution (design t-inbox, M6). */
export default function TeacherInboxScreen() {
  const { t } = useTranslation();
  const inbox = useTeacherInbox();
  const classes = useTeacherClasses();
  const profile = useTeacherProfile();
  const [queue, setQueue] = useState<'mine' | 'shared'>('mine');
  const verified = profile.data?.verification === 'verified';
  const waiting = inbox.data?.filter((q) => !q.approved) ?? [];
  const answered = inbox.data?.filter((q) => q.approved) ?? [];
  const cls = (id: string | null) => classes.data?.find((c) => c.id === id);
  const card = (q: (typeof waiting)[number], i: number) => (
    <InboxCard
      key={q.id}
      question={q}
      index={i}
      className={cls(q.classId)?.shortName ?? ''}
      book={cls(q.classId)?.book ?? ''}
    />
  );

  return (
    <TeacherScreen
      header={<TeacherTabHeader title={t('teacher.inbox.title')} action={<NoticesButton />} />}
      contentClassName="gap-2.5"
    >
      <SurfaceTabs
        accessibilityLabel={t('teacher.inbox.queue')}
        value={queue}
        onChange={setQueue}
        tabs={[
          { value: 'mine', label: t('teacher.inbox.mine', { count: waiting.length }) },
          { value: 'shared', label: t('teacher.inbox.shared'), locked: !verified },
        ]}
      />
      {verified ? null : (
        <LockedNote
          text={t('teacher.inbox.sharedLocked')}
          actionLabel={t('teacher.inbox.verify')}
          onPress={() => router.push('/teacher/verify')}
        />
      )}
      {inbox.isPending ? (
        <LoadingState />
      ) : inbox.isError ? (
        <ErrorState onRetry={() => void inbox.refetch()} />
      ) : queue === 'shared' || waiting.length === 0 ? (
        <EmptyState
          moment="correct"
          title={t('teacher.inbox.emptyTitle')}
          description={t('teacher.inbox.emptyBody')}
        />
      ) : (
        waiting.map(card)
      )}
      {queue === 'mine' && answered.length > 0 ? (
        <>
          <SectionHeading className="pt-1">
            {t('teacher.inbox.answered', { count: answered.length })}
          </SectionHeading>
          {answered.map(card)}
        </>
      ) : null}
    </TeacherScreen>
  );
}
