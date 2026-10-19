import { useSyncExternalStore } from 'react';
import { onlineManager, useQuery } from '@tanstack/react-query';
import {
  demoAssignments,
  demoClassComparison,
  demoClasses,
  demoFeeds,
  demoGuest,
  demoJoinCodes,
  demoLeague,
  demoLive,
  demoMessages,
  demoOverview,
  demoParentRequest,
  demoPlanFeatures,
  demoTextbooks,
} from './demo';
import { CODE_LENGTH } from './codes';
import { useMeStore } from './store';

// TanStack Query hooks of the "Mən" area. Each one serves demo data now; only its query
// function changes when the matching API lands (/v1/me/*, /v1/classes/*, /v1/parent/links).

export const meKeys = {
  overview: ['me', 'overview'] as const,
  guest: ['me', 'guest'] as const,
  textbooks: ['me', 'textbooks'] as const,
  comparison: ['me', 'comparison'] as const,
  league: (scope: 'country' | 'class') => ['me', 'league', scope] as const,
  classes: (ids: string[]) => ['me', 'classes', ...ids] as const,
  class: (id: string) => ['me', 'class', id] as const,
  assignment: (id: string) => ['me', 'assignment', id] as const,
  messages: (classId: string) => ['me', 'messages', classId] as const,
  live: (id: string) => ['me', 'live', id] as const,
  join: (code: string) => ['me', 'join', code] as const,
  parentRequest: (code: string) => ['me', 'parent-request', code] as const,
  plans: ['me', 'plans'] as const,
};

export function useMeOverview() {
  return useQuery({ queryKey: meKeys.overview, queryFn: async () => demoOverview });
}

export function useGuestOverview() {
  return useQuery({ queryKey: meKeys.guest, queryFn: async () => demoGuest });
}

export function useTextbookProgress() {
  return useQuery({ queryKey: meKeys.textbooks, queryFn: async () => demoTextbooks });
}

/** Anonymous share of classmates the student practised more than this week. */
export function useClassComparison() {
  return useQuery({ queryKey: meKeys.comparison, queryFn: async () => demoClassComparison });
}

export function useLeague(scope: 'country' | 'class') {
  return useQuery({ queryKey: meKeys.league(scope), queryFn: async () => demoLeague[scope] });
}

export function useClasses() {
  const ids = useMeStore((s) => s.classIds);
  return useQuery({
    queryKey: meKeys.classes(ids),
    queryFn: async () => demoClasses.filter((c) => ids.includes(c.id)),
  });
}

/** A class the student is in, with its feed; null when the student is not (or no longer) in it. */
export function useClass(id: string) {
  const member = useMeStore((s) => s.classIds.includes(id));
  return useQuery({
    queryKey: [...meKeys.class(id), member],
    queryFn: async () => {
      const summary = demoClasses.find((c) => c.id === id);
      const feed = demoFeeds[id];
      return member && summary && feed ? { summary, feed } : null;
    },
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: meKeys.assignment(id),
    queryFn: async () => demoAssignments[id] ?? null,
  });
}

/** Class chat history plus what the student sent; nothing is ever removed from it. */
export function useClassMessages(classId: string) {
  const sent = useMeStore((s) => s.sent[classId]);
  const query = useQuery({
    queryKey: meKeys.messages(classId),
    queryFn: async () => demoMessages[classId] ?? [],
  });
  return { ...query, messages: [...(query.data ?? []), ...(sent ?? [])] };
}

export function useLiveSession(id: string) {
  return useQuery({ queryKey: meKeys.live(id), queryFn: async () => demoLive[id] ?? null });
}

/** The class an invite code opens; asked only once all six characters are typed. */
export function useJoinLookup(code: string) {
  return useQuery({
    queryKey: meKeys.join(code),
    enabled: code.length === CODE_LENGTH,
    queryFn: async () => {
      const id = demoJoinCodes[code];
      return demoClasses.find((c) => c.id === id) ?? null;
    },
  });
}

/** A parent who typed the student's active code and waits for approval (demo: one father). */
export function useParentRequest() {
  const code = useMeStore((s) => s.parentCode?.value ?? '');
  const handled = useMeStore((s) => s.handledRequests);
  const query = useQuery({
    queryKey: meKeys.parentRequest(code),
    enabled: code !== '',
    queryFn: async () => demoParentRequest,
  });
  const request = query.data && !handled.includes(query.data.id) ? query.data : null;
  return { ...query, request: code === '' ? null : request };
}

export function usePlanFeatures() {
  return useQuery({ queryKey: meKeys.plans, queryFn: async () => demoPlanFeatures });
}

/** Whether the device is online, as TanStack Query sees it (browser events on the web). */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
