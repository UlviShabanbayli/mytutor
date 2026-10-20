import { useEffect, useSyncExternalStore } from 'react';
import { onlineManager, useQuery } from '@tanstack/react-query';
import {
  chatThreadDetailSchema,
  chatThreadViewSchema,
  classFeedSchema,
  classPreviewSchema,
  classSummarySchema,
  leagueTableSchema,
  linkCodeSchema,
  liveLessonSchema,
  meResponseSchema,
  studentAssignmentSchema,
} from '@mytutor/schemas';
import type {
  ClassFeed as WorldFeed,
  ClassPreview,
  ClassSummary as WorldSummary,
  DemoPersona,
  LeagueScope,
  MeResponse,
  StudentAssignment,
} from '@mytutor/types';
import { ApiError, apiGet } from '@/lib/api';
import { useDemoWrite } from '@/lib/demoEvents';
import { useDemoPersona } from '@/lib/demoPersona';
import { CLASS_CODE_LENGTH, formatClassCode } from './codes';
import {
  toAssignmentDetail,
  toChatMessages,
  toClassFeed,
  toClassSummary,
  toJoinPreview,
  toLiveSession,
  toOverview,
  toParents,
  toReward,
  toTextbook,
} from './fromWorld';
import { useMeStore } from './store';

// TanStack Query hooks of the "Mən" area: the demo world through `apiGet` (/v1/me, /v1/league,
// /v1/classes, /v1/assignments, /v1/messages). What the student does that others see (joining a
// class, a chat message, answering a parent) is a demo event.

export const meKeys = {
  me: (persona: DemoPersona) => ['me', persona] as const,
  parentCode: (persona: DemoPersona) => ['me', persona, 'parent-code'] as const,
  league: (persona: DemoPersona, scope: LeagueScope) => ['me', persona, 'league', scope] as const,
  classes: (persona: DemoPersona) => ['classes', persona] as const,
  class: (persona: DemoPersona, id: string) => ['classes', persona, id] as const,
  live: (persona: DemoPersona, id: string) => ['classes', persona, 'live', id] as const,
  join: (persona: DemoPersona, code: string) => ['classes', persona, 'join', code] as const,
  assignment: (persona: DemoPersona, id: string) => ['assignments', persona, id] as const,
  threads: (persona: DemoPersona) => ['messages', persona] as const,
  thread: (persona: DemoPersona, id: string) => ['messages', persona, id] as const,
};

function nullOn404(error: unknown): null {
  if (error instanceof ApiError && error.status === 404) return null;
  throw error;
}

const getMe = (persona: DemoPersona) =>
  apiGet('/v1/me', { persona, parse: meResponseSchema.parse });
const getClasses = (persona: DemoPersona) =>
  apiGet('/v1/classes', { persona, parse: classSummarySchema.array().parse });

function useMeQuery<T>(select: (me: MeResponse) => T) {
  const persona = useDemoPersona();
  return useQuery({ queryKey: meKeys.me(persona), queryFn: () => getMe(persona), select });
}

const same = (me: MeResponse) => me;

/** The student's profile, progress, parents and plan (GET /v1/me). */
export function useMe() {
  return useMeQuery(same);
}

export function useMeOverview() {
  return useMeQuery(toOverview);
}

/** The nickname leagues show: the one typed on this device, else the world's. */
export function useNickname(): string {
  const typed = useMeStore((s) => s.nickname);
  const own = useMe().data?.profile.nickname;
  return typed ?? own ?? '';
}

const guestOf = (me: MeResponse) => ({
  points: me.profile.points.total,
  honeyCells: me.honeyCells,
});

export function useGuestOverview() {
  return useMeQuery(guestOf);
}

/** The next rank's moment (Mən → reward). */
export function useReward() {
  return useMeQuery(toReward);
}

const textbooksOf = (me: MeResponse) => me.textbooks.map(toTextbook);

export function useTextbookProgress() {
  return useMeQuery(textbooksOf);
}

const comparisonOf = (me: MeResponse) => me.classComparison;

/** Anonymous share of classmates the student practised more than this week; null without one. */
export function useClassComparison() {
  return useMeQuery(comparisonOf);
}

const planFeaturesOf = (me: MeResponse) => me.planFeatures;

export function usePlanFeatures() {
  return useMeQuery(planFeaturesOf);
}

/** Linked parents and the parents waiting for the student's answer. */
export function useParents() {
  return useMeQuery(toParents);
}

export function useLeague(scope: LeagueScope) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.league(persona, scope),
    queryFn: () => apiGet(`/v1/league?scope=${scope}`, { persona, parse: leagueTableSchema.parse }),
  });
}

const summariesOf = (list: WorldSummary[]) => list.map((c) => toClassSummary(c, new Date()));

export function useClasses() {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.classes(persona),
    queryFn: () => getClasses(persona),
    select: summariesOf,
  });
}

const feedOf = (feed: WorldFeed | null) =>
  feed
    ? { summary: toClassSummary(feed.class, new Date()), feed: toClassFeed(feed, new Date()) }
    : null;

