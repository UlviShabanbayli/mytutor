import { useTranslation } from 'react-i18next';
import { ExamEmptyView } from '@/components/exam/ExamEmptyView';
import { ExamHomeView } from '@/components/exam/ExamHomeView';
import { ExamLockedView } from '@/components/exam/ExamLockedView';
import { ExamTabHeader } from '@/components/exam/ExamTabHeader';
import { Screen } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { DEMO_DAYS_LEFT } from '@/features/exam/demo';
import { examDaysLeft, examGoalOf } from '@/features/exam/goal';
import { daysLabel, goalLabel } from '@/features/exam/labels';
import { useExamState } from '@/features/exam/useExamState';

/** İmtahan tab: no goal yet, the plan home (online or offline), or the premium lock. */
export default function ExamScreen() {
  const { t } = useTranslation();
  const goal = examGoalOf(useAppStore((s) => s.profile.goal));
  const { locked, offline } = useExamState();

  return (
    <Screen className="gap-2.5">
      <ExamTabHeader
        label={goal ? goalLabel(t, goal) : t('exam.tab.noGoal')}
        showActions={goal !== null}
      />
      {goal === null ? (
        <ExamEmptyView />
      ) : locked ? (
        <ExamLockedView days={daysLabel(t, examDaysLeft(goal, new Date(), DEMO_DAYS_LEFT))} />
      ) : (
        <ExamHomeView goal={goal} offline={offline} />
      )}
    </Screen>
  );
}
