import { useEffect, useEffectEvent, useState } from 'react';
import { playCue } from '@/lib/cues';
import { ease } from '../rig/ease';
import { flapBurst, setBaseFlap } from '../rig/moves/flap';
import { startLife } from '../rig/moves/life';
import { faceTo, poseTo, setFace, setPose } from '../rig/moves/pose';
import { hop, wobble } from '../rig/moves/small';
import { Scope } from '../rig/scope';
import { ViziRig } from '../rig/ViziRig';
import { LiveFrame } from './LiveFrame';
import type { LiveMascotProps } from './types';
import { useLive, useScoped } from './useLive';

/**
 * vizi.streak A «Toxunanda canlanır»: a drooping Vızı (antennae and wings low, arms down, kind
 * slanted lids) sighs every 3.6s. When `recovered` turns true (the student restarts) it springs
 * back: antennae up, wings buzz 1.2s, arms up and a 22-unit hop (haptic `focus`), then `onDone`.
 * No tears. Reduced motion: the droop still pose; recovering swaps to the happy pose.
 */
export function StreakVizi(props: LiveMascotProps) {
  const { size, label, decorative, className, recovered = false } = props;
  const { rig, reduced, active } = useLive('darixdim');
  const [S] = useState(() => new Scope());
  useEffect(() => () => S.kill(), [S]);

  useScoped(
    active,
    (L) => {
      startLife(L, rig, { hover: 2, hoverDur: 2.2, flap: recovered ? 'calm' : 'rest' });
      if (recovered) return;
      const v = rig.v;
      L.play((tl) => {
        tl.yoyo(v.sqS, 0.96, 1, 0, 0.7, 2, ease.sineIO)
          .yoyo(v.sqX, 1.02, 1, 0, 0.7, 2, ease.sineIO)
          .yoyo(v.wobL, -6, 0, 0, 0.7, 2, ease.sineIO)
          .yoyo(v.wobR, 6, 0, 0, 0.7, 2, ease.sineIO)
          .yoyo(v.faceY, 2, 0, 0, 0.7, 2, ease.sineIO);
      }, 3.6);
    },
    recovered,
  );

  const recover = useEffectEvent(() => {
    if (reduced) {
      setPose(rig, 'rest');
      setFace(rig, 'happy');
      S.after(0.8, () => props.onDone?.());
      return;
    }
    S.play((tl) => {
      tl.to(rig.v.faceY, 0, 0, 0.3);
      wobble(tl, rig, -22, 0);
      poseTo(tl, rig, 'teeccub', 0, 0.18);
      tl.call(0.1, () => flapBurst(S, rig, 1.2, 'busy'));
      poseTo(tl, rig, 'bayram', 0.35, 0.3);
      hop(tl, rig, 22, 0.4);
      tl.call(0.4, () => playCue('focus'));
      poseTo(tl, rig, 'rest', 1.6, 0.45);
      faceTo(tl, rig, 'happy', 1.7, 0.3);
      tl.call(1.75, () => setBaseFlap(rig, 'calm')).call(2, () => props.onDone?.());
    });
  });
  useEffect(() => {
    if (recovered) recover();
  }, [recovered]);

  return (
    <LiveFrame
      width={size}
      height={size}
      label={label}
      decorative={decorative}
      className={className}
    >
      <ViziRig rig={rig} size={size} />
    </LiveFrame>
  );
}
