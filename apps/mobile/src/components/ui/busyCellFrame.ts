export type BusyCellFrame = {
  /** How full the cell is, 0–1, filling from the bottom. */
  fill: number;
  opacity: number;
};

/** CSS `ease-out`, close enough for a 300 ms fill: fast start, soft end. */
function easeOut(t: number): number {
  'worklet';
  return 1 - (1 - t) * (1 - t);
}

/**
 * buttons.loading C: one hex cell at `phase` (0–1) of its loop. The first quarter fills it
 * bottom→top, the middle half holds it full, the last quarter fades it out; then it repeats.
 */
export function busyCellFrame(phase: number): BusyCellFrame {
  'worklet';
  const p = phase - Math.floor(phase);
  if (p < 0.25) return { fill: easeOut(p / 0.25), opacity: 1 };
  if (p < 0.75) return { fill: 1, opacity: 1 };
  return { fill: 1, opacity: 1 - easeOut((p - 0.75) / 0.25) };
}
