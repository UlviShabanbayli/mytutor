import { ARM_L, ARM_R, ANT, BROW, FRONT_ARMS, WING, mirrorWing } from '../data/poses';
import { expression, type ExprKey, type MouthKey } from '../data/faces';
import { POSES, type PoseName, type PropKey } from '../data/scenes';
import { ease, type Ease } from '../ease';
import { initialMouth, mouthOpacity, planMouth } from '../mouthPlan';
import { createRigValues, type Rig } from '../rigValues';
import type { Timeline } from '../timeline';

const PROPS: [PropKey, 'pointerOp' | 'magOp' | 'lensOp'][] = [
  ['pointer', 'pointerOp'],
  ['mag', 'magOp'],
  ['lens', 'lensOp'],
];
const MOUTH_OPS = [
  ['line', 'mLop'],
  ['open', 'mOop'],
  ['o', 'mEop'],
] as const;

export function createRig(pose: PoseName): Rig {
  const rig: Rig = {
    v: createRigValues(),
    model: {
      pose,
      expr: POSES[pose].e,
      flap: 'still',
      baseFlap: 'calm',
      mouth: initialMouth('smile'),
      busyUntil: 0,
    },
  };
  setPose(rig, pose);
  return rig;
}

/** Shows a face at once (reduced motion, first frame). */
export function setFace(rig: Rig, name: ExprKey): void {
  const E = expression(name);
  const v = rig.v;
  rig.model.expr = name;
  v.pbLX.value = E.p[0];
  v.pbLY.value = E.p[1];
  v.pbRX.value = E.p[2];
  v.pbRY.value = E.p[3];
  v.pupS.value = E.p[4];
  v.eye.value = E.eye;
  v.lidY.value = E.lid[0];
  v.slant.value = E.lid[1];
  v.blinkL.value = 0;
  v.blinkR.value = 0;
  v.lash.value = E.lash;
  v.low.value = E.low;
  v.cheekOp.value = E.ch;
  v.browOp.value = E.brow ? 1 : 0;
  if (E.brow) {
    v.browL.value = BROW[E.brow][0].slice();
    v.browR.value = BROW[E.brow][1].slice();
  }
  const mouth = initialMouth(E.m);
  rig.model.mouth = mouth;
  v.mL.value = mouth.mL;
  v.mO.value = mouth.mO;
  v.mT.value = mouth.mT;
  v.mE.value = mouth.mE;
  for (const [kind, key] of MOUTH_OPS) v[key].value = kind === mouth.kind ? 1 : 0;
}

/** Shows a whole pose at once. */
export function setPose(rig: Rig, name: PoseName): void {
  const P = POSES[name];
  const v = rig.v;
  rig.model.pose = name;
  v.armL.value = ARM_L[P.al].slice();
  v.armR.value = ARM_R[P.ar].slice();
  v.front.value = FRONT_ARMS.includes(P.ar) ? 1 : 0;
  v.antL.value = ANT[P.ant].l.slice();
  v.antR.value = ANT[P.ant].r.slice();
  v.wingL.value = WING[P.w].slice();
  v.wingR.value = mirrorWing(WING[P.w]);
  for (const [prop, key] of PROPS) v[key].value = P.prop === prop ? 1 : 0;
  setFace(rig, P.e);
}

/** Morphs the mouth (lab `mouth()`), with the old kind fading out under the new one. */
export function mouthTo(tl: Timeline, rig: Rig, key: MouthKey, at: number, d: number): void {
  const plan = planMouth(rig.model.mouth, key);
  rig.model.mouth = plan.next;
  const v = rig.v;
  for (const k of ['mL', 'mO', 'mT', 'mE'] as const) {
    const move = plan[k];
    if (move.from) tl.set(v[k], move.from, at);
    tl.to(v[k], move.to, at, d, ease.p2io);
  }
  for (const [kind, key2] of MOUTH_OPS) {
    const [target, share] = mouthOpacity(kind, plan.fromKind, plan.toKind);
    tl.to(v[key2], target, at, d * share, ease.none);
  }
}

/** Tweens to a face (lab `face()`); `mouth: false` leaves the mouth to someone else (visemes). */
export function faceTo(
  tl: Timeline,
  rig: Rig,
  name: ExprKey,
  at: number,
  d = 0.3,
  mouth = true,
): void {
  const E = expression(name);
  const v = rig.v;
  rig.model.expr = name;
  const pupil = (sv: typeof v.pbLX, to: number) => tl.to(sv, to, at, d * 0.7, ease.p3out);
  pupil(v.pbLX, E.p[0]);
  pupil(v.pbLY, E.p[1]);
  pupil(v.pbRX, E.p[2]);
  pupil(v.pbRY, E.p[3]);
  pupil(v.pupS, E.p[4]);
  tl.to(v.eye, E.eye, at, d, ease.back2)
    .to(v.lidY, E.lid[0], at, d, ease.p2io)
    .to(v.slant, E.lid[1], at, d, ease.p2io)
    .to(v.lash, E.lash, E.lash ? at + d * 0.8 : at, Math.min(0.1, d), ease.none)
    .to(v.low, E.low, at, d, ease.p2out)
    .to(v.cheekOp, E.ch, at, d, ease.p2io)
    .to(v.browOp, E.brow ? 1 : 0, at, d * 0.6, ease.p2io);
  if (E.brow) {
    tl.to(v.browL, BROW[E.brow][0].slice(), at, d).to(v.browR, BROW[E.brow][1].slice(), at, d);
  }
  if (mouth) mouthTo(tl, rig, E.m, at, d);
}

/** Tweens to a whole pose (lab `pose()`): arms, antennae (with a little overshoot), wings, prop, face. */
export function poseTo(
  tl: Timeline,
  rig: Rig,
  name: PoseName,
  at: number,
  d = 0.4,
  curve: Ease = ease.p2io,
): void {
  const P = POSES[name];
  const v = rig.v;
  const front = FRONT_ARMS.includes(P.ar);
  rig.model.pose = name;
  tl.to(v.armL, ARM_L[P.al].slice(), at, d, curve)
    .to(v.armR, ARM_R[P.ar].slice(), at, d, curve)
    .set(v.front, front ? 1 : 0, at + (front ? d * 0.3 : d * 0.7))
    .to(v.antL, ANT[P.ant].l.slice(), at, d * 1.2, ease.back22)
    .to(v.antR, ANT[P.ant].r.slice(), at + d * 0.08, d * 1.2, ease.back22)
    .to(v.wingL, WING[P.w].slice(), at, d, curve)
    .to(v.wingR, mirrorWing(WING[P.w]), at, d, curve);
  for (const [prop, key] of PROPS) {
    const on = P.prop === prop;
    tl.to(v[key], on ? 1 : 0, on ? at + d * 0.3 : at, d * 0.5, ease.p2io);
  }
  faceTo(tl, rig, P.e, at, d);
}

/** Moves only the antennae to another pose (wake-ups, recoveries). */
export function antTo(
  tl: Timeline,
  rig: Rig,
  key: keyof typeof ANT,
  at: number,
  d: number,
  curve: Ease = ease.p2io,
): void {
  tl.to(rig.v.antL, ANT[key].l.slice(), at, d, curve).to(
    rig.v.antR,
    ANT[key].r.slice(),
    at + 0.02,
    d,
    curve,
  );
}
