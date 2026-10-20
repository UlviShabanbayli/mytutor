import type { CellState } from '@/components/ui/HexCell';
import type { WeakSpot } from './types';

/** Orders topic numbers like "2.10" after "2.9". */
function compareTopics(a: string, b: string): number {
  const [a1 = 0, a2 = 0] = a.split('.').map(Number);
  const [b1 = 0, b2 = 0] = b.split('.').map(Number);
  return a1 - b1 || a2 - b2;
}

/**
 * The row Vızı scouts on the weak-spots screen: the weak topics in textbook order (at most five)
 * and the one it "finds", the first spot of the report (the one opened below).
 */
export function scoutRow(spots: readonly Pick<WeakSpot, 'topic' | 'state'>[]): {
  cells: { label: string; state: CellState }[];
  found: number;
} {
  const first = spots[0]?.topic;
  const cells = spots
    .slice(0, 5)
    .map((s) => ({ label: s.topic, state: s.state }))
    .sort((a, b) => compareTopics(a.label, b.label));
  return {
    cells,
    found: Math.max(
      0,
      cells.findIndex((c) => c.label === first),
    ),
  };
}
