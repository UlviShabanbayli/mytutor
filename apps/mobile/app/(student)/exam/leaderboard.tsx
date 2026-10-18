import { LeaderboardView } from '@/components/exam/LeaderboardView';
import { Screen } from '@/components/ui';

/** Sınaq reytinqi: opt-in, nicknames only. */
export default function ExamLeaderboardScreen() {
  return (
    <Screen scroll={false} className="gap-2.5 pb-2">
      <LeaderboardView />
    </Screen>
  );
}