/** A class the student is in, with its feed; null when the student is not (or no longer) in it. */
export function useClass(id: string) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.class(persona, id),
    queryFn: () =>
      apiGet(`/v1/classes/${encodeURIComponent(id)}`, {
        persona,
        parse: classFeedSchema.parse,
      }).catch(nullOn404),
    select: feedOf,
  });
}

const assignmentOf = (a: StudentAssignment | null) =>
  a ? toAssignmentDetail(a, new Date()) : null;

export function useAssignment(id: string) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.assignment(persona, id),
    queryFn: () =>
      apiGet(`/v1/assignments/${encodeURIComponent(id)}`, {
        persona,
        parse: studentAssignmentSchema.parse,
      }).catch(nullOn404),
    select: assignmentOf,
  });
}

/** The class chat: its thread among the student's threads, then its messages. */
export function useClassMessages(classId: string) {
  const persona = useDemoPersona();
  const threads = useQuery({
    queryKey: meKeys.threads(persona),
    queryFn: () => apiGet('/v1/messages', { persona, parse: chatThreadViewSchema.array().parse }),
  });
  const found = threads.data?.find((t) => t.kind === 'class' && t.classId === classId);
  const threadId = found?.id;
  const thread = useQuery({
    queryKey: meKeys.thread(persona, threadId ?? ''),
    enabled: threadId !== undefined,
    queryFn: () =>
      apiGet(`/v1/messages/${encodeURIComponent(threadId ?? '')}`, {
        persona,
        parse: chatThreadDetailSchema.parse,
      }),
    select: toChatMessages,
  });
  return {
    threadId: threadId ?? null,
    /** Messages the student has not read yet (opening the chat reads them). */
    unread: found?.unread ?? 0,
    messages: thread.data ?? [],
    isPending: threads.isPending || (threadId !== undefined && thread.isPending),
    isError: threads.isError || thread.isError,
    refetch: () => Promise.all([threads.refetch(), thread.refetch()]),
  };
}

/**
 * Sends a chat message as the demo event `message.sent` (with the message it answers); the
 * teacher's chat shows it too.
 */
export function useSendMessage(): (threadId: string, text: string, replyToId?: string) => void {
  const write = useDemoWrite();
  const me = useMe().data?.person.id;
  return (threadId, text, replyToId) => {
    if (me && text.trim())
      write({ type: 'message.sent', threadId, fromPersonId: me, text, replyToId });
  };
}

/** Opening a chat with news reads it (`thread.read`): the teacher sees "Oxundu". */
export function useReadThread(threadId: string | null, unread: number): void {
  const write = useDemoWrite();
  const me = useMe().data?.person.id;
  useEffect(() => {
    if (threadId && me && unread > 0) write({ type: 'thread.read', threadId, readerId: me });
  }, [threadId, me, unread, write]);
}

/** A live lesson of one of the student's classes; null when none has this id. */
export function useLiveSession(id: string) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.live(persona, id),
    queryFn: async () => {
      const [me, classes] = await Promise.all([getMe(persona), getClasses(persona)]);
      for (const cls of classes) {
        const live = await apiGet(`/v1/classes/${encodeURIComponent(cls.id)}/live`, {
          persona,
          parse: liveLessonSchema.parse,
        }).catch(nullOn404);
        if (live?.id === id) return toLiveSession(live, cls, me.person.id);
      }
      return null;
    },
  });
}

const previewOf = (p: ClassPreview | null) =>
  p ? { found: toJoinPreview(p), member: p.member } : null;

/** The class an invite code opens; asked only once all nine characters are typed. */
export function useJoinLookup(code: string) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.join(persona, code),
    enabled: code.length === CLASS_CODE_LENGTH,
    queryFn: () =>
      apiGet(`/v1/classes/join/${encodeURIComponent(formatClassCode(code))}`, {
        persona,
        parse: classPreviewSchema.parse,
      }).catch(nullOn404),
    select: previewOf,
  });
}

/** Joining and leaving a class are the demo events `class.joined` and `class.left`. */
export function useClassMembership() {
  const write = useDemoWrite();
  const me = useMe().data?.person.id;
  return {
    join: (classId: string) => {
      if (me) write({ type: 'class.joined', classId, studentId: me });
    },
    leave: (classId: string) => {
      if (me) write({ type: 'class.left', classId, studentId: me });
    },
  };
}

/** The code the world has for the student to give a parent; null when it has none. */
export function useParentCodeSource() {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: meKeys.parentCode(persona),
    queryFn: () =>
      apiGet('/v1/me/parent-code', { persona, parse: linkCodeSchema.parse }).catch(nullOn404),
    select: (code) => (code?.kind === 'parent' ? code.code : null),
  });
}

/**
 * Answering a parent: approving the request links them (`child.linked`); declining it or
 * stopping a link unlinks them (`child.unlinked`). The parent's app follows on this device.
 */
export function useParentLinkActions() {
  const write = useDemoWrite();
  const me = useMe().data?.person.id;
  return {
    approve: (parentId: string) => {
      if (me) write({ type: 'child.linked', parentId, childId: me });
    },
    unlink: (parentId: string) => {
      if (me) write({ type: 'child.unlinked', parentId, childId: me });
    },
  };
}

/** Whether the device is online, as TanStack Query sees it (browser events on the web). */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
