import { expression, TALK_KEYS, type MouthKey } from '../data/faces';
import { ease, elasticOut } from '../ease';
import type { Rig } from '../rigValues';
import type { Timeline } from '../timeline';
import { mouthTo } from './pose';

// Small motions of the rig, ported from the motion lab one by one. Each adds its tweens to a
// timeline at `at` (seconds); units are viewBox units and degrees.

const tail = elasticOut(1.1, 0.28);

/** Antennae boing: a quick tip, then an elastic settle; the right one lags a little. */
export function wobble(tl: Timeline, rig: Rig, amt: number, at: number): void {
  const v = rig.v;
  tl.to(v.wobL, amt, at, 0.09, ease.p2out)
    .to(v.wobL, 0, at + 0.09, 1.1, ease.boing)
    .to(v.wobR, amt * 0.85, at + 0.03, 0.1, ease.p2out)
    .to(v.wobR, 0, at + 0.13, 1.2, tail);
}

/** A hop of `h` units with squash and stretch around the feet. Lasts ~1s. */
export function hop(tl: Timeline, rig: Rig, h: number, at: number): void {
  const v = rig.v;
  const squash = (s: number, x: number, t: number, d: number, curve = ease.p2out) =>
    tl.to(v.sqS, s, at + t, d, curve).to(v.sqX, x, at + t, d, curve);
  squash(0.9, 1.08, 0, 0.1);
  tl.to(v.sqY, -h, at + 0.1, 0.2, ease.p2out);
  squash(1.08, 0.94, 0.1, 0.2);
  squash(1, 1, 0.22, 0.14, ease.sineOut);
  tl.to(v.sqY, 0, at + 0.36, 0.18, ease.p2in);
  squash(0.92, 1.06, 0.54, 0.07, ease.p1out);
  squash(1, 1, 0.61, 0.4, ease.land);
  wobble(tl, rig, -10, at + 0.1);
  wobble(tl, rig, 9, at + 0.6);
}

/** Both eyes blink (skipped while the lids are already low, e.g. asleep). */
export function blink(tl: Timeline, rig: Rig, at: number): void {
  if (expression(rig.model.expr).lid[0] > -6) return;
  for (const lid of [rig.v.blinkL, rig.v.blinkR]) {
    tl.to(lid, 1, at, 0.075, ease.p2in).to(lid, 0, at + 0.125, 0.13, ease.p2out);
  }
}

/** The left eye winks and holds it for `hold` seconds. */
export function wink(tl: Timeline, rig: Rig, hold: number, at: number): void {
  tl.to(rig.v.blinkL, 1, at, 0.08, ease.p2in).to(
    rig.v.blinkL,
    0,
    at + 0.08 + hold,
    0.14,
    ease.p2out,
  );
}

/** A glance: the pupils jump, the face follows by half the distance (a fake head turn). */
export function look(tl: Timeline, rig: Rig, dx: number, dy: number, at: number, d = 0.3): void {
  const v = rig.v;
  tl.to(v.lookX, dx, at, d * 0.45, ease.p3out)
    .to(v.lookY, dy, at, d * 0.45, ease.p3out)
    .to(v.faceX, dx * 0.5, at + d * 0.1, d * 1.5, ease.p2out)
    .to(v.faceY, dy * 0.35, at + d * 0.1, d * 1.5, ease.p2out);
}

/** Mouth visemes every 110–180ms for `sec` seconds, then `end`. */
export function talk(
  tl: Timeline,
  rig: Rig,
  at: number,
  sec: number,
  end: MouthKey = 'smile',
  keys: readonly MouthKey[] = TALK_KEYS,
): void {
  let t = 0;
  let last: MouthKey | null = null;
  while (t < sec) {
    let k = keys[Math.floor(Math.random() * keys.length)] ?? 'talk';
    if (k === last) k = keys[(keys.indexOf(k) + 1) % keys.length] ?? 'talk';
    last = k;
    mouthTo(tl, rig, k, at + t, 0.08);
    t += 0.11 + Math.random() * 0.07;
  }
  mouthTo(tl, rig, end, at + t, 0.12);
}

/** The pupils orbit (dizzy after a spin). */
export function dizzy(tl: Timeline, rig: Rig, at: number, sec: number): void {
  tl.to(rig.v.dizzy, Math.PI * 4, at, sec, ease.p1io).set(rig.v.dizzy, 0, at + sec);
}

/** The right arm waves `n` times around the shoulder while the body sways ±2°. */
export function wave(tl: Timeline, rig: Rig, n: number, at: number): void {
  const v = rig.v;
  tl.to(v.armRRot, -16, at, 0.14, ease.sineOut)
    .yoyo(v.armRRot, 12, -16, at + 0.14, 0.2, n * 2, ease.sineIO)
    .to(v.armRRot, 0, at + 0.14 + n * 0.4, 0.25, ease.sineOut);
  const leg = (0.4 * n) / 5;
  [2, -2, 2, -2, 0].forEach((r, i) => tl.to(v.spin, r, at + 0.14 + i * leg, leg, ease.none));
}

/** A kind nod: the face dips `times` legs of 3 units. */
export function nod(tl: Timeline, rig: Rig, at: number, legs: number, leg = 0.28): void {
  tl.yoyo(rig.v.faceY, 3, 0, at, leg, legs, ease.sineIO);
}

/** A full turn around the body centre, then back to 0 without a jump. */
export function spinTurn(tl: Timeline, rig: Rig, at: number, d: number): void {
  tl.to(rig.v.spin, 360, at, d, ease.p2io).set(rig.v.spin, 0, at + d + 0.01);
}
