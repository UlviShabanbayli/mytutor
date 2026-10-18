import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './demo';
import type { ChatMessage, NotificationKind, Thread } from './types';

export const parentKeys = {
  all: ['parent'] as const,
  profile: ['parent', 'profile'] as const,
  children: ['parent', 'children'] as const,
  request: ['parent', 'request'] as const,
  consent: ['parent', 'consent'] as const,
  report: (childId: string, week: number) => ['parent', 'report', childId, week] as const,
  subjects: (childId: string) => ['parent', 'subjects', childId] as const,
  assignments: (childId: string) => ['parent', 'assignments', childId] as const,
  conversations: ['parent', 'conversations'] as const,
  thread: (teacherId: string) => ['parent', 'thread', teacherId] as const,
  send: (teacherId: string) => ['parent', 'send', teacherId] as const,
  notifications: ['parent', 'notifications'] as const,
  prefs: ['parent', 'prefs'] as const,
};

/** Every parent screen reads from the same demo server, so a change refreshes them all. */
function useInvalidateParent() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: parentKeys.all });
}

export const useParentProfile = () =>
  useQuery({ queryKey: parentKeys.profile, queryFn: api.fetchProfile });

export const useChildren = () =>
  useQuery({ queryKey: parentKeys.children, queryFn: api.fetchChildren });

export const useLinkRequest = () =>
  useQuery({ queryKey: parentKeys.request, queryFn: api.fetchLinkRequest });

export const useConsentRequests = () =>
  useQuery({ queryKey: parentKeys.consent, queryFn: api.fetchConsentRequests });

export const useChildReport = (childId: string, week: number) =>
  useQuery({
    queryKey: parentKeys.report(childId, week),
    queryFn: () => api.fetchReport(childId, week),
  });

export const useChildSubjects = (childId: string) =>
  useQuery({ queryKey: parentKeys.subjects(childId), queryFn: () => api.fetchSubjects(childId) });

export const useChildAssignments = (childId: string) =>
  useQuery({
    queryKey: parentKeys.assignments(childId),
    queryFn: () => api.fetchAssignments(childId),
  });

export const useConversations = () =>
  useQuery({ queryKey: parentKeys.conversations, queryFn: api.fetchConversations });

/** Unread messages and class notes, for the "Mesajlar" tab badge. */
export const useUnreadMessageCount = () =>
  useQuery({
    queryKey: parentKeys.conversations,
    queryFn: api.fetchConversations,
    select: (list) => list.reduce((sum, c) => sum + c.unread, 0),
  });

export const useThread = (teacherId: string) =>
  useQuery({ queryKey: parentKeys.thread(teacherId), queryFn: () => api.fetchThread(teacherId) });

export const useNotifications = () =>
  useQuery({ queryKey: parentKeys.notifications, queryFn: api.fetchNotifications });

export const useNotificationPrefs = () =>
  useQuery({ queryKey: parentKeys.prefs, queryFn: api.fetchNotificationPrefs });

export function useSubmitLinkCode() {
  const invalidate = useInvalidateParent();
  return useMutation({ mutationFn: api.submitLinkCode, onSuccess: invalidate });
}

export function useCancelLinkRequest() {
  const invalidate = useInvalidateParent();
  return useMutation({ mutationFn: api.cancelLinkRequest, onSuccess: invalidate });
}

export function useStopLink() {
  const invalidate = useInvalidateParent();
  return useMutation({ mutationFn: api.stopLink, onSuccess: invalidate });
}

export function useSubmitConsent() {
  const invalidate = useInvalidateParent();
  return useMutation({
    mutationFn: ({ childId, code }: { childId: string; code: string }) =>
      api.submitConsent(childId, code),
    onSuccess: invalidate,
  });
}

export function useDeclineConsent() {
  const invalidate = useInvalidateParent();
  return useMutation({ mutationFn: api.declineConsent, onSuccess: invalidate });
}

export function useMarkReportSeen() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.markReportSeen,
    onSuccess: () => client.invalidateQueries({ queryKey: parentKeys.children }),
  });
}

export function useMarkThreadRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.markThreadRead,
    onSuccess: () => client.invalidateQueries({ queryKey: parentKeys.conversations }),
  });
}

export function useMarkNotificationsRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.markNotificationsRead,
    onSuccess: () => client.invalidateQueries({ queryKey: parentKeys.notifications }),
  });
}

export function useSetNotificationPref() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, on }: { kind: NotificationKind; on: boolean }) =>
      api.setNotificationPref(kind, on),
    onSuccess: () => client.invalidateQueries({ queryKey: parentKeys.prefs }),
  });
}

export function useReportMessage(teacherId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => api.reportMessage(teacherId, messageId),
    onSuccess: () => client.invalidateQueries({ queryKey: parentKeys.thread(teacherId) }),
  });
}

/**
 * Sends a message to the teacher. Offline, TanStack Query pauses the mutation and runs it once
 * the device is back online ("Mesajın qoşulanda özü göndəriləcək").
 */
export function useSendMessage(teacherId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationKey: parentKeys.send(teacherId),
    mutationFn: (text: string) => api.sendMessage(teacherId, text),
    onSuccess: (message: ChatMessage) => {
      client.setQueryData<Thread | null>(parentKeys.thread(teacherId), (thread) =>
        thread ? { ...thread, messages: [...thread.messages, message] } : thread,
      );
      void client.invalidateQueries({ queryKey: parentKeys.conversations });
    },
  });
}

export type OutgoingMessage = { key: number; text: string; queued: boolean };

/** Messages still on their way: shown in the thread with "Göndərilir…". */
export function useOutgoingMessages(teacherId: string): OutgoingMessage[] {
  return useMutationState({
    filters: { mutationKey: parentKeys.send(teacherId), status: 'pending' },
    select: (mutation) => ({
      key: mutation.state.submittedAt,
      text: typeof mutation.state.variables === 'string' ? mutation.state.variables : '',
      queued: mutation.state.isPaused,
    }),
  });
}
