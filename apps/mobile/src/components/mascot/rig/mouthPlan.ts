import { MOUTH, type MouthKey, type MouthKind } from './data/faces';

/** The mouth as last drawn: its kind and the four shapes (line, open, tongue, "o"). */
export type MouthModel = {
  kind: MouthKind;
  mL: number[];
  mO: number[];
  mT: number[];
  mE: number[];
};

/** One shape's move: jump to `from` first when set, then tween to `to`. */
export type ShapeMove = { from: number[] | null; to: number[] };

export type MouthPlan = {
  fromKind: MouthKind;
  toKind: MouthKind;
  mL: ShapeMove;
  mO: ShapeMove;
  mT: ShapeMove;
  mE: ShapeMove;
  next: MouthModel;
};

/** A tongue tucked into a closing curve. */
function tuck(a: readonly number[]): number[] {
  'worklet';
  const x = a[2] ?? 0;
  const y = a[3] ?? 0;
  return [x - 3, y - 3, x, y - 1, x + 3, y - 3];
}

/** The same curve with its middle pulled flat (an open mouth about to close). */
function flatten(a: readonly number[]): number[] {
  'worklet';
  const x0 = a[0] ?? 0;
  const y0 = a[1] ?? 0;
  const x1 = a[4] ?? 0;
  return [x0, y0, (x0 + x1) / 2, y0 + 1, x1, a[5] ?? 0];
}

/**
 * How the mouth morphs into `key` (motion lab `mouth()`): a line can open into a mouth with a
 * tongue, an open mouth closes into a line or rounds into an "o", and so on. The kind that
 * leaves fades out while the new one fades in (see `mouthOpacity`). Pure and a worklet, so the
 * JS timelines and the UI-thread narrator share it.
 */
export function planMouth(cur: MouthModel, key: MouthKey): MouthPlan {
  'worklet';
  const M = MOUTH[key];
  const to = M.kind;
  const from = cur.kind;
  const shape = M.shape.slice();
  const keep = (a: number[]): ShapeMove => ({ from: null, to: a.slice() });
  const plan: MouthPlan = {
    fromKind: from,
    toKind: to,
    mL: keep(cur.mL),
    mO: keep(cur.mO),
    mT: keep(cur.mT),
    mE: keep(cur.mE),
    next: { kind: to, mL: cur.mL, mO: cur.mO, mT: cur.mT, mE: cur.mE },
  };
  const tongue = 'tongue' in M ? M.tongue.slice() : tuck(shape);
  if (to === 'line') {
    plan.mL = { from: from === 'line' ? null : shape, to: shape };
    if (from === 'open') plan.mO = { from: null, to: shape };
    if (from === 'open') plan.mT = { from: null, to: tuck(shape) };
    if (from === 'o') plan.mE = { from: null, to: [cur.mE[0] ?? 0, cur.mE[1] ?? 0, 1, 1] };
  } else if (to === 'open') {
    plan.mO = { from: null, to: shape };
    plan.mT = { from: null, to: tongue };
    if (from === 'line') {
      plan.mO.from = cur.mL.slice();
      plan.mT.from = tuck(cur.mL);
    } else if (from === 'o') {
      plan.mO.from = flatten(shape);
      plan.mT.from = tuck(flatten(shape));
      plan.mE = { from: null, to: [cur.mE[0] ?? 0, cur.mE[1] ?? 0, 1, 1] };
    }
  } else {
    plan.mE = { from: from === 'o' ? null : [shape[0] ?? 0, shape[1] ?? 0, 1.5, 1], to: shape };
    if (from === 'open') {
      plan.mO = { from: null, to: flatten(cur.mO) };
      plan.mT = { from: null, to: tuck(flatten(cur.mO)) };
    }
  }
  plan.next = { kind: to, mL: plan.mL.to, mO: plan.mO.to, mT: plan.mT.to, mE: plan.mE.to };
  return plan;
}

/**
 * Opacity of one mouth kind during a morph from `from` to `to`: the new kind is fully in at
 * half the tween, the old one gone at 70% (lab `mouthOp`). Returns [target, share of duration].
 */
export function mouthOpacity(kind: MouthKind, from: MouthKind, to: MouthKind): [number, number] {
  'worklet';
  if (kind === to) return [1, 0.5];
  if (kind === from) return [0, 0.71];
  return [0, 0.5];
}

export function initialMouth(key: MouthKey): MouthModel {
  const M = MOUTH[key];
  const base: MouthModel = {
    kind: M.kind,
    mL: MOUTH.smile.shape.slice(),
    mO: MOUTH.laugh.shape.slice(),
    mT: MOUTH.laugh.tongue.slice(),
    mE: MOUTH.o.shape.slice(),
  };
  if (M.kind === 'line') base.mL = M.shape.slice();
  if (M.kind === 'o') base.mE = M.shape.slice();
  if ('tongue' in M) {
    base.mO = M.shape.slice();
    base.mT = M.tongue.slice();
  }
  return base;
}
