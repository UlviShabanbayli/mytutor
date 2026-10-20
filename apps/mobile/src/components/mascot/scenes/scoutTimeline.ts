import type { SharedValue } from 'react-native-reanimated';
import { playCue } from '@/lib/cues';
import { ease } from '../rig/ease';
import { flapBurst } from '../rig/moves/flap';
import { antTo, faceTo } from '../rig/moves/pose';
import { wobble } from '../rig/moves/small';
import type { Rig } from '../rig/rigValues';
import type { Scope } from '../rig/scope';
import type { Timeline } from '../rig/timeline';

export type ScoutValues = {
  ring: SharedValue<number>;
  ringScale: SharedValue<number>;
  card: SharedValue<number>;
};

/**
 * vizi.scout A «Lupa gəzdirir»: Vızı flies cell to cell (500ms power2.inOut, a 5° lean, wing
 * buzz) and wiggles the lens (±5°) over each; over the weak cell it is surprised (antennae
 * boing, haptic `focus`), a ring pulses around the cell twice (scale 1→1.35, fade, 700ms), the
 * result slides in (y 8→0, 260ms) and Vızı nods happily. `spots` are host positions (units).
 */
export function scoutTimeline(
  tl: Timeline,
  rig: Rig,
  S: Scope,
  spots: { x: number; y: number }[],
  found: number,
  s: ScoutValues,
): void {
  const v = rig.v;
  for (let i = 0; i <= found; i++) {
    const t = 0.3 + i * 0.95;
    const spot = spots[i] ?? { x: 0, y: 0 };
    tl.to(v.hostX, spot.x, t, 0.5, ease.p2io)
      .to(v.hostY, spot.y, t, 0.5, ease.p2io)
      .yoyo(v.spin, 5, 0, t, 0.25, 2, ease.sineOut)
      .call(t, () => flapBurst(S, rig, 0.5))
      .yoyo(v.frontRot, 5, 0, t + 0.5, 0.12, 4, ease.sineIO);
  }
  const tf = 0.3 + found * 0.95 + 0.95;
  faceTo(tl, rig, 'teeccub', tf, 0.15);
  antTo(tl, rig, 'alert', tf, 0.3, ease.back3);
  wobble(tl, rig, 20, tf + 0.05);
  tl.call(tf, () => playCue('focus'));
  for (const leg of [0, 0.7]) {
    tl.set(s.ring, 1, tf + 0.1 + leg)
      .set(s.ringScale, 1, tf + 0.1 + leg)
      .to(s.ring, 0, tf + 0.1 + leg, 0.7, ease.p1out)
      .to(s.ringScale, 1.35, tf + 0.1 + leg, 0.7, ease.p1out);
  }
  tl.to(s.card, 1, tf + 0.5, 0.26, ease.p2out);
  faceTo(tl, rig, 'happy', tf + 0.9, 0.3);
  antTo(tl, rig, 'focus', tf + 0.9, 0.4);
  tl.yoyo(v.sqY, 3, 0, tf + 1.2, 0.2, 4, ease.sineIO);
}
