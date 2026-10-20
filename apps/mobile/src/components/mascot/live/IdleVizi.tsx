import { MOOD_POSE } from '../rig/data/scenes';
import { startLife } from '../rig/moves/life';
import { ViziRig } from '../rig/ViziRig';
import { LiveFrame } from './LiveFrame';
import { MascotBubble } from './MascotBubble';
import type { LiveMascotProps } from './types';
import { hideForEntrance, useEntrance } from './useEntrance';
import { useLive, useScoped } from './useLive';
import { useSpeech } from './useSpeech';
import { useTapReactions } from './useTapReactions';

const IDLE_C = { hover: 7, hoverDur: 1.25, flap: 'busy', look: true, fidget: true } as const;

/**
 * vizi.idle C «Oynaq»: hover 7 units every 1.25s, fast wings (±16°/60ms), blinks, glances and a
 * random fidget every 3.4–6s (hop, antenna boing, a smile, a wing buzz, a look around, a sway).
 * With `tappable` (or `behavior="tap"`) taps tickle it; with `enter` it flies in first.
 * Reduced motion: the mood's still pose.
 */
export function IdleVizi(props: LiveMascotProps) {
  const { mood, size, label, decorative, className, behavior, enter = false } = props;
  const base = MOOD_POSE[mood];
  const flies = enter || props.visible !== undefined;
  const { rig, reduced, active } = useLive(base, base, enter ? hideForEntrance : undefined);
  const { bubble, speak } = useSpeech(size, props.onSay);
  const tap = useTapReactions(rig, base, reduced, speak);
  const tappable = props.tappable || behavior === 'tap';

  // The tap sample idles calmly (lab: hover 4); the idle sample is the playful C.
  useScoped(active, (S) => startLife(S, rig, behavior === 'tap' ? { hover: 4 } : IDLE_C));
  useEntrance(rig, {
    enter,
    visible: props.visible ?? true,
    base,
    size,
    reduced,
    onExited: props.onExited,
  });

  return (
    <LiveFrame
      width={size}
      height={size}
      label={label}
      decorative={decorative}
      className={className}
      onPress={tappable ? tap.onPress : undefined}
      onPressIn={tappable ? tap.onPressIn : undefined}
    >
      <ViziRig rig={rig} size={size} speedLines={flies} />
      <MascotBubble text={bubble} size={size} reduced={reduced} />
    </LiveFrame>
  );
}
