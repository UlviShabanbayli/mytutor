import { withTiming, type SharedValue } from 'react-native-reanimated';
import type { MouthKey } from '../data/faces';
import { ease } from '../ease';
import { mouthOpacity, planMouth, type MouthModel } from '../mouthPlan';
import type { RigValues } from '../rigValues';

/**
 * Morphs the mouth from the UI thread (visemes driven by a clock, e.g. TTS word timestamps).
 * Same plan as the JS timelines (`mouthTo`); `model` keeps the mouth between calls.
 */
export function mouthOnUI(
  v: RigValues,
  model: SharedValue<MouthModel>,
  key: MouthKey,
  d: number,
): void {
  'worklet';
  const plan = planMouth(model.value, key);
  const ms = d * 1000;
  const shapes = [
    [v.mL, plan.mL],
    [v.mO, plan.mO],
    [v.mT, plan.mT],
    [v.mE, plan.mE],
  ] as const;
  for (const [sv, move] of shapes) {
    if (move.from) sv.value = move.from;
    sv.value = withTiming(move.to, { duration: ms, easing: ease.p2io });
  }
  const ops = [
    ['line', v.mLop],
    ['open', v.mOop],
    ['o', v.mEop],
  ] as const;
  for (const [kind, sv] of ops) {
    const [target, share] = mouthOpacity(kind, plan.fromKind, plan.toKind);
    sv.value = withTiming(target, { duration: ms * share });
  }
  model.value = plan.next;
}
