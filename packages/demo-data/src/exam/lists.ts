import type { Deadline, DemoWorld, MockListItem, SubjectReadiness } from '@mytutor/types';
import { READY_TOPICS } from '../curriculum';
import { percentOf } from './mocks';

/** The exam area's lists: mocks (with the student's last result) and coming deadlines. */

const DAY_MS = 24 * 3_600_000;

export function mockList(world: DemoWorld, readiness: SubjectReadiness[]): MockListItem[] {
  const self = world.mocks.filter((m) => m.kind === 'self');
  const items: MockListItem[] = self.map((m) => {
    const runs = world.mockRuns.filter((r) => r.mockId === m.id);
    const last = runs[runs.length - 1];
    return {
      preparing: false,
      id: m.id,
      subject: m.subject,
      number: m.number,
      questionCount: m.questions.length,
      status: last ? 'done' : 'new',
      lastPercent: last ? percentOf(last) : null,
      lastDate: last?.finishedAt ?? null,
    };
  });
  const preparing = readiness
    .filter((r) => !r.ready)
    .map((r) => ({ preparing: true as const, id: `mocks-${r.subject}`, subject: r.subject }));
  return [...items, ...preparing];
}

export function deadlines(world: DemoWorld): Deadline[] {
  const general = world.mocks.find((m) => m.kind === 'scheduled');
  const mine = world.assignments.filter(
    (a) => world.student.classIds.includes(a.classId) && a.kind === 'test' && a.dueAt > world.now,
  );
  const list: Deadline[] = mine.map((a) => ({
    kind: 'assignment',
    id: `deadline-${a.id}`,
    date: a.dueAt,
    assignmentId: a.id,
    className: world.classes.find((c) => c.id === a.classId)?.shortName ?? a.classId,
    subject: 'math',
    topic: READY_TOPICS.find((t) => t.id === a.topicId)?.shortTitle ?? a.title,
  }));
  if (general?.startsAt && general.registrationEndsAt) {
    list.push(
      {
        kind: 'registrationEnds',
        id: 'deadline-registration',
        date: general.registrationEndsAt,
        mockNumber: general.number,
      },
      {
        kind: 'mock',
        id: 'deadline-mock',
        date: general.startsAt,
        mockNumber: general.number,
        subject: general.subject,
        registrationOpen: true,
      },
      {
        kind: 'mock',
        id: 'deadline-next-mock',
        date: new Date(Date.parse(general.startsAt) + 28 * DAY_MS).toISOString(),
        mockNumber: general.number + 1,
        subject: general.subject,
        registrationOpen: false,
      },
    );
  }
  list.push(
    { kind: 'officialRegistration', id: 'deadline-official-registration', date: null },
    { kind: 'officialExam', id: 'deadline-official-exam', date: null },
  );
  return list;
}
