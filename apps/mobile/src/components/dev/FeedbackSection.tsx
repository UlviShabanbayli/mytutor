import { useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { RankSeal } from '@/components/me/RankSeal';
import { RankUpTitle } from '@/components/me/RankUpTitle';
import { CellChange } from '@/components/study/CellChange';
import { PointsCounter } from '@/components/tests/PointsCounter';
import { PointsDrops } from '@/components/tests/PointsDrops';
import { ResultHero } from '@/components/tests/ResultHero';
import type { ScoreMark } from '@/components/tests/ScoreHexRing';
import { usePointsFlight } from '@/components/tests/usePointsFlight';
import { DailyGoalCard } from '@/components/today/DailyGoalCard';
import { GoalDoneProgress } from '@/components/today/GoalDoneProgress';
import { Button, StatusPill } from '@/components/ui';
import { goalProgress, weekCells } from '@/features/today/goal';
import { GallerySection } from './GallerySection';

const MARKS: ScoreMark[] = ['ok', 'ok', 'ok', 'review', 'ok', 'ok', 'review', 'ok', 'ok', 'ok'];

/** A moment with a replay button: each press mounts it again. */
function Replay({ title, children }: { title: string; children: (run: number) => ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <GallerySection title={title}>
      {children(run)}
      <Button label="Replay" variant="secondary" size="md" onPress={() => setRun((n) => n + 1)} />
    </GallerySection>
  );
}

/** feedback.streak C and goal C on the real goal card: each replay raises the numbers. */
function GoalCardDemo() {
  const [streak, setStreak] = useState(12);
  const [minutes, setMinutes] = useState(20);
  const progress = goalProgress(minutes, 20);
  const motivation = {
    streak,
    points: 1240,
    progress,
    week: weekCells([true, true, true, true, true, true, true], 6, progress),
    flightDay: streak,
    data: undefined,
  };
  const replay = () => {
    setMinutes(15);
    setTimeout(() => {
      setStreak((n) => n + 1);
      setMinutes(20);
    }, 60);
  };
  return (
    <GallerySection title="feedback.streak C + goal C (goal card)">
      <DailyGoalCard motivation={motivation} firstDay={false} />
      <Button label="Replay" variant="secondary" size="md" onPress={replay} />
    </GallerySection>
  );
}

/** feedback.points C: the drops fly from the pill to the counter. */
function PointsDemo() {
  const [earned, setEarned] = useState(30);
  const layer = useRef<View>(null);
  const source = useRef<View>(null);
  const target = useRef<View>(null);
  const points = usePointsFlight(earned, { layer, source, target });
  return (
    <GallerySection title="feedback.points C">
      <View ref={layer} collapsable={false} className="h-40 justify-between rounded-xl bg-surf p-3">
        <View className="items-end">
          <PointsCounter
            shown={points.shown}
            total={earned}
            level={points.level}
            chip={points.chip}
            iconRef={target}
          />
        </View>
        <View ref={source} collapsable={false} className="self-start">
          <StatusPill kind="points" label="+10 bal" />
        </View>
        {points.flight ? (
          <PointsDrops
            key={points.flight.key}
            from={points.flight.from}
            to={points.flight.to}
            count={points.flight.count}
          />
        ) : null}
      </View>
      <Button label="+10" variant="secondary" size="md" onPress={() => setEarned((n) => n + 10)} />
    </GallerySection>
  );
}

/** The feedback moments of the motion lab (docs/design/motion.md), replayable. */
export function FeedbackSection() {
  return (
    <>
      <PointsDemo />
      <GoalCardDemo />
      <Replay title="feedback.goal C + streak (goal-done)">
        {(run) => (
          <View key={run} className="rounded-xl bg-honey p-3">
            <GoalDoneProgress goal={20} flightDay={13} />
          </View>
        )}
      </Replay>
      <Replay title="feedback.score C">
        {(run) => <ResultHero key={run} marks={MARKS} correct={8} total={10} />}
      </Replay>
      <Replay title="feedback.lessondone B (cell)">
        {(run) => (
          <View key={run} className="rounded-xl bg-honey p-3">
            <CellChange
              code="4.3"
              from="not_started"
              to="lesson_completed"
              accessibilityLabel="4.3"
              fromLabel="Boş"
              title="Nektar"
              caption="Öyrənilir"
              tone="honey"
              rising
            />
          </View>
        )}
      </Replay>
      <Replay title="feedback.rankup B">
        {(run) => (
          <View key={run} className="items-center gap-3 rounded-xl bg-honey p-4">
            <RankSeal step={3} />
            <RankUpTitle title="İşçi arı oldun!" />
          </View>
        )}
      </Replay>
    </>
  );
}
