import type { MatchStep } from './types';

// Matching: pick an item on one side, then its partner on the other; tapping a paired item
// splits the pair. The answer is stored as the right-hand index for each left item ("2,0,").

export type MatchSide = 'left' | 'right';

export type MatchState = {
  /** For each left item, the index of the right item paired with it, or null. */
  pairs: (number | null)[];
  picked: { side: MatchSide; index: number } | null;
};

export const emptyMatch = (size: number): MatchState => ({
  pairs: Array.from({ length: size }, () => null),
  picked: null,
});

export function encodeMatch(pairs: (number | null)[]): string {
  return pairs.map((p) => (p === null ? '' : String(p))).join(',');
}

export function decodeMatch(answer: string | undefined, size: number): (number | null)[] {
  const parts = answer ? answer.split(',') : [];
  return Array.from({ length: size }, (_, i) => {
    const part = parts[i];
    return part === undefined || part === '' ? null : Number(part);
  });
}

/** The left item paired with a right item, or -1. */
export const leftOf = (pairs: (number | null)[], right: number) => pairs.indexOf(right);

export function pick(state: MatchState, side: MatchSide, index: number): MatchState {
  const { pairs, picked } = state;
  const pairedLeft = side === 'left' ? (pairs[index] !== null ? index : -1) : leftOf(pairs, index);
  if (pairedLeft >= 0) {
    // Tapping a pair splits it.
    return { pairs: pairs.map((p, i) => (i === pairedLeft ? null : p)), picked: null };
  }
  if (picked && picked.side === side) {
    return { pairs, picked: picked.index === index ? null : { side, index } };
  }
  if (picked) {
    const left = side === 'left' ? index : picked.index;
    const right = side === 'right' ? index : picked.index;
    return { pairs: pairs.map((p, i) => (i === left ? right : p)), picked: null };
  }
  return { pairs, picked: { side, index } };
}

/** 1-based number of the pair a left item belongs to, counted in left order; 0 when unpaired. */
export function pairNumber(pairs: (number | null)[], left: number): number {
  if (left < 0 || pairs[left] === null || pairs[left] === undefined) return 0;
  return pairs.slice(0, left + 1).filter((p) => p !== null).length;
}

export const pairedCount = (pairs: (number | null)[]) => pairs.filter((p) => p !== null).length;

export function isMatchComplete(step: MatchStep, answer: string | undefined): boolean {
  return pairedCount(decodeMatch(answer, step.left.length)) === step.left.length;
}

export function isMatchCorrect(step: MatchStep, answer: string | undefined): boolean {
  const pairs = decodeMatch(answer, step.left.length);
  return step.pairs.every((right, left) => pairs[left] === right);
}
