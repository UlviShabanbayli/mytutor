import type { DemoEvent, DemoEventInput, DemoPersona } from '@mytutor/types';
import { answerDemo } from '../selectors/answer';

/** Test helpers: events a few minutes before a fixed now, and the routes the roles read. */

export const NOW = new Date('2026-10-20T06:00:00.000Z');
let n = 0;
/** An event a few minutes before now, in the order written. */
export const ev = (input: DemoEventInput): DemoEvent => {
  n += 1;
  return {
    ...input,
    id: `ev-${n}`,
    at: new Date(NOW.getTime() - (60 - n) * 60_000).toISOString(),
  } as DemoEvent;
};

export type Body = Record<string, unknown>;
export const get = (path: string, events: DemoEvent[], persona: DemoPersona = 'nermin') => {
  const answer = answerDemo(path, { persona, now: NOW, events });
  return answer.body as Body;
};
export const list = (path: string, events: DemoEvent[], persona: DemoPersona = 'nermin') =>
  get(path, events, persona) as unknown as Body[];

export const grade = ev({
  type: 'assignment.graded',
  assignmentId: 'hw-4-1',
  studentId: 'nermin',
  score: 9,
  outOf: 10,
  comment: 'Əla!',
});
