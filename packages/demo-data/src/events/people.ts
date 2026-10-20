import type { ChildLink, DemoEvent, DemoWorld, ParentRelation } from '@mytutor/types';

/**
 * Event handlers for who belongs where: class membership, parent links, consent and read
 * notifications. Like the work handlers they change the draft world and ignore unknown ids.
 */

type Of<T extends DemoEvent['type']> = Extract<DemoEvent, { type: T }>;

/** What a newly linked child shares from the start (the consent screen's defaults). */
export const DEFAULT_GRANTS: ChildLink['grants'] = ['report', 'progress', 'assignments'];

export function classJoined(w: DemoWorld, e: Of<'class.joined'>) {
  const cls = w.classes.find((c) => c.id === e.classId);
  const person = w.people.find((p) => p.id === e.studentId);
  if (!cls || !person) return;
  if (!w.members.some((m) => m.classId === cls.id && m.personId === person.id)) {
    const isMe = person.id === w.student.personId;
    w.members.push({
      classId: cls.id,
      personId: person.id,
      nickname: isMe ? w.student.nickname : person.firstName,
      sharesProgress: true,
      mutedInChat: false,
      activeThisWeek: isMe && w.student.points.week > 0,
      weekPoints: isMe ? w.student.points.week : 0,
      joinedAt: e.at,
    });
  }
  w.mastery[person.id] ??= {};
  if (person.id === w.student.personId && !w.student.classIds.includes(cls.id))
    w.student.classIds.push(cls.id);
  for (const t of w.threads)
    if (t.kind === 'class' && t.classId === cls.id && !t.memberIds.includes(person.id)) {
      t.memberIds.push(person.id);
      // A new member starts with the chat read, not with its whole history unread.
      t.readAt[person.id] = e.at;
    }
}

/** A student leaves (or is removed from) a class: the roster, their classes and the chat. */
export function classLeft(w: DemoWorld, e: Of<'class.left'> | Of<'member.removed'>) {
  w.members = w.members.filter((m) => !(m.classId === e.classId && m.personId === e.studentId));
  if (e.studentId === w.student.personId)
    w.student.classIds = w.student.classIds.filter((id) => id !== e.classId);
  for (const t of w.threads)
    if (t.kind === 'class' && t.classId === e.classId)
      t.memberIds = t.memberIds.filter((id) => id !== e.studentId);
}

const relationOf = (w: DemoWorld, parentId: string): ParentRelation =>
  w.childLinks.find((l) => l.parentId === parentId)?.relation ?? 'guardian';

export function childLinked(w: DemoWorld, e: Of<'child.linked'>) {
  if (!w.people.some((p) => p.id === e.parentId) || !w.people.some((p) => p.id === e.childId))
    return;
  const link = w.childLinks.find((l) => l.parentId === e.parentId && l.childId === e.childId);
  if (link) {
    if (link.status === 'active') return;
    link.status = 'active';
    link.since = e.at;
    if (link.grants.length === 0) link.grants = [...DEFAULT_GRANTS];
    return;
  }
  w.childLinks.push({
    parentId: e.parentId,
    childId: e.childId,
    relation: relationOf(w, e.parentId),
    status: 'active',
    underThirteen: false,
    grants: [...DEFAULT_GRANTS],
    since: e.at,
  });
}

export function childUnlinked(w: DemoWorld, e: Of<'child.unlinked'>) {
  w.childLinks = w.childLinks.filter(
    (l) => !(l.parentId === e.parentId && l.childId === e.childId),
  );
}

export function consentDecided(w: DemoWorld, e: Of<'consent.decided'>) {
  const link = w.childLinks.find(
    (l) => l.parentId === e.parentId && l.childId === e.childId && l.status === 'awaiting_consent',
  );
  if (!link) return;
  if (!e.approved) {
    w.childLinks = w.childLinks.filter((l) => l !== link);
    return;
  }
  link.status = 'active';
  link.grants = [...DEFAULT_GRANTS];
  link.since = e.at;
}

export function notificationRead(w: DemoWorld, e: Of<'notification.read'>) {
  const n = w.notifications.find((x) => x.id === e.notificationId);
  if (n) n.read = true;
}
