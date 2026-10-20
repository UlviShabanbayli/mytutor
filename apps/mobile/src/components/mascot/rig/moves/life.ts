import { withRepeat, withTiming } from 'react-native-reanimated';
import { POSES } from '../data/scenes';
import { ease } from '../ease';
import { isBusy, markBusy, type FlapMode, type Rig } from '../rigValues';
import type { Scope } from '../scope';
import type { Timeline } from '../timeline';
import { flapBurst, setFlap } from './flap';
import { faceTo } from './pose';
import { blink, hop, look, wobble } from './small';

export type LifeOptions = {
  /** Hover height in units (0 = no hover) and seconds per half cycle. */
  hover?: number;
  hoverDur?: number;
  /** Slow, deep breathing (asleep). */
  deep?: boolean;
  flap?: FlapMode;
  /** Glances around now and then (vizi.idle B). */
  look?: boolean;
  /** A random fidget every 3.4–6s (vizi.idle C). */
  fidget?: boolean;
  blink?: boolean;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const LOOKS: [number, number][] = [
  [-7, -2],
  [7, -3],
  [-5, 4],
  [6, 3],
  [0, -6],
  [-8, 1],
  [8, 1],
];

/** Plays a short reaction and keeps idle glances away until it ends. */
export function react(S: Scope, rig: Rig, build: (tl: Timeline) => void): Timeline {
  const tl = S.play(build);
  markBusy(rig, tl.duration);
  return tl;
}

const FIDGETS: ((S: Scope, rig: Rig) => void)[] = [
  (S, rig) => react(S, rig, (tl) => hop(tl, rig, 10, 0)),
  (S, rig) => react(S, rig, (tl) => wobble(tl, rig, Math.random() < 0.5 ? -18 : 18, 0)),
  (S, rig) =>
    react(S, rig, (tl) => {
      const back = POSES[rig.model.pose].e;
      faceTo(tl, rig, 'happy', 0, 0.22);
      tl.to(rig.v.cheekS, 1.2, 0, 0.2).to(rig.v.cheekS, 1, 1, 0.3);
      faceTo(tl, rig, back, 1.1, 0.3);
    }),
  (S, rig) => {
    flapBurst(S, rig, 0.7, 'busy');
    react(S, rig, (tl) => hop(tl, rig, 6, 0));
  },
  (S, rig) =>
    react(S, rig, (tl) => {
      look(tl, rig, -7, 1, 0, 0.25);
      look(tl, rig, 7, 1, 0.75, 0.25);
      look(tl, rig, 0, 0, 1.5, 0.3);
    }),
  (S, rig) => react(S, rig, (tl) => tl.yoyo(rig.v.brRot, 5, 0, 0, 0.35, 4, ease.sineIO)),
];

/**
 * Idle life (motion lab `life()`): hover with the shadow breathing in sync, breathing at the feet,
 * wing beat, random blinks, optional glances and fidgets. Everything stops with the scope.
 */
export function startLife(S: Scope, rig: Rig, o: LifeOptions = {}): void {
  const v = rig.v;
  const hv = o.hover ?? 4;
  const hd = (o.hoverDur ?? 1.6) * 1000;
  const loop = (to: number, duration: number) =>
    withRepeat(withTiming(to, { duration, easing: ease.sineIO }), -1, true);
  if (hv) {
    v.hoverY.value = loop(-hv, hd);
    v.shadowX.value = loop(0.86, hd);
    v.shadowOp.value = loop(0.65, hd);
  }
  const bd = o.deep ? 2400 : 1700;
  v.brS.value = loop(o.deep ? 1.04 : 1.018, bd);
  v.brX.value = loop(o.deep ? 0.985 : 0.993, bd);
  rig.model.baseFlap = o.flap ?? 'calm';
  setFlap(rig, rig.model.baseFlap);

  const blinks = () =>
    S.after(rand(2.2, 5.2), () => {
      if (!isBusy(rig)) {
        S.play((tl) => blink(tl, rig, 0));
        if (Math.random() < 0.2) S.after(0.32, () => S.play((tl) => blink(tl, rig, 0)));
      }
      blinks();
    });
  if (o.blink !== false) blinks();

  const glances = () =>
    S.after(rand(1.3, 3.2), () => {
      if (!isBusy(rig)) {
        const [dx, dy] =
          Math.random() < 0.35 ? [0, 0] : (LOOKS[Math.floor(Math.random() * 7)] ?? [0, 0]);
        S.play((tl) => {
          look(tl, rig, dx, dy, 0, 0.3);
          wobble(tl, rig, -dx * 1.4, 0);
        });
      }
      glances();
    });
  if (o.look) glances();

  const fidgets = () =>
    S.after(rand(3.4, 6), () => {
      if (!isBusy(rig)) FIDGETS[Math.floor(Math.random() * FIDGETS.length)]?.(S, rig);
      fidgets();
    });
  if (o.fidget) fidgets();

  S.onKill(() => {
    const rest = { duration: 200 };
    v.hoverY.value = withTiming(0, rest);
    v.shadowX.value = withTiming(1, rest);
    v.shadowOp.value = withTiming(1, rest);
    v.brS.value = withTiming(1, rest);
    v.brX.value = withTiming(1, rest);
    setFlap(rig, 'still');
  });
}
