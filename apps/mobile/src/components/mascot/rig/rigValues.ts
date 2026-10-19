import { cancelAnimation, makeMutable, type SharedValue } from 'react-native-reanimated';
import type { MouthModel } from './mouthPlan';
import type { ExprKey } from './data/faces';
import type { PoseName } from './data/scenes';

/**
 * Every animatable number of the Vızı rig (the named groups of the motion lab) with its rest
 * value. Outer groups move Views (host → hover → squash → spin → breath); inner parts are SVG
 * geometry. Translations are in viewBox units (1 unit = size / 200), angles in degrees.
 */
const SCALARS = {
  // host: entrances, exits, flights (lab: the host element and `root`)
  hostX: 0,
  hostY: 0,
  hostRot: 0,
  hostFlip: 1,
  hostScale: 1,
  hostOpacity: 1,
  hoverY: 0,
  // squash and stretch around the feet, spins around the body, breathing around the feet
  sqY: 0,
  sqX: 1,
  sqS: 1,
  spin: 0,
  brX: 1,
  brS: 1,
  brRot: 0,
  shadowX: 1,
  shadowOp: 1,
  speedOp: 0,
  speedX: 0,
  // wings flap around their roots; ghost = the motion blur of the flight flap
  flapL: 0,
  flapR: 0,
  ghostOp: 0,
  // antenna wobble, arm gestures, the right arm drawn in front of the face and its props
  wobL: 0,
  wobR: 0,
  armLRot: 0,
  armRRot: 0,
  frontRot: 0,
  front: 0,
  pointerOp: 0,
  magOp: 0,
  lensOp: 0,
  // face: head turn, eyes, pupils (pose + glance + dizzy orbit), lids, brows, cheeks, mouth
  faceX: 0,
  faceY: 0,
  eye: 1,
  pbLX: 0,
  pbLY: 0,
  pbRX: 0,
  pbRY: 0,
  pupS: 1,
  lookX: 0,
  lookY: 0,
  dizzy: 0,
  lidY: -62,
  slant: 0,
  blinkL: 0,
  blinkR: 0,
  lash: 0,
  low: 44,
  browOp: 0,
  cheekOp: 1,
  cheekS: 1,
  mLop: 1,
  mOop: 0,
  mEop: 0,
};

const LISTS = [
  'wingL',
  'wingR',
  'antL',
  'antR',
  'armL',
  'armR',
  'browL',
  'browR',
  'mL',
  'mO',
  'mT',
  'mE',
] as const;

type ScalarKey = keyof typeof SCALARS;
type ListKey = (typeof LISTS)[number];

export type RigValues = { [K in ScalarKey]: SharedValue<number> } & {
  [K in ListKey]: SharedValue<number[]>;
};

export type FlapMode = 'still' | 'rest' | 'calm' | 'busy' | 'fly';

/** JS-side bookkeeping: the pose last asked for, the flap modes, the mouth, a busy window. */
export type RigModel = {
  pose: PoseName;
  expr: ExprKey;
  flap: FlapMode;
  baseFlap: FlapMode;
  mouth: MouthModel;
  /** Until this time (ms since epoch) a reaction plays; idle fidgets and glances wait. */
  busyUntil: number;
};

export type Rig = { v: RigValues; model: RigModel };

/** Creates the rig's values outside React state; `disposeRig` stops them on unmount. */
export function createRigValues(): RigValues {
  const out: Record<string, SharedValue<number> | SharedValue<number[]>> = {};
  for (const [key, rest] of Object.entries(SCALARS)) out[key] = makeMutable(rest);
  for (const key of LISTS) out[key] = makeMutable<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  // Filled from SCALARS and LISTS just above, which define RigValues.
  return out as RigValues;
}

export function disposeRig(v: RigValues): void {
  for (const key of Object.keys(SCALARS) as ScalarKey[]) cancelAnimation(v[key]);
  for (const key of LISTS) cancelAnimation(v[key]);
}

/** True while a reaction plays (idle glances and fidgets wait for it). */
export function isBusy(rig: Rig): boolean {
  return Date.now() < rig.model.busyUntil;
}

export function markBusy(rig: Rig, seconds: number): void {
  rig.model.busyUntil = Math.max(rig.model.busyUntil, Date.now() + seconds * 1000);
}
