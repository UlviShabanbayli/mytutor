import { useTranslation } from 'react-i18next';
import { ErrorState, SkeletonSwap } from '@/components/ui';
import { DEMO_DAYS_LEFT } from '@/features/exam/demo';
import { examDaysLeft, type ExamGoal } from '@/features/exam/goal';
import { daysLabel, minutesLabel } from '@/features/exam/labels';
import { useExamHome } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import { CountdownHero } from './CountdownHero';
import { ExamSkeleton } from './ExamSkeleton';
import { NextMockCard } from './NextMockCard';
import { OfflineNotice } from './OfflineNotice';
import { ReadinessCard } from './ReadinessCard';
import { TodayPlanSection } from './TodayPlanSection';
import { WeakPreviewCard } from './WeakPreviewCard';

type ExamHomeViewProps = {
  goal: ExamGoal;
  offline: boolean;
};

/**
 * The exam tab with a goal: days left, readiness, today's steps, weak spots and the next mock.
 * Offline it shows what is saved on the phone and keeps the rated mock for later.
 */
export function ExamHomeView({ goal, offline }: ExamHomeViewProps) {
  const { t } = useTranslation();
  const query = useExamHome(goal);
  const target = useExamStore((s) => s.target);
  const minutesPerDay = useExamStore((s) => s.minutesPerDay);
  const registered = useExamStore((s) => s.registeredMocks);

  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  // transitions.skeleton C: the plan's skeleton cross-fades into it when it has loaded (both
  // returns render the same SkeletonSwap, so it knows the skeleton was there).
  if (query.isPending)
    return (
      <SkeletonSwap pending skeleton={<ExamSkeleton />}>
        {null}
      </SkeletonSwap>
    );

  const { readiness, plan, weakSpots, nextMock } = query.data;
  const minutes = minutesLabel(t, minutesPerDay);
  const planLine =
    target === 'unknown'
      ? t('exam.home.heroMinutes', { minutes })
      : t('exam.home.heroTarget', { target: t(`exam.targets.${target}`), minutes });

  return (
    <SkeletonSwap pending={false} skeleton={null} className="gap-2.5">
      {offline ? <OfflineNotice /> : null}
      <CountdownHero
        days={daysLabel(t, examDaysLeft(goal, new Date(), DEMO_DAYS_LEFT))}
        plan={planLine}
        note={
          offline ? t('exam.home.heroUpdated', { time: plan.updatedAt }) : t('exam.home.heroSource')
        }
        showMascot={!offline}
      />
      {offline ? null : <ReadinessCard subjects={readiness} />}
      <TodayPlanSection steps={plan.today} offline={offline} />
      {offline || weakSpots.spots.length === 0 ? null : <WeakPreviewCard spots={weakSpots.spots} />}
      <NextMockCard
        mock={nextMock}
        registered={registered.includes(nextMock.id)}
        offline={offline}
      />
    </SkeletonSwap>
  );
}
