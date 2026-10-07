import type { StrokePath } from '../prepare/types';

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Share of an action that is drawn at `frame`. */
export const actionProgress = (frame: number, from: number, to: number) =>
  clamp01((frame - from) / Math.max(1, to - from));

/**
 * Splits an action's progress across its paths in order, by length:
 * returns each path's own 0–1 progress and the frame it finishes on.
 */
export function pathProgress(paths: StrokePath[], progress: number, from: number, to: number) {
  const total = paths.reduce((sum, p) => sum + p.length, 0) || 1;
  let start = 0;
  return paths.map((p) => {
    const end = start + p.length;
    const own = clamp01((progress * total - start) / Math.max(p.length, 1));
    const doneAt = from + (end / total) * (to - from);
    start = end;
    return { path: p, progress: own, doneAt };
  });
}
