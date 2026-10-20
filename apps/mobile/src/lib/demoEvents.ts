import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MAX_DEMO_EVENTS } from '@mytutor/schemas';
import type { DemoEvent, DemoEventInput, DemoPersona } from '@mytutor/types';
import { useDemoPersona, useDemoPersonaStore } from './demoPersona';
import { queryClient } from './query-client';

/**
 * The demo's writes. A grade, a message, a question or a link is an event appended to a log kept
 * on the device, one log per persona. Every query is answered with the log applied (by the API's
 * `POST /v1/query`, or by the offline fallback), so every role on this device sees the change.
 */

type DemoEventsState = {
  events: Record<DemoPersona, DemoEvent[]>;
  append: (persona: DemoPersona, event: DemoEvent) => void;
  clear: (persona: DemoPersona) => void;
};

export const useDemoEventsStore = create<DemoEventsState>()(
  persist(
    (set) => ({
      events: { nermin: [], fresh: [] },
      // The oldest events go first once the log is full, so a query never carries too many.
      append: (persona, event) =>
        set((s) => ({
          events: { ...s.events, [persona]: [...s.events[persona], event].slice(-MAX_DEMO_EVENTS) },
        })),
      clear: (persona) => set((s) => ({ events: { ...s.events, [persona]: [] } })),
    }),
    { name: 'ari-demo-events', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** The persona's events, oldest first. */
export const demoEventsOf = (persona: DemoPersona): DemoEvent[] =>
  useDemoEventsStore.getState().events[persona] ?? [];

let sequence = 0;

/** A unique id for an event written on this device. */
function eventId(): string {
  sequence += 1;
  return `ev-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

/** Stamps an event with its id and time. */
export function stampDemoEvent(input: DemoEventInput, now: Date = new Date()): DemoEvent {
  return { ...input, id: eventId(), at: now.toISOString() } as DemoEvent;
}

/**
 * `const write = useDemoWrite(); write({ type: 'assignment.graded', … })`: adds `id` and `at`,
 * appends the event to the current persona's log and refetches every query.
 */
export function useDemoWrite(): (event: DemoEventInput) => void {
  const persona = useDemoPersona();
  return useCallback(
    (input: DemoEventInput) => {
      useDemoEventsStore.getState().append(persona, stampDemoEvent(input));
      void queryClient.invalidateQueries();
    },
    [persona],
  );
}

/** Puts a device store's demo state back to the first day, for one persona. */
export type DemoReset = (persona: DemoPersona) => void;

const resets = new Set<DemoReset>();

/**
 * Device stores that keep demo state the events do not hold (the textbook choice, the first
 * step, test results, exam targets, local switches) register how to forget it, so "Demo
 * məlumatını sıfırla" brings the first-day screens back. Returns a function that unregisters.
 */
export function registerDemoReset(reset: DemoReset): () => void {
  resets.add(reset);
  return () => {
    resets.delete(reset);
  };
}

/**
 * "Demo məlumatını sıfırla": forgets the current persona's events and every registered device
 * store's demo state, then refetches.
 */
export function resetDemo(): void {
  const persona = useDemoPersonaStore.getState().persona;
  useDemoEventsStore.getState().clear(persona);
  for (const reset of resets) reset(persona);
  void queryClient.invalidateQueries();
}
