import { useEffect, useEffectEvent, useState } from 'react';
import { useIsFocused } from 'expo-router';
import { useReducedMotionPref } from '@/motion';
import { createRig } from '../rig/moves/pose';
import { disposeRig, type Rig } from '../rig/rigValues';
import type { PoseName } from '../rig/data/scenes';
import { Scope } from '../rig/scope';

/**
 * A rig for one live mascot. `active` is false while the screen is not focused or the student
 * asked for less motion: loops (hover, wings, glances, fidgets) run only while it is true.
 * `init` may change the first frame (e.g. hidden before an entrance).
 */
export function useLive(pose: PoseName, reducedPose: PoseName = pose, init?: (rig: Rig) => void) {
  const reduced = useReducedMotionPref();
  const focused = useIsFocused();
  const [rig] = useState(() => {
    const r = createRig(reduced ? reducedPose : pose);
    if (!reduced) init?.(r);
    return r;
  });
  useEffect(() => () => disposeRig(rig.v), [rig]);
  return { rig, reduced, active: focused && !reduced };
}

/**
 * Runs `start` in a fresh scope while `enabled` (and again whenever `key` changes); the scope
 * and everything it started stop when it turns false, the key changes or on unmount.
 */
export function useScoped(enabled: boolean, start: (S: Scope) => void, key: unknown = null): void {
  const run = useEffectEvent(start);
  useEffect(() => {
    if (!enabled) return;
    const S = new Scope();
    run(S);
    return () => S.kill();
  }, [enabled, key]);
}
