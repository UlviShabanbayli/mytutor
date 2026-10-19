/**
 * transitions.refresh: the rules of pulling a list down to refresh it. Pure worklets, so the
 * gesture runs them on the UI thread and tests run them as plain functions.
 */

/** Pulled this far (pt), the list refreshes on release; it holds here while loading. */
export const PULL_THRESHOLD = 56;
/** The list moves half as far as the finger. */
export const PULL_RESISTANCE = 0.5;
/** And never further than this. */
export const PULL_MAX = 100;

/** How far the list moves for a finger `dragged` down since the list reached its top. */
export function pullOffset(dragged: number): number {
  'worklet';
  return Math.min(PULL_MAX, Math.max(0, dragged * PULL_RESISTANCE));
}

/** How far into the pull Vızı is, 0–1 (she comes down and straightens up with it). */
export function pullProgress(offset: number): number {
  'worklet';
  return Math.min(1, Math.max(0, offset / PULL_THRESHOLD));
}
