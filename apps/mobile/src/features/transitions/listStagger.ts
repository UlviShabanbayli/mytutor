/**
 * transitions.list C timing: rows come in 70ms apart; from the sixth row on they arrive with
 * the sixth, so a long list never keeps the student waiting. The text follows 80ms after the
 * row's hexagon.
 */
export const STAGGER_MS = 70;
export const TEXT_LAG_MS = 80;
export const MAX_STAGGERED = 6;

export function rowDelay(index: number): number {
  return Math.min(Math.max(index, 0), MAX_STAGGERED - 1) * STAGGER_MS;
}

export function textDelay(index: number): number {
  return rowDelay(index) + TEXT_LAG_MS;
}
