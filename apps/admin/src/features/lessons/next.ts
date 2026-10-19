import type { LessonEntry } from '@mytutor/types';

/** Where a lesson sits: a textbook topic of a curriculum. */
export type LessonPlace = { bookId: string; number: string };

const key = ({ bookId, number }: LessonPlace) => `${bookId}/${number}`;

/**
 * The lesson to review after `current`: the next one in the curriculum's order (`order`, its
 * textbooks' topics) whose text draft waits for approval, going round to the start; null when
 * no other draft waits.
 */
export function nextDraft(
  order: LessonPlace[],
  lessons: LessonEntry[],
  current: LessonPlace,
): LessonPlace | null {
  const waiting = new Set(lessons.filter((l) => l.draft).map(key));
  const at = order.findIndex((p) => key(p) === key(current));
  const after = [...order.slice(at + 1), ...order.slice(0, Math.max(at, 0))];
  return after.find((p) => key(p) !== key(current) && waiting.has(key(p))) ?? null;
}

/** How many lessons of the curriculum have a draft waiting, but for `except`. */
export const draftsWaiting = (lessons: LessonEntry[], except?: LessonPlace) =>
  lessons.filter((l) => l.draft && (!except || key(l) !== key(except))).length;
