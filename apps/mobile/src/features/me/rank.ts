export type RankProgress = {
  /** Index of the current rank (0 = the first rank). */
  index: number;
  /** Points needed for the next rank, or null at the top rank. */
  target: number | null;
  /** Share of the next rank's points already collected (0–1); 1 at the top rank. */
  ratio: number;
  /** Points still missing for the next rank; 0 at the top rank. */
  remaining: number;
};

/**
 * Where a point total sits on the rank ladder. `thresholds` are the points each rank starts at,
 * ascending, the first one 0 (the real ones come from the server, architecture P2).
 */
export function rankProgress(points: number, thresholds: readonly number[]): RankProgress {
  let index = 0;
  thresholds.forEach((start, i) => {
    if (points >= start) index = i;
  });
  const target = thresholds[index + 1] ?? null;
  if (target === null) return { index, target: null, ratio: 1, remaining: 0 };
  return { index, target, ratio: Math.min(1, points / target), remaining: target - points };
}
