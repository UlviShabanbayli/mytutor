/**
 * transitions.sheet: the rules of dragging a bottom sheet. Pure worklets, so the gesture runs
 * them on the UI thread and tests run them as plain functions.
 */

/** Released past this share of its height, the sheet closes. */
export const DISMISS_SHARE = 0.35;
/** Or released faster than this downwards (points per second). */
export const DISMISS_VELOCITY = 800;
/** Closed, the sheet waits this far below its own height, out of sight. */
export const CLOSED_GAP = 24;
/** The sheet reaches this far below the screen edge, so the opening overshoot shows no gap. */
export const OVERSCAN = 40;

/** Dragged above its open position, the sheet resists (y < 0 grows ever slower). */
export function rubberBand(y: number): number {
  'worklet';
  return y < 0 ? -Math.pow(-y, 0.7) : y;
}

/** Whether a release at `y` with downward `velocity` closes a sheet of `height`. */
export function shouldDismiss(y: number, height: number, velocity: number): boolean {
  'worklet';
  return y > height * DISMISS_SHARE || velocity > DISMISS_VELOCITY;
}

/** How visible the scrim is for a sheet `y` below its open position. */
export function scrimOpacity(y: number, height: number): number {
  'worklet';
  if (height <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - y / height));
}
