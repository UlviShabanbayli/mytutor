import { useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { duration, easing } from '@/motion';

/**
 * transitions.dialog C: one progress from 0 to 1 for a confirmation dialog and the screen
 * stepping back behind it: in 320ms cubic-bezier(.2,.8,.2,1), out 220ms (.4,0,.2,1), the
 * mirror. `mounted` stays true until the way out has finished.
 */
export function useDepthProgress(active: boolean) {
  const [mounted, setMounted] = useState(active);
  if (active && !mounted) setMounted(true);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.set(withTiming(1, { duration: duration.surface, easing: easing.enter }));
      return;
    }
    progress.set(
      withTiming(0, { duration: duration.base, easing: easing.exit }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      }),
    );
  }, [active, progress]);

  return { mounted, progress };
}
