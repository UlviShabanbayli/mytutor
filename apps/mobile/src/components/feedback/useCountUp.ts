import { useEffect, useState } from 'react';
import { countAt } from './motionMath';

type CountUpOptions = {
  from?: number;
  /** Length of the count in ms. */
  duration: number;
  delay?: number;
  /** Less motion: the number is the target at once. */
  reduced: boolean;
};

/**
 * A number counting up to `target` (ease-out), for the stats of the feedback moments.
 * Callers give screen readers the final value, never the counting one.
 *
 * TODO(motion-micro): replace with `RollingNumber` (micro.count) once it lands in
 * components/ui; this local counter only exists until then.
 */
export function useCountUp(
  target: number,
  { from = 0, duration, delay = 0, reduced }: CountUpOptions,
): number {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = duration > 0 ? (now - start) / duration : 1;
      setValue(countAt(from, target, t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, from, duration, delay, reduced]);

  return reduced ? target : value;
}
