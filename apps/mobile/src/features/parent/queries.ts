import { useCallback } from 'react';
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Announcement,
  ChatThreadView,
  DemoPersona,
  NotificationPrefs,
  ParentHome,
} from '@mytutor/types';
import { useDemoPersona } from '@/lib/demoPersona';
import * as api from './api';
import { useParentLocalStore } from './localStore';
import {
  parentSelf,
  toAssignmentItem,
  toChildViews,
  toConversations,
  toNotifications,
  toThread,
} from './map';
import type { Thread } from './types';

/** Every key starts with the persona, so the two demo worlds never share an answer. */
export const parentKeys = {
  all: ['parent'] as const,
  home: (p: DemoPersona) => ['parent', p, 'home'] as const,
  notificationsRaw: (p: DemoPersona) => ['parent', p, 'notifications-raw'] as const,
  threads: (p: DemoPersona) => ['parent', p, 'threads'] as const,
  notes: (p: DemoPersona) => ['parent', p, 'notes'] as const,
  children: (p: DemoPersona) => ['parent', p, 'children'] as const,
  notifications: (p: DemoPersona) => ['parent', p, 'notifications'] as const,
  conversations: (p: DemoPersona) => ['parent', p, 'conversations'] as const,
  thread: (p: DemoPersona, threadId: string) => ['parent', p, 'thread', threadId] as const,
  report: (p: DemoPersona, childId: string, week: number) =>
    ['parent', p, 'report', childId, week] as const,
  progress: (p: DemoPersona, childId: string) => ['parent', p, 'progress', childId] as const,
  assignments: (p: DemoPersona, childId: string) => ['parent', p, 'assignments', childId] as const,
  prefs: (p: DemoPersona) => ['parent', p, 'prefs'] as const,
  send: (threadId: string) => ['parent', 'send', threadId] as const,
};

/** Resources several views are built from: fetched once and shared through the cache. */
export const baseQueries = {
  home: (p: DemoPersona) => ({ queryKey: parentKeys.home(p), queryFn: () => api.fetchHome(p) }),
  notifications: (p: DemoPersona) => ({
    queryKey: parentKeys.notificationsRaw(p),
    queryFn: () => api.fetchNotifications(p),
  }),
  threads: (p: DemoPersona) => ({
    queryKey: parentKeys.threads(p),
    queryFn: () => api.fetchThreads(p),
  }),
  notes: (p: DemoPersona) => ({ queryKey: parentKeys.notes(p), queryFn: () => api.fetchNotes(p) }),
};

const shared = (client: QueryClient, p: DemoPersona) => ({
  home: () => client.fetchQuery(baseQueries.home(p)),
  notifications: () => client.fetchQuery(baseQueries.notifications(p)),
  threads: () => client.fetchQuery(baseQueries.threads(p)),
  notes: () => client.fetchQuery(baseQueries.notes(p)),
});

export function useParentProfile() {
  const p = useDemoPersona();
  return useQuery({ ...baseQueries.home(p), select: parentSelf });
}

export function useConsentRequests() {
  const p = useDemoPersona();
  return useQuery({ ...baseQueries.home(p), select: (home) => home.consentRequests });
}

/** The children, with "this week's report is new" from the parent's notifications. */
export function useChildren() {
  const p = useDemoPersona();
  const client = useQueryClient();
  return useQuery({
    queryKey: parentKeys.children(p),
    queryFn: async () => {
      const get = shared(client, p);
      const [home, notifications] = await Promise.all([get.home(), get.notifications()]);
      return toChildViews(home, notifications);
    },
  });
}

export function useChildReport(childId: string, week: number) {
  const p = useDemoPersona();
  return useQuery({
    queryKey: parentKeys.report(p, childId, week),
    queryFn: () => api.fetchReport(p, childId, week),
  });
}

export function useChildSubjects(childId: string) {
  const p = useDemoPersona();
  return useQuery({
    queryKey: parentKeys.progress(p, childId),
    queryFn: () => api.fetchProgress(p, childId),
  });
}

export function useChildAssignments(childId: string) {
  const p = useDemoPersona();
  return useQuery({
    queryKey: parentKeys.assignments(p, childId),
    queryFn: async () => {
      const list = await api.fetchAssignments(p, childId);
      return list ? { classLabel: list.classLabel, items: list.items.map(toAssignmentItem) } : null;
    },
  });
}

type ConversationData = { threads: ChatThreadView[]; home: ParentHome; notes: Announcement[] };

/** Threads, children and class notes together, with this device's read marks applied. */
function useConversationQuery<T>(
  pick: (data: ConversationData, seenAt: Record<string, string>) => T,
) {
  const p = useDemoPersona();
  const client = useQueryClient();
  const seenAt = useParentLocalStore((s) => s.seenAt);
  const select = useCallback((data: ConversationData) => pick(data, seenAt), [pick, seenAt]);
  return useQuery({
    queryKey: parentKeys.conversations(p),
    queryFn: async (): Promise<ConversationData> => {
      const get = shared(client, p);
      const [threads, home, notes] = await Promise.all([get.threads(), get.home(), get.notes()]);
      return { threads, home, notes };
    },
    select,
  });
}

const conversationsOf = (d: ConversationData, seenAt: Record<string, string>) =>
  toConversations(d.threads, d.home, d.notes, seenAt);

const unreadOf = (d: ConversationData, seenAt: Record<string, string>) =>
  conversationsOf(d, seenAt).reduce((sum, c) => sum + c.unread, 0);

/** The teachers of the linked children. */
export const useConversations = () => useConversationQuery(conversationsOf);

/** Unread teacher messages, for the "Mesajlar" tab badge. */
export const useUnreadMessageCount = () => useConversationQuery(unreadOf);

/** One conversation; null when it is not the parent's (or the child is no longer linked). */
export function useThread(threadId: string) {
  const p = useDemoPersona();
  const client = useQueryClient();
  const reported = useParentLocalStore((s) => s.reported);
  const select = useCallback(
    (thread: Thread | null) =>
      thread && {
        ...thread,
        messages: thread.messages.map((m) =>
          reported.includes(m.id) ? { ...m, reported: true } : m,
        ),
      },
    [reported],
  );
  return useQuery({
    queryKey: parentKeys.thread(p, threadId),
    queryFn: async () => {
      const get = shared(client, p);
      const [detail, home, notes] = await Promise.all([
        api.fetchThreadDetail(p, threadId),
        get.home(),
        get.notes(),
      ]);
      return detail ? toThread(detail, home, notes) : null;
    },
    select,
  });
}

export function useNotifications() {
  const p = useDemoPersona();
  const client = useQueryClient();
  return useQuery({
    queryKey: parentKeys.notifications(p),
    queryFn: async () => {
      const get = shared(client, p);
      const [list, home, threads] = await Promise.all([
        get.notifications(),
        get.home(),
        get.threads(),
      ]);
      return toNotifications(list, home, threads);
    },
  });
}

/** The server's notification switches with this device's changes over them. */
export function useNotificationPrefs() {
  const p = useDemoPersona();
  const local = useParentLocalStore((s) => s.prefs);
  const select = useCallback((prefs: NotificationPrefs) => ({ ...prefs, ...local }), [local]);
  return useQuery({ queryKey: parentKeys.prefs(p), queryFn: () => api.fetchPrefs(p), select });
}
