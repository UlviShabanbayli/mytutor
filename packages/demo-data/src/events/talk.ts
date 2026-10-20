import type { DemoEvent, DemoWorld } from '@mytutor/types';

/**
 * Event handlers for talk: messages and read marks. A muted student, or a student in a class
 * chat the teacher closed, cannot post; a reply points only at a message of the same thread.
 */

type Of<T extends DemoEvent['type']> = Extract<DemoEvent, { type: T }>;

/** Whether the person may post in the thread now. */
function canPost(w: DemoWorld, threadId: string, personId: string): boolean {
  const thread = w.threads.find((t) => t.id === threadId);
  if (!thread || !thread.memberIds.includes(personId)) return false;
  if (thread.kind !== 'class') return true;
  const cls = w.classes.find((c) => c.id === thread.classId);
  if (!cls || cls.teacherId === personId) return true;
  const member = w.members.find((m) => m.classId === cls.id && m.personId === personId);
  return cls.chatOpen && member?.mutedInChat !== true;
}

export function messageSent(w: DemoWorld, e: Of<'message.sent'>) {
  const thread = w.threads.find((t) => t.id === e.threadId);
  if (!thread || !canPost(w, thread.id, e.fromPersonId)) return;
  const replyTo = e.replyToId
    ? w.messages.find((m) => m.id === e.replyToId && m.threadId === thread.id)
    : undefined;
  w.messages.push({
    id: e.id,
    threadId: thread.id,
    authorId: e.fromPersonId,
    text: e.text,
    at: e.at,
    replyToId: replyTo?.id ?? null,
    reported: false,
  });
  // The sender has read everything up to their own message.
  markRead(thread.readAt, e.fromPersonId, e.at);
  const parent = thread.memberIds.find((id) => id === w.parent.personId);
  if (thread.kind === 'parent' && parent && e.fromPersonId !== parent)
    w.notifications.push({
      id: `n-${e.id}`,
      kind: 'teacherMessage',
      recipientId: parent,
      role: 'parent',
      at: e.at,
      read: false,
      teacherId: e.fromPersonId,
      threadId: thread.id,
    });
}

/** The reader has seen the thread up to the event: unread drops, the sender sees "Oxundu". */
export function threadRead(w: DemoWorld, e: Of<'thread.read'>) {
  const thread = w.threads.find((t) => t.id === e.threadId);
  if (!thread || !thread.memberIds.includes(e.readerId)) return;
  markRead(thread.readAt, e.readerId, e.at);
}

/** Read marks only move forward. */
function markRead(readAt: Record<string, string>, personId: string, at: string) {
  const before = readAt[personId];
  if (!before || before < at) readAt[personId] = at;
}
