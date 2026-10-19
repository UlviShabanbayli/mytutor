/**
 * Geometry worklets of the rig. Moving parts are drawn as paths and circles whose points are
 * computed here on the UI thread, so no SVG `transform` has to be animated (react-native-svg
 * takes a matrix natively and a string on the web; plain `d`, `cx`, `r` work the same on both).
 */

/** An affine matrix [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export type Affine = [number, number, number, number, number, number];

export function fmt(n: number): string {
  'worklet';
  return String(Math.round(n * 100) / 100);
}

export function rotateAbout(deg: number, ox: number, oy: number): Affine {
  'worklet';
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, ox - ox * c + oy * s, oy - ox * s - oy * c];
}

/** m1 ∘ m2: apply m2 first, then m1. */
export function compose(m1: Affine, m2: Affine): Affine {
  'worklet';
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

export function apply(m: Affine, x: number, y: number): string {
  'worklet';
  return `${fmt(m[0] * x + m[2] * y + m[4])} ${fmt(m[1] * x + m[3] * y + m[5])}`;
}

export function applyX(m: Affine, x: number, y: number): number {
  'worklet';
  return m[0] * x + m[2] * y + m[4];
}

export function applyY(m: Affine, x: number, y: number): number {
  'worklet';
  return m[1] * x + m[3] * y + m[5];
}

/** A quadratic curve "M x0 y0 Q cx cy x1 y1" with every point moved by `m`. */
export function quad(a: readonly number[], m: Affine | null = null): string {
  'worklet';
  const k = m ?? [1, 0, 0, 1, 0, 0];
  const x0 = a[0] ?? 0;
  const y0 = a[1] ?? 0;
  const cx = a[2] ?? 0;
  const cy = a[3] ?? 0;
  const x1 = a[4] ?? 0;
  const y1 = a[5] ?? 0;
  return `M${apply(k, x0, y0)} Q${apply(k, cx, cy)} ${apply(k, x1, y1)}`;
}

/** An ellipse turned by `deg` as two arcs (an animatable path instead of a transform). */
export function ellipse(cx: number, cy: number, rx: number, ry: number, deg: number): string {
  'worklet';
  const r = (deg * Math.PI) / 180;
  const ex = Math.max(0.1, rx);
  const ey = Math.max(0.1, ry);
  const dx = ex * Math.cos(r);
  const dy = ex * Math.sin(r);
  const p0 = `${fmt(cx + dx)} ${fmt(cy + dy)}`;
  const p1 = `${fmt(cx - dx)} ${fmt(cy - dy)}`;
  const a = `A${fmt(ex)} ${fmt(ey)} ${fmt(deg)} 1 0`;
  return `M${p0} ${a} ${p1} ${a} ${p0} Z`;
}

/**
 * Where a held prop goes: the prop is drawn for the arm pose `ref`; for the arm `arm` it moves
 * with the hand and turns with the forearm (motion lab `propT`).
 */
export function propMatrix(arm: readonly number[], ref: readonly number[]): Affine {
  'worklet';
  const ang = Math.atan2((arm[5] ?? 0) - (arm[3] ?? 0), (arm[4] ?? 0) - (arm[2] ?? 0));
  const a0 = Math.atan2((ref[5] ?? 0) - (ref[3] ?? 0), (ref[4] ?? 0) - (ref[2] ?? 0));
  const rx = ref[4] ?? 0;
  const ry = ref[5] ?? 0;
  const turn = rotateAbout(((ang - a0) * 180) / Math.PI, rx, ry);
  const move: Affine = [1, 0, 0, 1, (arm[4] ?? 0) - rx, (arm[5] ?? 0) - ry];
  return compose(move, turn);
}

/** Linear blend of two equally long number lists. */
export function mix(a: readonly number[], b: readonly number[], t: number): number[] {
  'worklet';
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) out.push((a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * t);
  return out;
}
