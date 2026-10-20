import { RANK_IDS } from '@mytutor/schemas';
import type { RankId } from '@mytutor/types';

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
 * Where the student stands on the rank ladder: the rank the world gives, and the next rank with
 * the points it starts at (null at the top rank; the ladder itself lives on the server, P2).
 */
export function rankProgress(
  rank: RankId,
  points: number,
  next: { minPoints: number } | null,
): RankProgress {
  const index = Math.max(0, RANK_IDS.indexOf(rank));
  if (next === null) return { index, target: null, ratio: 1, remaining: 0 };
  return {
    index,
    target: next.minPoints,
    ratio: Math.min(1, points / next.minPoints),
    remaining: Math.max(0, next.minPoints - points),
  };
}
