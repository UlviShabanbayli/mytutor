import type {
  Assignment,
  DemoWorld,
  MasteryMap,
  Person,
  PersonRef,
  Role,
  StudentAssignment,
  Submission,
} from '@mytutor/types';
import { demoSource, topicById } from '../curriculum';

/** Helpers every selector shares. Selectors only read the world; they never change it. */

export type DemoQuery = Record<string, string | undefined>;
export type DemoRequest = { params: Record<string, string>; query: DemoQuery };

export function personOf(world: DemoWorld, id: string): Person | null {
  return world.people.find((p) => p.id === id) ?? null;
}

export function personRef(world: DemoWorld, id: string): PersonRef {
  const p = personOf(world, id);
  return { id, name: p?.fullName ?? id, initials: p?.initials ?? '?' };
}

/** Who reads as `role`: the persona student, Lalə or Səbinə. */
export function viewerOf(world: DemoWorld, role: Role): string {
  if (role === 'teacher') return world.teacher.personId;
  if (role === 'parent') return world.parent.personId;
  return world.student.personId;
}

export function roleOf(query: DemoQuery): Role {
  return query.role === 'teacher' || query.role === 'parent' ? query.role : 'student';
}

export const studentMap = (world: DemoWorld): MasteryMap =>
  world.mastery[world.student.personId] ?? {};

export function submissionOf(
  world: DemoWorld,
  assignmentId: string,
  studentId: string,
): Submission | null {
  return (
    world.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId) ??
    null
  );
}

/** Due passed and nothing handed in. */
export const isLate = (world: DemoWorld, a: Assignment, s: Submission | null) =>
  a.dueAt < world.now && (s === null || s.submittedAt === null);

/** An assignment with one student's own state. */
export function studentAssignment(
  world: DemoWorld,
  a: Assignment,
  studentId: string,
): StudentAssignment {
  const cls = world.classes.find((c) => c.id === a.classId);
  const topic = topicById(a.topicId);
  const submission = submissionOf(world, a.id, studentId);
  return {
    ...a,
    className: cls?.name ?? a.classId,
    teacher: personRef(world, cls?.teacherId ?? ''),
    topic: {
      id: a.topicId,
      number: topic?.number ?? '',
      title: topic?.shortTitle ?? a.title,
      source: demoSource(a.topicId, 'demo'),
    },
    submission,
    late: isLate(world, a, submission),
  };
}

/** Whether an assignment reaches a student (class, group or a list of students). */
export function reaches(world: DemoWorld, a: Assignment, studentId: string): boolean {
  const inClass = world.members.some((m) => m.classId === a.classId && m.personId === studentId);
  if (!inClass) return false;
  if (a.audience.type === 'class') return true;
  if (a.audience.type === 'students') return a.audience.ids.includes(studentId);
  const groupId = a.audience.groupId;
  const group = world.classes.find((c) => c.id === a.classId)?.groups.find((g) => g.id === groupId);
  return group?.memberIds.includes(studentId) ?? false;
}

/** The persona student's assignments, soonest due first. */
export function myAssignments(world: DemoWorld): StudentAssignment[] {
  const me = world.student.personId;
  return world.assignments
    .filter((a) => world.student.classIds.includes(a.classId) && reaches(world, a, me))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .map((a) => studentAssignment(world, a, me));
}

/** Unread messages of a thread for one reader. */
export function unreadIn(world: DemoWorld, threadId: string, readerId: string): number {
  const thread = world.threads.find((t) => t.id === threadId);
  const since = thread?.readAt[readerId] ?? '';
  return world.messages.filter(
    (m) => m.threadId === threadId && m.authorId !== readerId && m.at > since,
  ).length;
}
