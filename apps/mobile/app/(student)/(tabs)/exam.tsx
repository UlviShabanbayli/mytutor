import { useTranslation } from 'react-i18next';
import { ExamEmptyView } from '@/components/exam/ExamEmptyView';
import { ExamHomeView } from '@/components/exam/ExamHomeView';
import { ExamLockedView } from '@/components/exam/ExamLockedView';
import { ExamSkeleton } from '@/components/exam/ExamSkeleton';
import { ExamTabActions } from '@/components/exam/ExamTabActions';
import { CollapsingTitle, ErrorState, SkeletonSwap } from '@/components/ui';
import { daysLabel, goalLabel } from '@/features/exam/labels';
import { useExamGoal } from '@/features/exam/queries';
import { useExamState } from '@/features/exam/useExamState';

/**
 * İmtahan tab: no goal yet, the plan home (online or offline), or the premium lock. The goal is
 * the student's own in the demo world. The large title shrinks into a bar as the page scrolls
 * (micro.header B).
 */
export default function ExamScreen() {
  const { t } = useTranslation();
  const query = useExamGoal();
  const { locked, offline } = useExamState();
  const goal = query.data?.goal ?? null;
  const overline = query.data ? (goal ? goalLabel(t, goal) : t('exam.tab.noGoal')) : undefined;

  return (
    <CollapsingTitle
      // "Qəbul · II qrup" (in CAPS), or "Hədəf seçilməyib" before a goal exists.
      overline={overline}
      title={t('exam.tab.title')}
      actions={goal !== null ? <ExamTabActions /> : undefined}
      className="gap-2.5 pt-2.5"
    >
      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.isPending ? (
        // The same skeleton as the plan's, so the home cross-fades from it (transitions.skeleton C).
        <SkeletonSwap pending skeleton={<ExamSkeleton />}>
          {null}
        </SkeletonSwap>
      ) : goal === null ? (
        <ExamEmptyView />
      ) : locked ? (
        <ExamLockedView days={daysLabel(t, query.data.daysLeft)} />
      ) : (
        <ExamHomeView daysLeft={query.data.daysLeft} offline={offline} />
      )}
    </CollapsingTitle>
  );
}
