import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { playCue } from '@/lib/cues';
import { POSES, type PoseName } from '../rig/data/scenes';
import { elasticOut, ease } from '../rig/ease';
import { flapBurst } from '../rig/moves/flap';
import { react } from '../rig/moves/life';
import { faceTo, poseTo, setFace, setPose } from '../rig/moves/pose';
import { dizzy, spinTurn, talk, wobble } from '../rig/moves/small';
import type { Rig } from '../rig/rigValues';
import { Scope } from '../rig/scope';
import type { Timeline } from '../rig/timeline';

const release = elasticOut(1.2, 0.4);

/**
 * vizi.tap B «Qıdıqlanır»: every tap counts (the count resets after 3s). Taps 1–2 giggle, tap 3
 * spins with dizzy eyes, tap 4+ opens the arms calmly: «Bəsdir, gəl dərsə qayıdaq!». Haptic
 * `tap` per tap, `focus` on the spin. Reduced motion: a face swap and the line.
 */
export function useTapReactions(
  rig: Rig,
  base: PoseName,
  reduced: boolean,
  speak: (t: string | null) => void,
) {
  const { t } = useTranslation();
  const [S] = useState(() => new Scope());
  const count = useRef(0);
  const current = useRef<Timeline | null>(null);
  useEffect(() => () => S.kill(), [S]);

  const onPressIn = () => {
    if (reduced) return;
    current.current?.kill();
    current.current = S.play((tl) =>
      tl.to(rig.v.sqS, 0.9, 0, 0.09, ease.p2out).to(rig.v.sqX, 1.07, 0, 0.09, ease.p2out),
    );
  };

  const onPress = () => {
    const n = Math.min(4, (count.current += 1));
    S.after(3, () => {
      if (count.current === n) count.current = 0;
    });
    playCue(n === 3 ? 'focus' : 'tap');
    const line = t(`mascot.giggle${n}` as 'mascot.giggle1');
    if (reduced) {
      setFace(rig, n >= 4 ? 'teselli' : 'happy');
      speak(line);
      S.after(1.3, () => {
        setPose(rig, base);
        speak(null);
      });
      return;
    }
    const back = POSES[base].e;
    current.current?.kill();
    current.current = react(S, rig, (tl) => {
      const v = rig.v;
      tl.to(v.sqS, 1, 0, 0.5, release)
        .to(v.sqX, 1, 0, 0.5, release)
        .call(0.05, () => speak(line));
      if (n <= 2) {
        faceTo(tl, rig, 'sevinc', 0, 0.14);
        tl.to(v.cheekS, 1.3, 0, 0.2, ease.back3).to(v.cheekS, 1, 1.4, 0.4);
        [7, -6, 5, -4, 3, -1, 0].forEach((r, i) =>
          tl.to(v.spin, r, (i * 0.8) / 7, 0.8 / 7, ease.none),
        );
        talk(tl, rig, 0.15, 0.6, 'laugh', ['laugh', 'talkS', 'talkW', 'laugh']);
        tl.call(0, () => flapBurst(S, rig, 0.6));
        wobble(tl, rig, 16, 0.05);
        faceTo(tl, rig, back, 1.5, 0.3);
        tl.call(2.3, () => speak(null));
      } else if (n === 3) {
        faceTo(tl, rig, 'teeccub', 0, 0.12);
        spinTurn(tl, rig, 0.05, 0.7);
        wobble(tl, rig, -20, 0.7);
        dizzy(tl, rig, 0.8, 1);
        faceTo(tl, rig, 'happy', 1.9, 0.25);
        tl.call(2.6, () => speak(null));
        faceTo(tl, rig, back, 2.7, 0.3);
      } else {
        poseTo(tl, rig, 'teselli', 0, 0.35);
        faceTo(tl, rig, 'happy', 0.1, 0.25);
        poseTo(tl, rig, base, 1.9, 0.45);
        tl.call(2.5, () => speak(null));
      }
    });
  };

  return { onPress, onPressIn };
}
