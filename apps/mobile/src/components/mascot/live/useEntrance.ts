import { useEffect, useEffectEvent, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { duration } from '@/motion';
import { ease } from '../rig/ease';
import { setFlap, setSpeed } from '../rig/moves/flap';
import { poseTo, setPose } from '../rig/moves/pose';
import { wobble } from '../rig/moves/small';
import type { PoseName } from '../rig/data/scenes';
import type { Rig } from '../rig/rigValues';
import { Scope } from '../rig/scope';

type EntranceOptions = {
  enter: boolean;
  visible: boolean;
  base: PoseName;
  size: number;
  reduced: boolean;
  onExited?: () => void;
};

/** Hides the rig before its first frame when it is going to fly in. */
export function hideForEntrance(rig: Rig): void {
  rig.v.hostOpacity.value = 0;
}

/**
 * vizi.enterexit B «Uçuş». Enter: flies in from the left (700ms power2.out, arc −40 → 8 → 0,
 * lean −12°, speed lines), brakes (lean −18°) and settles elastically. Exit: dips with a squash,
 * then shoots up and right (450ms power2.in) stretched, with speed lines. Reduced: 150ms fades.
 */
export function useEntrance(rig: Rig, o: EntranceOptions): void {
  const { width } = useWindowDimensions();
  const first = useRef(true);
  const run = useEffectEvent((visible: boolean, S: Scope) => {
    const v = rig.v;
    const k = o.size / 200;
    // Lab offsets are pixels of a 128pt Vızı; here they scale with the size.
    const px = (n: number) => (n * o.size) / 128 / k;
    const away = (width / 2 + o.size) / k;
    const isFirst = first.current;
    first.current = false;
    if (visible && isFirst && !o.enter) return;
    if (o.reduced) {
      S.play((tl) => {
        tl.to(v.hostOpacity, visible ? 1 : 0, 0, duration.reduced / 1000, ease.none);
        if (!visible) tl.call(duration.reduced / 1000, () => o.onExited?.());
      });
      return;
    }
    if (visible) {
      setPose(rig, 'ucur');
      setFlap(rig, 'fly');
      setSpeed(rig, true);
      S.play((tl) => {
        tl.set(v.hostOpacity, 1, 0)
          .set(v.hostX, -away, 0)
          .set(v.hostY, px(-40), 0)
          .set(v.hostRot, -12, 0);
        tl.to(v.hostX, 0, 0.01, 0.7, ease.p2out)
          .to(v.hostY, px(8), 0.01, 0.35, ease.sineIO)
          .to(v.hostY, 0, 0.36, 0.35, ease.sineIO)
          .to(v.hostRot, -18, 0.5, 0.2)
          .call(0.6, () => {
            setSpeed(rig, false);
            setFlap(rig, rig.model.baseFlap);
          })
          .to(v.hostRot, 0, 0.7, 0.6, ease.settle);
        poseTo(tl, rig, o.base, 0.6, 0.35);
        wobble(tl, rig, -12, 0.65);
      });
      return;
    }
    S.play((tl) => {
      tl.to(v.sqY, 6, 0, 0.12, ease.p2out)
        .to(v.sqS, 0.92, 0, 0.12, ease.p2out)
        .to(v.sqX, 1.06, 0, 0.12, ease.p2out);
      poseTo(tl, rig, 'ucur', 0, 0.15);
      tl.call(0.1, () => {
        setFlap(rig, 'fly');
        setSpeed(rig, true);
      });
      tl.to(v.sqY, 0, 0.12, 0.2).to(v.sqS, 1.1, 0.12, 0.2).to(v.sqX, 0.94, 0.12, 0.2);
      tl.to(v.hostX, away, 0.12, 0.45, ease.p2in)
        .to(v.hostY, px(-130), 0.12, 0.45, ease.p2in)
        .to(v.hostRot, -14, 0.12, 0.45, ease.p2in)
        .set(v.hostOpacity, 0, 0.6)
        .set(v.sqS, 1, 0.6)
        .set(v.sqX, 1, 0.6)
        .call(0.6, () => {
          setSpeed(rig, false);
          setFlap(rig, rig.model.baseFlap);
          setPose(rig, o.base);
          o.onExited?.();
        });
    });
  });

  useEffect(() => {
    const S = new Scope();
    run(o.visible, S);
    return () => S.kill();
  }, [o.visible]);
}
