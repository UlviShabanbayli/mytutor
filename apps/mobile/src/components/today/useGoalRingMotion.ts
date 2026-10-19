import { useEffect } from 'react';
import {
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { goalC } from '@/components/feedback/timelines';
import { duration, easing } from '@/motion';

export type GoalRingMotion = {
  /** Share of the ring drawn (0–1). */
  arc: SharedValue<number>;
  /** The drop riding the arc's head: 1 while it rides. */
  drop: SharedValue<number>;
  /** The drop falling into the centre (0–1). */
  fall: SharedValue<number>;
  /** Honey in the centre disc (0–1). */
  honey: SharedValue<number>;
  /** The minutes and caption in the middle (fade out once the goal is done). */
  mid: SharedValue<number>;
};

/**
 * feedback.goal C: from `from` the arc grows to `fraction` in 900ms with a honey drop on its head;
 * a finished goal then drops it into the centre (300ms), the centre fills from the bottom (500ms)
 * and a check draws (the caller's DrawnMark at `goalCheckAt`). Without `from`, or with less
 * motion, it shows the end state.
 */
export function useGoalRingMotion(
  fraction: number,
  complete: boolean,
  from: number | null,
  reduced: boolean,
): GoalRingMotion {
  const play = from !== null && !reduced;
  const arc = useSharedValue(play ? (from ?? fraction) : fraction);
  const drop = useSharedValue(0);
  const fall = useSharedValue(0);
  const honey = useSharedValue(complete && !play ? 1 : 0);
  const mid = useSharedValue(complete && !play ? 0 : 1);

  useEffect(() => {
    if (!play) {
      arc.value = fraction;
      honey.value = complete ? 1 : 0;
      mid.value = complete ? 0 : 1;
      return;
    }
    const end = goalC.startAt + duration.celebrate;
    // Start from the earlier share, the centre empty again.
    arc.value = from ?? 0;
    fall.value = 0;
    honey.value = 0;
    mid.value = 1;
    arc.value = withDelay(
      goalC.startAt,
      withTiming(fraction, { duration: duration.celebrate, easing: easing.breathe }),
    );
    // The drop rides the head; short of the goal it simply fades where the arc stops.
    drop.value = withDelay(
      goalC.startAt,
      withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(duration.celebrate, withTiming(complete ? 1 : 0, { duration: duration.quick })),
      ),
    );
    if (!complete) return;
    mid.value = withDelay(end, withTiming(0, { duration: duration.reduced }));
    fall.value = withDelay(end, withTiming(1, { duration: goalC.fall, easing: easing.away }));
    honey.value = withDelay(
      end + goalC.honeyAt,
      withTiming(1, { duration: goalC.honey, easing: easing.enter }),
    );
  }, [play, from, fraction, complete, arc, drop, fall, honey, mid]);

  return { arc, drop, fall, honey, mid };
}

/** When the centre's check starts drawing, in ms after the moment starts. */
export const goalCheckAt = goalC.startAt + duration.celebrate + goalC.checkAt;
