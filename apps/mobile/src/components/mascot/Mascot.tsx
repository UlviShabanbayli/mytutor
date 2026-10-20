import { MascotLive } from './live/MascotLive';
import type { LiveOptions, MascotBehavior } from './live/types';
import { MascotStill } from './MascotStill';
import { moodArt, type MascotMood } from './moodArt';
import { moments, type MascotMoment } from './moments';

export type { MascotBehavior } from './live/types';

type MascotProps = ({ moment: MascotMoment; mood?: never } | { mood: MascotMood; moment?: never }) &
  LiveOptions & {
    size?: number;
    /** Hide from screen readers when the text next to it says the same thing. */
    decorative?: boolean;
    className?: string;
    /**
     * Brings Vızı to life (docs/design/motion.md, "Vızı — canlı maskot"); without it the mood is
     * drawn still, exactly as before. Use at most one live Vızı per screen and never in a list
     * row: live mascots run loops while their screen is focused.
     */
    behavior?: MascotBehavior;
  };

/**
 * Vızı, the bee. Rules from the design: at most one on a screen, never inside a test question,
 * never shaming. Same colors in both schemes (the mascot carries its own light).
 */
export function Mascot(props: MascotProps) {
  const { moment, mood, size = 120, decorative = false, className, behavior, ...live } = props;
  const name = mood ?? moments[moment];
  if (!behavior)
    return <MascotStill mood={name} size={size} decorative={decorative} className={className} />;
  return (
    <MascotLive
      {...live}
      behavior={behavior}
      mood={name}
      size={size}
      label={moodArt[name].label}
      decorative={decorative}
      className={className}
    />
  );
}
