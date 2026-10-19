import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { playCue } from '@/lib/cues';
import { ease } from '../rig/ease';
import { flapBurst } from '../rig/moves/flap';
import { react, startLife } from '../rig/moves/life';
import { antTo, faceTo, poseTo, setPose } from '../rig/moves/pose';
import { hop, wobble } from '../rig/moves/small';
import { Scope } from '../rig/scope';
import { ViziRig } from '../rig/ViziRig';
import { SleepyZs } from '../scenes/SleepyZs';
import { LiveFrame } from './LiveFrame';
import { MascotBubble } from './MascotBubble';
import type { LiveMascotProps } from './types';
import { useLive, useScoped } from './useLive';
import { useSpeech } from './useSpeech';

/**
 * vizi.sleepy B «Yatır (toxun)»: asleep, eyes closed, a deep slow breath, slow wings, a new z
 * every 1.2s. A tap wakes it: big eyes, antennae spring up, a small hop and a wing buzz, the
 * line «Oyandım!…»; it falls asleep again after 4.5s. Haptic `press` on waking. Reduced
 * motion: the still sleeping pose; a tap swaps to the awake face and the line.
 */
export function SleepyVizi(props: LiveMascotProps) {
  const { size, label, decorative, className } = props;
  const { t } = useTranslation();
  const { rig, reduced, active } = useLive('yatir');
  const { bubble, speak } = useSpeech(size, props.onSay);
  const [awake, setAwake] = useState(false);
  const [S] = useState(() => new Scope());
  useEffect(() => () => S.kill(), [S]);

  useScoped(active, (L) =>
    startLife(L, rig, { hover: 2, hoverDur: 2.6, flap: 'rest', deep: true }),
  );

  const wake = () => {
    if (awake) return;
    setAwake(true);
    playCue('press');
    const line = t('mascot.wake');
    if (reduced) {
      setPose(rig, 'rest');
      speak(line);
      S.after(4.5, () => {
        speak(null);
        setPose(rig, 'yatir');
        setAwake(false);
      });
      return;
    }
    flapBurst(S, rig, 0.8);
    react(S, rig, (tl) => {
      faceTo(tl, rig, 'teeccub', 0, 0.12);
      antTo(tl, rig, 'alert', 0, 0.3, ease.back3);
      wobble(tl, rig, 20, 0.05);
      hop(tl, rig, 12, 0.05);
      poseTo(tl, rig, 'rest', 0.5, 0.4);
      tl.call(0.6, () => speak(line)).call(4.4, () => speak(null));
      poseTo(tl, rig, 'yuxulu', 4.5, 1);
      poseTo(tl, rig, 'yatir', 5.6, 0.6);
      tl.call(5.9, () => setAwake(false));
    });
  };

  return (
    <LiveFrame
      width={size}
      height={size}
      label={label}
      decorative={decorative}
      className={className}
      onPress={wake}
    >
      <ViziRig rig={rig} size={size} />
      <SleepyZs size={size} moving={active} shown={!awake} />
      <MascotBubble text={bubble} size={size} reduced={reduced} />
    </LiveFrame>
  );
}
