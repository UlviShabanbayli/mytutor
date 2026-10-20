import type {
  Announcement,
  AppNotification,
  ChatThreadDetail,
  ChatThreadView,
  ChildAssignment,
  ChildOverview,
  ParentHome,
} from '@mytutor/types';
import type {
  AssignmentItem,
  ChildView,
  ClassNote,
  Conversation,
  ParentNotification,
  ParentSelf,
  TeacherContact,
  Thread,
} from './types';

/** The parent's view of the demo world: `/v1/parent/*` answers turned into what screens show. */

export const parentSelf = (home: ParentHome): ParentSelf => ({
  name: home.person.firstName,
  phoneMasked: home.profile.phoneMasked,
});

const activeChild = (home: ParentHome, childId: string | null) =>
  home.children.find((c) => c.childId === childId && c.status === 'active');

/**
 * The children, linked ones first (a child linked again comes back above the waiting ones), each
 * week marked new while its report notification is unread.
 */
export function toChildViews(home: ParentHome, notifications: AppNotification[]): ChildView[] {
  const unread = new Set(
    notifications.flatMap((n) => (n.kind === 'weeklyReport' && !n.read ? [n.childId] : [])),
  );
  const rank = (c: ChildOverview) => (c.status === 'active' ? 0 : 1);
  return [...home.children]
    .sort((a, b) => rank(a) - rank(b))
    .map((child) => ({
      ...child,
      week: child.week ? { ...child.week, reportIsNew: unread.has(child.childId) } : null,
    }));
}

/** A grade in points, a mock's in percent; "late" when the due date passed with nothing in. */
export function toAssignmentItem(a: ChildAssignment): AssignmentItem {
  const score =
    a.grade === null
      ? null
      : a.kind === 'mock'
        ? { kind: 'percent' as const, value: Math.round((a.grade.score / a.grade.max) * 100) }
        : { kind: 'points' as const, value: a.grade.score, max: a.grade.max };
  return {
    id: a.id,
    title: a.title,
    dueAt: a.dueAt,
    state: a.late ? 'late' : a.state,
    progress: a.progress,
    lateDays: a.lateDays,
    submittedAt: a.submittedAt,
    onTime: a.onTime,
    score,
  };
}

/** A child's class notes, oldest first. */
function notesOf(child: ChildOverview, notes: Announcement[]): ClassNote[] {
  return notes
    .filter((n) => n.classId === child.classId)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((n) => ({ id: n.id, className: child.className ?? n.classId, text: n.text, at: n.at }));
}

function contactOf(thread: ChatThreadView, child: ChildOverview): TeacherContact {
  return {
    threadId: thread.id,
    name: thread.title,
    firstName: thread.title.split(' ')[0] ?? thread.title,
    classLabel: child.classLabel ?? child.className ?? '',
    childName: child.name,
  };
}

/**
 * The teachers of linked children: a conversation about a child who is no longer linked closes.
 * `seenAt` holds when the parent last opened each conversation on this device.
 */
export function toConversations(
  threads: ChatThreadView[],
  home: ParentHome,
  notes: Announcement[],
  seenAt: Record<string, string> = {},
): Conversation[] {
  return threads.flatMap((thread) => {
    const child = thread.kind === 'parent' ? activeChild(home, thread.childId) : undefined;
    if (!child) return [];
    const last = thread.last;
    const seen = seenAt[thread.id];
    const caughtUp = last !== null && (last.mine || (seen !== undefined && seen >= last.at));
    const childNotes = notesOf(child, notes);
    return [
      {
        ...contactOf(thread, child),
        last: last ? { text: last.text, at: last.at, fromMe: last.mine } : null,
        latestNote: childNotes[childNotes.length - 1] ?? null,
        unread: caughtUp ? 0 : thread.unread,
      },
    ];
  });
}

/** One conversation with its class notes; null when its child is not linked (any more). */
export function toThread(
  detail: ChatThreadDetail,
  home: ParentHome,
  notes: Announcement[],
): Thread | null {
  const child = detail.kind === 'parent' ? activeChild(home, detail.childId) : undefined;
  if (!child) return null;
  return {
    ...contactOf(detail, child),
    notes: notesOf(child, notes),
    messages: detail.messages.map((m) => ({
      id: m.id,
      from: m.mine ? 'me' : 'teacher',
      text: m.text,
      at: m.at,
      status: m.status,
      reported: m.reported,
    })),
  };
}

/** The parent's notifications about linked children and their teachers, newest first. */
export function toNotifications(
  list: AppNotification[],
  home: ParentHome,
  threads: ChatThreadView[],
): { items: ParentNotification[]; unread: number } {
  const items = list.flatMap((n): ParentNotification[] => {
    const base = { id: n.id, at: n.at, read: n.read };
    if (n.kind === 'weeklyReport') {
      const child = activeChild(home, n.childId);
      return child
        ? [{ ...base, kind: 'weekly_report', childId: n.childId, childName: child.name }]
        : [];
    }
    if (n.kind === 'teacherMessage') {
      const thread = threads.find((t) => t.id === n.threadId);
      return thread && activeChild(home, thread.childId)
        ? [{ ...base, kind: 'teacher_message', threadId: n.threadId, teacherName: thread.title }]
        : [];
    }
    return [];
  });
  return { items, unread: items.filter((n) => !n.read).length };
}
