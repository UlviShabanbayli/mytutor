import { cancelAnimation, withRepeat, withTiming } from 'react-native-reanimated';
import { ease } from '../ease';
import type { FlapMode, Rig } from '../rigValues';
import type { Scope } from '../scope';

/** Wing beat per mode: [amplitude in degrees, seconds per stroke]. */
const FLAP: Record<FlapMode, [number, number]> = {
  still: [0, 0],
  rest: [4, 0.55],
  calm: [9, 0.09],
  busy: [16, 0.06],
  fly: [22, 0.045],
};

/** Switches the wing beat; `fly` adds the motion-blur ghost wings. */
export function setFlap(rig: Rig, mode: FlapMode): void {
  const v = rig.v;
  rig.model.flap = mode;
  const [amp, sec] = FLAP[mode];
  if (!amp) {
    v.flapL.value = withTiming(0, { duration: 300 });
    v.flapR.value = withTiming(0, { duration: 300 });
  } else {
    const beat = { duration: sec * 1000, easing: ease.sineIO };
    v.flapL.value = -amp * 0.35;
    v.flapR.value = amp * 0.35;
    v.flapL.value = withRepeat(withTiming(amp, beat), -1, true);
    v.flapR.value = withRepeat(withTiming(-amp, beat), -1, true);
  }
  v.ghostOp.value = withTiming(mode === 'fly' ? 0.55 : 0, { duration: 200 });
}

/** Changes the wing beat Vızı returns to after bursts and flights. */
export function setBaseFlap(rig: Rig, mode: FlapMode): void {
  rig.model.baseFlap = mode;
  setFlap(rig, mode);
}

/** A short buzz of fast wings, then back to the beat before it. */
export function flapBurst(S: Scope, rig: Rig, sec: number, mode: FlapMode = 'busy'): void {
  const prev = rig.model.flap !== mode ? rig.model.flap : rig.model.baseFlap;
  setFlap(rig, mode);
  S.after(sec, () => setFlap(rig, prev));
}

/** Speed lines behind Vızı (flights); they flicker while shown. */
export function setSpeed(rig: Rig, on: boolean): void {
  const v = rig.v;
  v.speedOp.value = withTiming(on ? 1 : 0, { duration: 150 });
  if (on) {
    v.speedX.value = 0;
    v.speedX.value = withRepeat(withTiming(-10, { duration: 120, easing: ease.none }), -1, true);
  } else {
    cancelAnimation(v.speedX);
    v.speedX.value = 0;
  }
}
