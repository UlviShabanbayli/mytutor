import { GoalDoneView } from '@/components/today/GoalDoneView';
import { LoadingState, Screen } from '@/components/ui';
import { useMotivation } from '@/features/today/hooks';

/** The daily goal reached (opened when a lesson or test completes it, or from the goal card). */
export default function StudentGoalDoneScreen() {
  const motivation = useMotivation(false);
  const data = motivation.data;

  if (!data) {
    return (
      <Screen scroll={false}>
        <LoadingState />
      </Screen>
    );
  }
  return (
    <GoalDoneView
      flightDay={motivation.flightDay}
      minutes={motivation.progress.goal}
      cells={data.todayCells}
      points={data.todayPoints}
      accuracy={data.todayAccuracy}
    />
  );
}
