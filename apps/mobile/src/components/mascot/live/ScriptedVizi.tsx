import { setFace } from '../rig/moves/pose';
import { startLife } from '../rig/moves/life';
import { markBusy } from '../rig/rigValues';
import { ViziRig } from '../rig/ViziRig';
import { LiveFrame } from './LiveFrame';
import { MascotBubble } from './MascotBubble';
import { SCRIPTS, type ScriptName } from './scripts';
import type { LiveMascotProps } from './types';
import { useLive, useScoped } from './useLive';
import { useSpeech } from './useSpeech';

type ScriptedViziProps = LiveMascotProps & { behavior: ScriptName };

/**
 * A moment Vızı plays on its own (correct, wrong, done, think; see `scripts.ts`). The one-off
 * part plays once when it appears, even if the screen loses focus meanwhile; idle life and loops
 * run only while the screen is focused; `delay` holds the one-off part back. Reduced motion: the
 * still pose, the line at once.
 */
export function ScriptedVizi(props: ScriptedViziProps) {
  const { size, label, decorative, className, say, delay = 0 } = props;
  const script = SCRIPTS[props.behavior];
  const { rig, reduced, active } = useLive(script.pose, script.reduced.pose, script.init);
  const { bubble, speak } = useSpeech(size, props.onSay);

  useScoped(true, (S) => {
    if (reduced) {
      if (script.reduced.face) setFace(rig, script.reduced.face);
      if (say) speak(say);
      return;
    }
    const once = script.once;
    if (!once) return;
    const play = () => {
      const tl = S.play((t) => once(t, { rig, S, speak, say }));
      markBusy(rig, tl.duration);
    };
    if (delay <= 0) {
      play();
      return;
    }
    // No fidgets while waiting: the moment starts from a calm rig.
    markBusy(rig, delay / 1000);
    S.after(delay / 1000, play);
  });
  useScoped(active, (S) => {
    startLife(S, rig, script.life);
    if (script.loop) {
      const loop = script.loop;
      S.play((tl) => loop.build(tl, rig), loop.period);
    }
  });

  return (
    <LiveFrame
      width={size}
      height={size}
      label={label}
      decorative={decorative}
      className={className}
    >
      <ViziRig rig={rig} size={size} />
      <MascotBubble text={bubble} size={size} reduced={reduced} />
    </LiveFrame>
  );
}
