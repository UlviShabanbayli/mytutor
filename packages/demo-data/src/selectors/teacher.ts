import type {
  Assignment,
  AskQuestionView,
  BankQuestion,
  ClassInsights,
  DemoWorld,
  LiveLesson,
  Material,
  SubmissionView,
  TeacherAssignment,
  TeacherClassDetail,
  TeacherClassView,
  TeacherHome,
} from '@mytutor/types';
import { demoSource, READY_UNITS } from '../curriculum';
import { levelOf } from '../mastery';
import { askView } from './ask';
import { personOf, reaches, unreadIn } from './common';
import { selectNotifications } from './messages';

/** GET /v1/teacher and /v1/teacher/*: Lalə's classes, work, questions and insights. */

const mine = (world: DemoWorld) => world.teacher.classIds;

function assignmentView(world: DemoWorld, a: Assignment): TeacherAssignment {
  const audience = world.members.filter(
    (m) => m.classId === a.classId && reaches(world, a, m.personId),
  );
  const subs = world.submissions.filter(
    (s) => s.assignmentId === a.id && s.state !== 'not_started' && s.state !== 'in_progress',
  );
  return {
    ...a,
    done: subs.length,
    total: audience.length,
    toGrade: subs.filter((s) => s.state === 'submitted' && a.kind === 'homework').length,
  };
}

function classView(world: DemoWorld, classId: string): TeacherClassView | null {
  const cls = world.classes.find((c) => c.id === classId);
  if (!cls) return null;
  const roster = world.members.filter((m) => m.classId === classId);
  const active = world.assignments
    .filter((a) => a.classId === classId && a.dueAt > world.now)
    .map((a) => assignmentView(world, a));
  const done = active.reduce((n, a) => n + a.done, 0);
  const total = active.reduce((n, a) => n + a.total, 0);
  const thread = world.threads.find((t) => t.kind === 'class' && t.classId === classId);
  return {
    ...cls,
    studentCount: roster.length,
    activeThisWeek: roster.filter((m) => m.activeThisWeek).length,
    activeAssignments: active.length,
    completion: total > 0 ? Math.round((done / total) * 100) / 100 : 0,
    chatUnread: thread ? unreadIn(world, thread.id, world.teacher.personId) : 0,
  };
}

export function selectTeacherHome(world: DemoWorld): TeacherHome | null {
  const person = personOf(world, world.teacher.personId);
  if (!person) return null;
  return {
    person,
    profile: world.teacher,
    classes: mine(world).flatMap((id) => classView(world, id) ?? []),
    notices: selectNotifications(world, 'teacher'),
  };
}

export function selectTeacherClass(world: DemoWorld, classId: string): TeacherClassDetail | null {
  if (!mine(world).includes(classId)) return null;
  const cls = classView(world, classId);
  if (!cls) return null;
  return {
    class: cls,
    members: world.members
      .filter((m) => m.classId === classId)
      .map((m) => {
        const p = personOf(world, m.personId);
        return { ...m, name: p?.fullName ?? m.personId, shortName: p?.shortName ?? m.personId };
      }),
    assignments: world.assignments
      .filter((a) => a.classId === classId)
      .sort((a, b) => b.dueAt.localeCompare(a.dueAt))
      .map((a) => assignmentView(world, a)),
  };
}

export const selectTeacherAssignments = (world: DemoWorld): TeacherAssignment[] =>
  world.assignments
    .filter((a) => mine(world).includes(a.classId))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .map((a) => assignmentView(world, a));

/** Handed-in work of one assignment, waiting ones first. */
export function selectSubmissions(world: DemoWorld, assignmentId: string): SubmissionView[] | null {
  const a = world.assignments.find((x) => x.id === assignmentId);
  if (!a || !mine(world).includes(a.classId)) return null;
  return world.submissions
    .filter((s) => s.assignmentId === assignmentId && s.state !== 'not_started')
    .sort((x, y) => Number(x.grade !== null) - Number(y.grade !== null))
    .map((s) => ({
      ...s,
      studentName: personOf(world, s.studentId)?.fullName ?? s.studentId,
      source: demoSource(a.topicId, 'demo tapşırıq'),
    }));
}

/** Questions to Lalə from her classes, newest first. */
export const selectInbox = (world: DemoWorld): AskQuestionView[] =>
  world.askQuestions
    .filter((q) => q.teacherId === world.teacher.personId && q.classId !== null)
    .filter((q) => mine(world).includes(q.classId ?? ''))
    .sort((a, b) => (b.timeline[0]?.at ?? '').localeCompare(a.timeline[0]?.at ?? ''))
    .map((q) => askView(world, q));

export const selectInboxQuestion = (world: DemoWorld, id: string): AskQuestionView | null =>
  selectInbox(world).find((q) => q.id === id) ?? null;

export const selectMaterials = (world: DemoWorld): Material[] =>
  world.materials.filter((m) => m.ownerId === world.teacher.personId);

export const selectBank = (world: DemoWorld): BankQuestion[] => world.bank;

export const selectTeacherLive = (world: DemoWorld): LiveLesson[] =>
  world.liveLessons.filter((l) => l.teacherId === world.teacher.personId);

/** The class's current unit (unit 4) over the last 14 days; hidden students are only counted. */
export function selectInsights(world: DemoWorld, classId: string): ClassInsights | null {
  const cls = classView(world, classId);
  const unit = READY_UNITS.find((u) => u.number === '4');
  if (!cls || !unit || !mine(world).includes(classId)) return null;
  const roster = world.members.filter((m) => m.classId === classId);
  return {
    classId,
    unitId: unit.id,
    days: 14,
    topics: unit.topics.map((t) => ({ id: t.id, number: t.number })),
    completion: cls.completion,
    activeThisWeek: cls.activeThisWeek,
    studentCount: cls.studentCount,
    rows: roster
      .filter((m) => m.sharesProgress)
      .map((m) => ({
        studentId: m.personId,
        name: personOf(world, m.personId)?.fullName ?? m.personId,
        levels: unit.topics.map((t) => levelOf(world.mastery[m.personId] ?? {}, t.id)),
      })),
    hiddenCount: roster.filter((m) => !m.sharesProgress).length,
    missed: world.missed
      .filter((x) => x.classId === classId)
      .map(({ classId: _c, ...rest }) => rest),
  };
}
