import { useCallback } from 'react';
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { DEMO_SMS_CODE } from '@mytutor/demo-data';
import type { AppNotification } from '@mytutor/types';
import { useDemoPersona } from '@/lib/demoPersona';
import { useDemoWrite } from '@/lib/demoEvents';
import { lookupCode } from './api';
import { ConsentCodeError, LinkCodeError } from './errors';
import { useParentLocalStore } from './localStore';
import { baseQueries, parentKeys } from './queries';
import type { NotificationKind } from './types';

/**
 * The parent's writes. Anything another role sees (a link, a consent, a message, a read
 * notification) is a demo event; `useDemoWrite` appends it and refetches every query, so
 * Nərmin's and Lalə's screens on this device show it too.
 */
function useParentWrites() {
  const p = useDemoPersona();
  const client = useQueryClient();
  const write = useDemoWrite();
  const parentId = async () => (await client.ensureQueryData(baseQueries.home(p))).person.id;
  /** Waits for the refetch the write started, so the screen moves on with the new state. */
  const settled = (queryKey: readonly unknown[]) =>
    client.refetchQueries({ queryKey }, { cancelRefetch: false });
  return { p, client, write, parentId, settled };
}

/** Links the child whose code this is (`child.linked`); a refused code says why. */
export function useLinkChild() {
  const { p, write, parentId, settled } = useParentWrites();
  return useMutation({
    mutationFn: async (code: string) => {
      const found = await lookupCode(p, code);
      if (!found) throw new LinkCodeError('not_found');
      if (found.expired) throw new LinkCodeError('expired');
      if (found.alreadyLinked) throw new LinkCodeError('already_linked', found.childName);
      write({ type: 'child.linked', parentId: await parentId(), childId: found.childId });
      await settled(parentKeys.children(p));
      return found;
    },
  });
}

/** The parent stops following a child; the child's learning goes on unchanged. */
export function useStopLink() {
  const { p, write, parentId, settled } = useParentWrites();
  return useMutation({
    mutationFn: async (childId: string) => {
      write({ type: 'child.unlinked', parentId: await parentId(), childId });
      await settled(parentKeys.children(p));
    },
  });
}

/** Opens the account of a child under 13 with the SMS code the parent received. */
export function useSubmitConsent() {
  const { p, write, parentId, settled } = useParentWrites();
  return useMutation({
    mutationFn: async ({ childId, code }: { childId: string; code: string }) => {
      if (code !== DEMO_SMS_CODE) throw new ConsentCodeError();
      write({ type: 'consent.decided', parentId: await parentId(), childId, approved: true });
      await settled(parentKeys.children(p));
    },
  });
}

export function useDeclineConsent() {
  const { p, write, parentId, settled } = useParentWrites();
  return useMutation({
    mutationFn: async (childId: string) => {
      write({ type: 'consent.decided', parentId: await parentId(), childId, approved: false });
      await settled(parentKeys.children(p));
    },
  });
}

/** Marks the unread notifications `pick` chooses as read (`notification.read`). */
function useReadNotifications() {
  const { p, client, write } = useParentWrites();
  return useCallback(
    async (pick: (n: AppNotification) => boolean) => {
      const list = await client.ensureQueryData(baseQueries.notifications(p));
      for (const n of list) {
        if (!n.read && pick(n)) write({ type: 'notification.read', notificationId: n.id });
      }
    },
    [client, p, write],
  );
}

/** Opening this week's report reads its notification, so the card's "Yeni" goes away. */
export function useMarkReportSeen() {
  const read = useReadNotifications();
  return useMutation({
    mutationFn: (childId: string) =>
      read((n) => n.kind === 'weeklyReport' && n.childId === childId),
  });
}

export function useMarkNotificationsRead() {
  const read = useReadNotifications();
  return useMutation({ mutationFn: () => read(() => true) });
}

/**
 * Opening a conversation: read on this device, its message notifications read, and the demo
 * event `thread.read`, so the teacher sees "Oxundu".
 */
export function useMarkThreadRead() {
  const read = useReadNotifications();
  const markSeen = useParentLocalStore((s) => s.markSeen);
  const p = useDemoPersona();
  const client = useQueryClient();
  const write = useDemoWrite();
  return useCallback(
    (threadId: string) => {
      markSeen(threadId, new Date().toISOString());
      void read((n) => n.kind === 'teacherMessage' && n.threadId === threadId);
      void client
        .ensureQueryData(baseQueries.home(p))
        .then((home) => write({ type: 'thread.read', threadId, readerId: home.person.id }));
    },
    [markSeen, read, client, p, write],
  );
}

/**
 * Sends a message to the teacher (`message.sent`). Offline, TanStack Query pauses the mutation
 * and runs it once the device is back ("Mesajın qoşulanda özü göndəriləcək"); until the thread
 * shows the message, it stays in the list as "Göndərilir…".
 */
export function useSendMessage(threadId: string) {
  const { p, write, parentId, settled } = useParentWrites();
  return useMutation({
    mutationKey: parentKeys.send(threadId),
    mutationFn: async (text: string) => {
      write({ type: 'message.sent', threadId, fromPersonId: await parentId(), text });
      await settled(parentKeys.thread(p, threadId));
    },
  });
}

export type OutgoingMessage = { key: number; text: string; queued: boolean };

/** Messages still on their way: shown in the thread with "Göndərilir…". */
export function useOutgoingMessages(threadId: string): OutgoingMessage[] {
  return useMutationState({
    filters: { mutationKey: parentKeys.send(threadId), status: 'pending' },
    select: (mutation) => ({
      key: mutation.state.submittedAt,
      text: typeof mutation.state.variables === 'string' ? mutation.state.variables : '',
      queued: mutation.state.isPaused,
    }),
  });
}

/** Sends a message to moderation (architecture P6); messages are never deleted. */
export const useReportMessage = () => useParentLocalStore((s) => s.report);

export function useSetNotificationPref(): (kind: NotificationKind, on: boolean) => void {
  return useParentLocalStore((s) => s.setPref);
}
