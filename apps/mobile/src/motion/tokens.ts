import { Easing } from 'react-native-reanimated';
import type { WithSpringConfig } from 'react-native-reanimated';

/**
 * Motion values of the arı app, taken from the variants approved in the motion lab
 * (docs/design/motion.md). Components use these names instead of their own numbers, so the
 * app keeps one rhythm: quick taps, calm screens, a bit of bounce only where something is won.
 */
export const duration = {
  /** A finger presses something down. */
  press: 80,
  /** Colour swaps, labels leaving, fades of small things. */
  quick: 120,
  /** The default for small enter animations and cross-fades. */
  base: 220,
  /** Screens and panels entering. */
  enter: 280,
  /** Larger surfaces: dialogs, frames opening. */
  surface: 320,
  /** Fills of cells and rings. */
  fill: 400,
  /** Celebrations (goal done, cell sealed). */
  celebrate: 900,
  /** The fallback when the student asked for less motion: a short fade instead. */
  reduced: 150,
  /** micro.camera: the scrim around the frame darkens after the shot. */
  dim: 160,
  /** micro.copy: the copied code flashes nectar. */
  flash: 600,
  /** micro.typing: one half of the hexagon pulse (a 1400ms loop). */
  pulse: 700,
  /** micro.timer: the chip turns from honey to err at 05:00. */
  warn: 900,
  /** micro.copy: "Kopyalandı" turns back into "Kopyala". */
  revert: 1800,
} as const;

export const easing = {
  /** Things arriving: fast start, soft landing — cubic-bezier(.2,.8,.2,1). */
  enter: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** Things leaving or closing — cubic-bezier(.4,0,.2,1). */
  exit: Easing.bezier(0.4, 0, 0.2, 1),
  /** Things leaving for good (toasts, old step content) — cubic-bezier(.4,0,1,1). */
  away: Easing.bezier(0.4, 0, 1, 1),
  /** A small overshoot for pops — cubic-bezier(.34,1.56,.64,1). */
  pop: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Liquid filling a cell — cubic-bezier(.33,0,.2,1). */
  fill: Easing.bezier(0.33, 0, 0.2, 1),
  /** Breathing and other loops. */
  breathe: Easing.inOut(Easing.sin),
  /** Pressing down. */
  press: Easing.out(Easing.quad),
  /** micro.done: a ring drawing itself, even at both ends — cubic-bezier(.65,0,.35,1). */
  draw: Easing.bezier(0.65, 0, 0.35, 1),
  /** micro.timer: colour tweens — ease-in-out. */
  inOut: Easing.inOut(Easing.ease),
} as const;

/** Spring presets; each names the approved sample it comes from. */
export const spring = {
  /** buttons.primary: the face comes back up with ~1px overshoot. */
  press: { damping: 12, stiffness: 320, mass: 0.7 },
  /** buttons.spot and other calm releases: no visible bounce. */
  calm: { damping: 20, stiffness: 300 },
  /** buttons.grade, feedback.select letter: a small pop back to rest. */
  pop: { damping: 10, stiffness: 300 },
  /** buttons.enable: the button stands up, ready. */
  standUp: { damping: 10, stiffness: 240 },
  /** buttons.tabbar: the icon lands with a soft dip. */
  land: { damping: 8, stiffness: 300 },
  /** buttons.switch: the knob travels. */
  knob: { damping: 13, stiffness: 260 },
  /** buttons.segment: the honey indicator slides. */
  indicator: { damping: 18, stiffness: 240 },
  /** feedback.select: the chosen option lifts. */
  lift: { damping: 14, stiffness: 260 },
  /** transitions.list, feedback rows: hexagons pop in. */
  list: { damping: 14, stiffness: 260 },
  /** hive.cell-tap: a cell is pressed and released. */
  cell: { damping: 13, stiffness: 220 },
  /** transitions.sheet: a sheet opens (about 7% overshoot). */
  sheetOpen: { damping: 18, stiffness: 200, mass: 1 },
  /** transitions.sheet: a sheet closes, carrying the release velocity. */
  sheetClose: { damping: 22, stiffness: 220 },
  /** transitions.toast: the offline banner drops in. */
  banner: { damping: 20, stiffness: 240 },
  /** transitions.toast: a toast springs up from below. */
  toast: { damping: 16, stiffness: 220 },
  /** micro.badge: a count badge appears (peak ≈1.2). */
  badge: { damping: 11, stiffness: 220 },
  // Reanimated 4 defaults `mass` to 4 (Reanimated 3 used 1), which makes a lab spring twice as
  // slow and much bouncier; the micro.* springs below set it explicitly.
  /** micro.count: rolling digits. */
  digits: { damping: 15, stiffness: 160, mass: 1 },
  /** micro.field: the focus ring settles after its pulse. */
  ring: { damping: 16, stiffness: 240, mass: 1 },
  /** micro.camera: the frame springs back from 0.96 at the shot, without a bounce. */
  frame: { damping: 20, stiffness: 300, mass: 1 },
} as const satisfies Record<string, WithSpringConfig>;
