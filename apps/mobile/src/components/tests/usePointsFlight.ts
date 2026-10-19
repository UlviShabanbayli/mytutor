import { useEffect, useRef, useState, type RefObject } from 'react';
import type { View } from 'react-native';
import { useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { splitPoints, type Point } from '@/components/feedback/motionMath';
import { pointsC } from '@/components/feedback/timelines';
import { playCue } from '@/lib/cues';
import { duration, easing, useReducedMotionPref } from '@/motion';
import type { PointsChip } from './PointsCounter';

export type PointsFlight = { key: number; from: Point; to: Point; count: number };

type FlightRefs = {
  /** The layer the drops fly in (the whole test screen). */
  layer: RefObject<View | null>;
  /** The "+10 bal" pill they leave from and the counter's drop they land in. */
  source: RefObject<View | null>;
  target: RefObject<View | null>;
};

type Box = { x: number; y: number; width: number; height: number };

const measure = (view: View | null) =>
  new Promise<Box | null>((resolve) => {
    if (!view) return resolve(null);
    view.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });

const centreIn = (box: Box, layer: Box): Point => ({
  x: box.x - layer.x + box.width / 2,
  y: box.y - layer.y + box.height / 2,
});

/**
 * feedback.points C for the test header: when the run's points go up, 8 drops fly from the
 * panel's "+10 bal" to the counter, each adding its share and filling the counter's drop; after
 * the last one the drop drains and "+10" slides out, with a light tap. Less motion (or nothing to
 * measure): the number simply changes.
 */
export function usePointsFlight(earned: number, refs: FlightRefs) {
  const reduced = useReducedMotionPref();
  const [shown, setShown] = useState(earned);
  const [flight, setFlight] = useState<PointsFlight | null>(null);
  const [chip, setChip] = useState<PointsChip | null>(null);
  const level = useSharedValue(0);
  const caughtUp = useRef(earned);

  useEffect(() => {
    const before = caughtUp.current;
    caughtUp.current = earned;
    if (earned <= before || reduced) {
      setShown(earned);
      return;
    }
    const parts = splitPoints(earned - before, pointsC.drops);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    let cancelled = false;

    later(pointsC.startAt, () => {
      void Promise.all([
        measure(refs.layer.current),
        measure(refs.source.current),
        measure(refs.target.current),
      ]).then(([layer, source, target]) => {
        if (cancelled) return;
        if (!layer || !source || !target) return setShown(earned);
        const key = Date.now();
        setFlight({
          key,
          from: centreIn(source, layer),
          to: centreIn(target, layer),
          count: parts.length,
        });
        parts.forEach((part, i) =>
          later(i * pointsC.stagger + pointsC.flight, () => {
            setShown((n) => n + part);
            const full = (i + 1) / parts.length;
            const step = withTiming(full, { duration: pointsC.levelStep });
            const drain = withTiming(0, { duration: duration.fill, easing: easing.away });
            const last = i === parts.length - 1;
            level.value = last ? withSequence(step, withDelay(pointsC.drainDelay, drain)) : step;
            if (!last) return;
            setChip({ key, amount: earned - before });
            setFlight(null);
            playCue('press');
          }),
        );
      });
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      level.value = 0;
      setFlight(null);
      setShown(earned);
    };
  }, [earned, reduced, refs.layer, refs.source, refs.target, level]);

  return { shown, flight, chip, level };
}
