import { DailyGoalCard } from '@/components/today/DailyGoalCard';
import { FirstDayContent } from '@/components/today/FirstDayContent';
import { FirstDayGreeting } from '@/components/today/FirstDayGreeting';
import { OfflineCard } from '@/components/today/OfflineCard';
import { RegularContent } from '@/components/today/RegularContent';
import { TodayError } from '@/components/today/TodayError';
import { TodayHeader } from '@/components/today/TodayHeader';
import { TodaySkeleton } from '@/components/today/TodaySkeleton';
import { Screen, SkeletonSwap } from '@/components/ui';
import { useFirstDay, useMotivation, useOnline, useVisitTracking } from '@/features/today/hooks';
import { useToday } from '@/features/today/queries';
import { useTodayHydrated } from '@/features/today/store';

/** "Bu gün": the one answer to "what do I do now?" (architecture Ş2, P1, P2). */
export default function TodayScreen() {
  const today = useToday();
  const hydrated = useTodayHydrated();
  const firstDay = useFirstDay(today.data);
  const online = useOnline();
  const motivation = useMotivation(firstDay);
  useVisitTracking(hydrated);

  const loading = !hydrated || today.isPending;
  const data = today.data;

  return (
    <Screen className="gap-3 pt-2">
      <TodayHeader streak={motivation.streak} points={motivation.points} />
      {!online ? <OfflineCard withMascot={!loading && !today.isError && !firstDay} /> : null}
      {!loading && (today.isError || !data) ? (
        <TodayError onRetry={() => void today.refetch()} />
      ) : (
        // transitions.skeleton C: the day's skeleton cross-fades into it when it has loaded.
        <SkeletonSwap pending={loading} skeleton={<TodaySkeleton />} className="gap-3">
          {data ? (
            <>
              {firstDay ? (
                <FirstDayGreeting
                  name={data.studentName}
                  minutes={data.firstStep.firstCellMinutes}
                />
              ) : null}
              <DailyGoalCard motivation={motivation} firstDay={firstDay} />
              {firstDay ? (
                <FirstDayContent today={data} />
              ) : (
                <RegularContent today={data} online={online} />
              )}
            </>
          ) : null}
        </SkeletonSwap>
      )}
    </Screen>
  );
}
