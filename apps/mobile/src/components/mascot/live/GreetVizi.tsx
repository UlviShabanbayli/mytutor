import { useState } from 'react';
import { View } from 'react-native';
import { playCue } from '@/lib/cues';
import { HexCell } from '@/components/ui/HexCell';
import { ease } from '../rig/ease';
import { flapBurst } from '../rig/moves/flap';
import { startLife } from '../rig/moves/life';
import { poseTo } from '../rig/moves/pose';
import { blink, look, wave, wobble } from '../rig/moves/small';
import { markBusy } from '../rig/rigValues';
import { ViziRig } from '../rig/ViziRig';
import { LiveFrame } from './LiveFrame';
import { MascotBubble } from './MascotBubble';
import type { LiveMascotProps } from './types';
import { useLive, useScoped } from './useLive';
import { useSpeech } from './useSpeech';
import { useTapReactions } from './useTapReactions';

/** Below the ledge, Vızı is out of sight (viewBox units of host y). */
const HIDDEN = 234;

/**
 * vizi.greet C «Pətəkdən çıxır»: Vızı peeks out from behind a honeycomb ledge (rise 550ms), looks
 * left and right, blinks, dips, jumps out with a stretch, lands elastically with arms up and
 * waves; then it idles (vizi.idle C). Haptic `press` on the jump. Reduced: standing above the
 * ledge in the waving pose with the line.
 */
export function GreetVizi(props: LiveMascotProps) {
  const { size, label, decorative, className, say } = props;
  const { rig, reduced, active } = useLive('rest', 'hero', (r) => {
    r.v.hostY.value = HIDDEN;
  });
  const { bubble, speak } = useSpeech(size, props.onSay);
  const tap = useTapReactions(rig, 'hero', reduced, speak);
  const [greeted, setGreeted] = useState(reduced);

  useScoped(true, (S) => {
    if (reduced) {
      if (say) speak(say);
      return;
    }
    const v = rig.v;
    const tl = S.play((t) => {
      t.to(v.hostY, 116, 0.3, 0.55, ease.p2out);
      wobble(t, rig, 12, 0.6);
      look(t, rig, -8, 2, 1.1, 0.25);
      look(t, rig, 8, 2, 1.55, 0.25);
      blink(t, rig, 1.9);
      look(t, rig, 0, 0, 2.1, 0.25);
      t.to(v.hostY, 132, 2.4, 0.14, ease.p2in)
        .to(v.sqS, 0.9, 2.4, 0.14)
        .to(v.sqX, 1.08, 2.4, 0.14)
        .to(v.hostY, -15.6, 2.54, 0.32, ease.p2out)
        .to(v.sqS, 1.1, 2.54, 0.2)
        .to(v.sqX, 0.93, 2.54, 0.2)
        .call(2.54, () => {
          playCue('press');
          flapBurst(S, rig, 0.8);
        })
        .to(v.sqS, 1, 2.74, 0.5, ease.land)
        .to(v.sqX, 1, 2.74, 0.5, ease.land)
        .to(v.hostY, 0, 2.86, 0.45, ease.p2io);
      poseTo(t, rig, 'bayram', 2.6, 0.25);
      wobble(t, rig, -16, 2.8);
      poseTo(t, rig, 'hero', 3.3, 0.35);
      wave(t, rig, 2, 3.6);
      t.call(3.65, () => speak(say ?? null)).call(4.5, () => setGreeted(true));
    });
    markBusy(rig, tl.duration);
  });
  useScoped(
    active,
    (S) =>
      startLife(
        S,
        rig,
        greeted
          ? { hover: 7, hoverDur: 1.25, flap: 'busy', look: true, fidget: true }
          : { hover: 3 },
      ),
    greeted,
  );

  const cell = size * 0.4;
  const top = size * 0.16;
  const ledge = top + size * 0.9;
  const width = size * 1.26;

  return (
    <LiveFrame
      width={width}
      height={ledge + cell * 1.125}
      label={label}
      decorative={decorative}
      className={className}
      onPress={props.tappable && greeted ? tap.onPress : undefined}
      onPressIn={props.tappable && greeted ? tap.onPressIn : undefined}
    >
      <View
        className="absolute left-0 top-0 overflow-hidden"
        style={{ width, height: ledge + size * 0.14 }}
      >
        <View className="absolute" style={{ left: (width - size) / 2, top }}>
          <ViziRig rig={rig} size={size} />
        </View>
      </View>
      <View
        className="absolute left-0 flex-row justify-center"
        style={{ top: ledge, width, gap: size * 0.03 }}
      >
        <HexCell state="reinforced" size={cell} />
        <HexCell state="mastered" size={cell} />
        <HexCell state="reinforced" size={cell} />
      </View>
      <MascotBubble text={bubble} size={width} reduced={reduced} />
    </LiveFrame>
  );
}
