import { useTranslation } from 'react-i18next';
import { ExamEmptyView } from '@/components/exam/ExamEmptyView';
import { ExamHomeView } from '@/components/exam/ExamHomeView';
import { ExamLockedView } from '@/components/exam/ExamLockedView';
import { ExamTabActions } from '@/components/exam/ExamTabActions';
import { CollapsingTitle } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { DEMO_DAYS_LEFT } from '@/features/exam/demo';
import { examDaysLeft, examGoalOf } from '@/features/exam/goal';
import { daysLabel, goalLabel } from '@/features/exam/labels';
import { useExamState } from '@/features/exam/useExamState';

/**
 * İmtahan tab: no goal yet, the plan home (online or offline), or the premium lock. The large
 * title shrinks into a bar as the page scrolls (micro.header B).
 */
export default function ExamScreen() {
  const { t } = useTranslation();
  const goal = examGoalOf(useAppStore((s) => s.profile.goal));
  const { locked, offline } = useExamState();

  return (
    <CollapsingTitle
      // "Qəbul · II qrup" (in CAPS), or "Hədəf seçilməyib" before a goal exists.
      overline={goal ? goalLabel(t, goal) : t('exam.tab.noGoal')}
      title={t('exam.tab.title')}
      actions={goal !== null ? <ExamTabActions /> : undefined}
      className="gap-2.5 pt-2.5"
    >
      {goal === null ? (
        <ExamEmptyView />
      ) : locked ? (
        <ExamLockedView days={daysLabel(t, examDaysLeft(goal, new Date(), DEMO_DAYS_LEFT))} />
      ) : (
        <ExamHomeView goal={goal} offline={offline} />
      )}
    </CollapsingTitle>
  );
}
