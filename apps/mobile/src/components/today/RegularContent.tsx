import { useRecommendedTopic } from '@/features/tests/queries';
import { useContinueItem } from '@/features/today/hooks';
import { withRecommendedTest } from '@/features/today/plan';
import type { TodayData } from '@/features/today/types';
import { AssignmentDueRow } from './AssignmentDueRow';
import { ContinueCard } from './ContinueCard';
import { OnlineOnlyNote } from './OnlineOnlyNote';
import { PlanEmpty } from './PlanEmpty';
import { PlanList } from './PlanList';

type RegularContentProps = {
  today: TodayData;
  online: boolean;
};

/**
 * Below the goal card on a usual day: "Davam et", the day's plan (with the real recommended
 * test from the tests API) and class assignments due. Empty blocks are hidden (Ş2).
 */
export function RegularContent({ today, online }: RegularContentProps) {
  const continueItem = useContinueItem(today.unfinishedLesson);
  const recommended = useRecommendedTopic();
  const plan = withRecommendedTest(today.plan, recommended.data);
  const empty = !continueItem && plan.length === 0 && today.assignments.length === 0;

  return (
    <>
      {continueItem ? <ContinueCard item={continueItem} /> : null}
      {empty ? <PlanEmpty /> : <PlanList steps={plan} />}
      {online ? (
        today.assignments.map((a) => <AssignmentDueRow key={a.id} assignment={a} />)
      ) : (
        <OnlineOnlyNote />
      )}
    </>
  );
}
