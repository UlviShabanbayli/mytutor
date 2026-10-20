/**
 * micro.header B: over the first 56pt of scrolling the large title shrinks to 0.6 and slides
 * up into the bar, left-aligned. These helpers place it from measured layout.
 */
export const COLLAPSE_DISTANCE = 56;
export const COLLAPSED_SCALE = 0.6;
/** Height of the bar the title settles in (room for a 48pt icon button). */
export const BAR_HEIGHT = 56;

/** How far a box at `top` with `height` moves so that, scaled from its top, it centres in the bar. */
export function dockShift(top: number, height: number, scale: number, bar = BAR_HEIGHT): number {
  return (bar - height * scale) / 2 - top;
}
