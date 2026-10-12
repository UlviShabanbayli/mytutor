import { interpolate } from 'remotion';

/** How long wiping the board takes, at the start of a clearing step. */
export const WIPE_SECONDS = 0.4;

/** An action's opacity while the board is wiped under it; 0 once it is gone. */
export function wipeOpacity(frame: number, until: number | undefined, fps: number): number {
  if (until === undefined) return 1;
  return interpolate(frame, [until, until + WIPE_SECONDS * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
