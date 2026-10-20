import type { DemoEvent, DemoWorld } from '@mytutor/types';

/**
 * Event handlers for running a class: a new class, announcements, groups, muting, the chat
 * switch and the teacher's materials. Only the class's own teacher changes a class.
 */

type Of<T extends DemoEvent['type']> = Extract<DemoEvent, { type: T }>;

const teacherOf = (w: DemoWorld, classId: string) =>
  w.classes.find((c) => c.id === classId)?.teacherId ?? null;

/** A new class: its roster is empty, its chat has the teacher, its code opens it. */
export function classCreated(w: DemoWorld, e: Of<'class.created'>) {
  const cls = e.class;
  const codeTaken = w.codes.some((c) => c.kind === 'class' && c.code === cls.joinCode);
  if (w.classes.some((c) => c.id === cls.id) || codeTaken) return;
  if (!w.people.some((p) => p.id === cls.teacherId)) return;
  w.classes.push(cls);
  if (cls.teacherId === w.teacher.personId) w.teacher.classIds.push(cls.id);
  w.codes.push({ kind: 'class', code: cls.joinCode, classId: cls.id });
  w.threads.push({
    id: `chat-${cls.id}`,
    kind: 'class',
    classId: cls.id,
    memberIds: [cls.teacherId],
    childId: null,
    readAt: { [cls.teacherId]: e.at },
  });
}

export function announcementPosted(w: DemoWorld, e: Of<'announcement.posted'>) {
  if (teacherOf(w, e.classId) !== e.authorId) return;
  w.announcements.push({
    id: e.id,
    classId: e.classId,
    authorId: e.authorId,
    text: e.text,
    at: e.at,
  });
}

/** A group is saved whole; members who are not in the class are left out. */
export function groupSaved(w: DemoWorld, e: Of<'group.saved'>) {
  const cls = w.classes.find((c) => c.id === e.classId);
  if (!cls) return;
  const roster = new Set(w.members.filter((m) => m.classId === cls.id).map((m) => m.personId));
  const group = { ...e.group, memberIds: e.group.memberIds.filter((id) => roster.has(id)) };
  const i = cls.groups.findIndex((g) => g.id === group.id);
  if (i >= 0) cls.groups[i] = group;
  else cls.groups.push(group);
}

export function memberMuted(w: DemoWorld, e: Of<'member.muted'>) {
  const member = w.members.find((m) => m.classId === e.classId && m.personId === e.studentId);
  if (member) member.mutedInChat = e.muted;
}

export function classChatSet(w: DemoWorld, e: Of<'class.chatSet'>) {
  const cls = w.classes.find((c) => c.id === e.classId);
  if (cls) cls.chatOpen = e.open;
}

/** A material is saved whole (a draft, sent to classes, or in the catalogue's review). */
export function materialSaved(w: DemoWorld, e: Of<'material.saved'>) {
  const m = e.material;
  if (!w.people.some((p) => p.id === m.ownerId)) return;
  const saved = { ...m, classIds: m.classIds.filter((id) => teacherOf(w, id) === m.ownerId) };
  const i = w.materials.findIndex((x) => x.id === m.id);
  if (i >= 0) {
    if (w.materials[i]?.ownerId !== m.ownerId) return;
    w.materials[i] = saved;
  } else w.materials.push(saved);
}
