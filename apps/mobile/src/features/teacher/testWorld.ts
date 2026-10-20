import { answerDemo } from '@mytutor/demo-data';
import type { DemoEvent, DemoEventInput, DemoPersona } from '@mytutor/types';

/** The demo world's answers for the teacher tests, at a pinned "now" (09:00 in Baku). */

export const NOW = new Date('2026-10-20T05:00:00.000Z');

let seq = 0;

/** An event as the device would log it, a minute after `NOW` per event. */
export function ev(input: DemoEventInput): DemoEvent {
  seq += 1;
  return {
    ...input,
    id: `ev-test-${seq}`,
    at: new Date(NOW.getTime() + seq * 60_000).toISOString(),
  } as DemoEvent;
}

/** GET `path` with the events applied, parsed with the route's schema. */
export function answer<T>(
  path: string,
  parse: (value: unknown) => T,
  events: DemoEvent[] = [],
  persona: DemoPersona = 'nermin',
): T {
  const res = answerDemo(path, { persona, now: NOW, events });
  if (res.status !== 200) throw new Error(`${res.status} ${path}`);
  return parse(res.body);
}
