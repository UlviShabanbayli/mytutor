import { useEffect, useState } from 'react';
import { useReducedMotionPref } from '@/motion';

/**
 * How many of `times` (ms after mount) have passed: a counter that ticks as cells land. With
 * reduced motion it shows the final count at once. Screen readers should be given the final
 * value by the caller.
 */
export function useLandedCount(times: readonly number[]): number {
  const reduced = useReducedMotionPref();
  const key = times.join(',');
  const [state, setState] = useState({ key, landed: 0 });
  if (state.key !== key) setState({ key, landed: 0 });

  useEffect(() => {
    if (reduced || !key) return;
    const timers = key
      .split(',')
      .map((at) =>
        setTimeout(
          () => setState((s) => (s.key === key ? { key, landed: s.landed + 1 } : s)),
          Number(at),
        ),
      );
    return () => timers.forEach(clearTimeout);
  }, [key, reduced]);

  return reduced ? times.length : state.landed;
}
