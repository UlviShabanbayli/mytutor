import type {
  ClassFeed,
  ClassPreview,
  ClassSummary,
  DemoWorld,
  LiveLesson,
  StudentAssignment,
} from '@mytutor/types';
import { myAssignments, personRef, unreadIn } from './common';

/** GET /v1/classes, /v1/classes/:id, /v1/classes/:id/live, /v1/classes/join/:code, assignments. */

/** Points per drop in the class's honey jar; the goal is ten drops per student. */
const POINTS_PER_DROP = 20;
const DROPS_PER_STUDENT = 10;

const classThread = (world: DemoWorld, classId: string) =>
  world.threads.find((t) => t.kind === 'class' && t.classId === classId);

function summary(world: DemoWorld, classId: string): ClassSummary | null {
  const cls = world.classes.find((c) => c.id === classId);
  if (!cls) return null;
  const me = world.student.personId;
  const roster = world.members.filter((m) => m.classId === classId);
  const thread = classThread(world, classId);
  const readAt = thread?.readAt[me] ?? '';
  const newMessages = thread ? unreadIn(world, thread.id, me) : 0;
  const newAnnouncements = world.announcements.filter(
    (a) => a.classId === classId && a.at > readAt,
  ).length;
  const next = myAssignments(world).find(
    (a) => a.classId === classId && a.dueAt > world.now && a.submission === null,
  );
  const live = world.liveLessons
    .filter((l) => l.classId === classId && l.startsAt > world.now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const done = roster.reduce((n, m) => n + Math.floor(m.weekPoints / POINTS_PER_DROP), 0);
  const goal = roster.length * DROPS_PER_STUDENT;
  const mine = roster.find((m) => m.personId === me)?.weekPoints ?? 0;
  return {
    id: cls.id,
    shortName: cls.shortName,
    name: cls.name,
    teacher: personRef(world, cls.teacherId),
    students: roster.length,
    unread: newMessages + newAnnouncements,
    newMessages,
    newAnnouncements,
    nextAssignment: next ? { id: next.id, title: next.title, dueAt: next.dueAt } : null,
    nextLive: live ? { id: live.id, title: live.title, startsAt: live.startsAt } : null,
    jar: {
      percent: Math.min(100, Math.round((done / Math.max(1, goal)) * 100)),
      done,
      goal: Math.max(1, goal),
      mine: Math.floor(mine / POINTS_PER_DROP),
    },
  };
}

export const selectClasses = (world: DemoWorld): ClassSummary[] =>
  world.student.classIds.flatMap((id) => summary(world, id) ?? []);

export function selectClassFeed(world: DemoWorld, classId: string): ClassFeed | null {
  if (!world.student.classIds.includes(classId)) return null;
  const cls = summary(world, classId);
  if (!cls) return null;
  const recordings = world.recordings
    .filter((r) => r.classId === classId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  return {
    class: cls,
    announcements: world.announcements
      .filter((a) => a.classId === classId)
      .sort((a, b) => b.at.localeCompare(a.at)),
    live: selectClassLive(world, classId),
    recording: recordings[0] ?? null,
    assignments: myAssignments(world).filter((a) => a.classId === classId),
    materials: world.materials.filter(
      (m) => m.classIds.includes(classId) && (m.state === 'class' || m.state === 'approved'),
    ),
  };
}

/** The class's next live lesson (the room the demo opens). */
export function selectClassLive(world: DemoWorld, classId: string): LiveLesson | null {
  if (!world.student.classIds.includes(classId)) return null;
  return (
    world.liveLessons
      .filter((l) => l.classId === classId)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null
  );
}

/** What a join code opens; codes are read without regard to case. */
export function selectJoin(world: DemoWorld, code: string): ClassPreview | null {
  const found = world.codes.find(
    (c) => c.kind === 'class' && c.code.toUpperCase() === code.trim().toUpperCase(),
  );
  const cls = found?.kind === 'class' ? world.classes.find((c) => c.id === found.classId) : null;
  if (!cls) return null;
  return {
    id: cls.id,
    name: cls.name,
    teacher: personRef(world, cls.teacherId),
    students: world.members.filter((m) => m.classId === cls.id).length,
    member: world.student.classIds.includes(cls.id),
  };
}

export const selectAssignments = (world: DemoWorld): StudentAssignment[] => myAssignments(world);

export const selectAssignment = (world: DemoWorld, id: string): StudentAssignment | null =>
  myAssignments(world).find((a) => a.id === id) ?? null;
