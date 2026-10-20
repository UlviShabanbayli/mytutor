import type {
  AppNotification,
  ChatMessage,
  ChatMessageView,
  ChatThread,
  ChatThreadDetail,
  ChatThreadView,
  DemoWorld,
  Role,
} from '@mytutor/types';
import { personOf, unreadIn, viewerOf } from './common';

/** GET /v1/messages[/:id] and /v1/notifications, for the reader of `role`. */

/** Whether a reader takes part: a class chat's members are its roster and teacher. */
const canRead = (t: ChatThread, readerId: string) => t.memberIds.includes(readerId);

function messageView(world: DemoWorld, m: ChatMessage, readerId: string): ChatMessageView {
  const author = m.authorId ? personOf(world, m.authorId) : null;
  const thread = world.threads.find((t) => t.id === m.threadId);
  const others = (thread?.memberIds ?? []).filter((id) => id !== m.authorId);
  const readByAll = others.length > 0 && others.every((id) => (thread?.readAt[id] ?? '') >= m.at);
  return {
    ...m,
    author:
      author && m.authorId
        ? {
            id: author.id,
            // Classmates see each other's short names ("Aysel Q."); teachers their full name.
            name: author.roles.includes('student') ? author.shortName : author.fullName,
            initials: author.initials,
            role: author.roles[0] ?? 'student',
          }
        : null,
    mine: m.authorId === readerId,
    status: readByAll ? 'read' : 'sent',
  };
}

function title(world: DemoWorld, t: ChatThread, readerId: string): string {
  if (t.kind === 'class') return world.classes.find((c) => c.id === t.classId)?.name ?? t.id;
  const other = t.memberIds.find((id) => id !== readerId);
  return (other && personOf(world, other)?.fullName) ?? t.id;
}

function threadView(world: DemoWorld, t: ChatThread, readerId: string): ChatThreadView {
  const list = world.messages.filter((m) => m.threadId === t.id);
  const last = list[list.length - 1];
  return {
    id: t.id,
    kind: t.kind,
    title: title(world, t, readerId),
    classId: t.classId,
    childId: t.childId,
    childName: t.childId ? (personOf(world, t.childId)?.fullName ?? null) : null,
    unread: unreadIn(world, t.id, readerId),
    last: last ? messageView(world, last, readerId) : null,
  };
}

export function selectThreads(world: DemoWorld, role: Role): ChatThreadView[] {
  const reader = viewerOf(world, role);
  return world.threads
    .filter((t) => canRead(t, reader))
    .map((t) => threadView(world, t, reader))
    .sort((a, b) => (b.last?.at ?? '').localeCompare(a.last?.at ?? ''));
}

export function selectThread(world: DemoWorld, id: string, role: Role): ChatThreadDetail | null {
  const reader = viewerOf(world, role);
  const thread = world.threads.find((t) => t.id === id);
  if (!thread || !canRead(thread, reader)) return null;
  return {
    ...threadView(world, thread, reader),
    messages: world.messages
      .filter((m) => m.threadId === id)
      .map((m) => messageView(world, m, reader)),
  };
}

/** The reader's notifications, newest first. */
export function selectNotifications(world: DemoWorld, role: Role): AppNotification[] {
  const reader = viewerOf(world, role);
  return world.notifications
    .filter((n) => n.recipientId === reader && n.role === role)
    .sort((a, b) => b.at.localeCompare(a.at));
}
