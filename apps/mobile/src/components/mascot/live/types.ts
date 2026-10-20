import type { MascotMood } from '../moodArt';

/**
 * What a live Vızı does (docs/design/motion.md, "Vızı — canlı maskot"; the approved variant in
 * brackets):
 * - `idle` (C): hovers, breathes, beats its wings, blinks, glances and fidgets.
 * - `tap` (B): idle, and each tap tickles it (giggles, a spin on the third tap, calm on the fourth).
 * - `greet` (C): peeks out from behind a honeycomb ledge, jumps out and waves; then idles.
 * - `correct` (C): spins with a hop, grins and winks (feedback panels place it).
 * - `wrong` (A): a calm kind face, a head tilt and two slow nods; no haptic (feedback panels).
 * - `done` (A): arms up, a big hop with fast wings, laughs (the lesson-done scene adds the drops).
 * - `think` (C): a focused face whose eyes follow three cells filling (`ThinkCells`).
 * - `loading` (B): flies a figure eight in place, mirroring at the turns.
 * - `sleepy` (B): asleep with floating z's; a tap wakes it for a moment.
 * - `streak` (A): droops and sighs; when `recovered` turns true it springs back up.
 * Scenes with their own pieces are separate components: `ViziScout` (scout A), `ViziReward`
 * (reward B) and `ViziNarrator` (explain C).
 */
export type MascotBehavior =
  | 'idle'
  | 'tap'
  | 'greet'
  | 'correct'
  | 'wrong'
  | 'done'
  | 'think'
  | 'loading'
  | 'sleepy'
  | 'streak';

/** Options of a live mascot; each applies to the behaviours named in its comment. */
export type LiveOptions = {
  /** idle, greet: taps tickle Vızı (vizi.tap B). `behavior="tap"` turns it on as well. */
  tappable?: boolean;
  /** idle, tap: flies in from the left when it appears (vizi.enterexit B). */
  enter?: boolean;
  /** idle, tap: false flies Vızı out to the upper right, then calls `onExited`. */
  visible?: boolean;
  onExited?: () => void;
  /**
   * correct, wrong, done, think: waits this long (ms) before the one-off moment plays, e.g. until
   * the panel or card around Vızı has entered. A hidden entrance (correct) stays hidden till then.
   */
  delay?: number;
  /** greet, correct: the line in Vızı's bubble when the moment peaks (e.g. «Əla!»). */
  say?: string;
  /**
   * tap, sleepy, greet, correct: receives Vızı's lines (giggles, waking up) so the screen can
   * show them in its own bubble; null hides it. Without it, mascots of 96pt and more draw a
   * bubble beside the head and smaller ones stay silent.
   */
  onSay?: (text: string | null) => void;
  /** streak: turns true when the student restarts; Vızı recovers, then `onDone` runs. */
  recovered?: boolean;
  onDone?: () => void;
};

export type LiveMascotProps = LiveOptions & {
  behavior: MascotBehavior;
  mood: MascotMood;
  size: number;
  label: string;
  decorative: boolean;
  className?: string;
};
