import { addDays } from './time';

export type ReviewDot = { days: number; date: Date; state: 'done' | 'next' | 'later' };

/**
 * When a mastered topic is reviewed: each interval counts from the review before it
 * (2 → 7 → 21 days); the first `done` reviews are passed, the one after them is next.
 */
export function reviewTimeline(masteredAt: Date, intervals: number[], done: number): ReviewDot[] {
  let date = masteredAt;
  return intervals.map((days, i) => {
    date = addDays(date, days);
    return { days, date, state: i < done ? 'done' : i === done ? 'next' : 'later' };
  });
}
