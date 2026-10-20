import type {
  CurriculumResponse,
  DemoWorld,
  Hive,
  HiveTopic,
  MasteryLevel,
  PlacementQuestion,
  Textbook,
  TopicMaterial,
  TopicStep,
} from '@mytutor/types';
import { makeClock } from '../clock';
import { filledCount, levelOf, unitResult } from '../mastery';
import { personOf, studentMap } from './common';

/** GET /v1/curriculum, /v1/hive[/:subjectId], /v1/hive/placement. */

export const selectCurriculum = (world: DemoWorld): CurriculumResponse => world.curriculum;

/** The four steps as far as the topic's level says; the unfinished lesson is half-way. */
function stepsFor(level: MasteryLevel, unfinished: boolean): TopicStep[] {
  const lesson: TopicStep = { kind: 'lesson', state: 'todo', minutes: 7 };
  const examples: TopicStep = { kind: 'examples', state: 'todo', total: 3, done: 0, minutes: 5 };
  const practice: TopicStep = { kind: 'practice', state: 'todo', total: 8, done: 0, minutes: 8 };
  const test: TopicStep = { kind: 'test', state: 'todo' };
  if (unfinished)
    return [
      { ...lesson, state: 'done' },
      { ...examples, state: 'current', done: 2, minutes: 4 },
      practice,
      test,
    ];
  if (level === 'not_started') return [{ ...lesson, state: 'current' }, examples, practice, test];
  if (level === 'lesson_completed')
    return [{ ...lesson, state: 'done' }, { ...examples, state: 'current' }, practice, test];
  return [lesson, examples, practice, test].map((s) => ({ ...s, state: 'done', done: s.total }));
}

/** "6:40" from seconds. */
const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function materialFor(world: DemoWorld, topicId: string): TopicMaterial | undefined {
  const clock = makeClock(new Date(world.now));
  const m = world.materials.find(
    (x) =>
      x.kind === 'video' &&
      x.topicId === topicId &&
      (x.state === 'class' || x.state === 'approved') &&
      x.classIds.some((c) => world.student.classIds.includes(c)),
  );
  if (!m) return undefined;
  const teacher = personOf(world, m.ownerId);
  const cls = world.classes.find((c) => m.classIds.includes(c.id));
  return {
    id: m.id,
    teacher: teacher?.fullName ?? m.ownerId,
    teacherShort: teacher?.firstName ?? m.ownerId,
    className: cls?.shortName ?? '',
    title: m.title,
    duration: duration(m.size),
    addedDaysAgo: Math.max(0, -clock.daysUntil(m.updatedAt)),
  };
}

const summary = (t: Textbook) => {
  const ready = t.volumes.find((v) => v.ready);
  return {
    id: t.id,
    name: t.name,
    parts: t.parts,
    ready: ready !== undefined,
    ...(ready
      ? {
          readyPart: ready.part,
          topicCount: ready.units.reduce((n, u) => n + u.topics.length, 0),
        }
      : {}),
  };
};

/** The hive box of a subject's chosen textbook volume; null when no volume is ready. */
export function selectHive(world: DemoWorld, subjectId = world.student.subjectId): Hive | null {
  const subject = world.curriculum.subjects.find((s) => s.id === subjectId);
  const choice = world.curriculum.choices.find((c) => c.subjectId === subjectId);
  const textbook = world.curriculum.textbooks.find((t) => t.id === choice?.textbookId);
  const volume = textbook?.volumes.find((v) => v.part === choice?.part);
  if (!subject || !choice || !textbook || !volume?.ready) return null;
  const map = studentMap(world);
  const unfinished = world.activity.unfinishedLesson?.lessonId ?? null;
  const units = volume.units.map((u) => {
    const result = unitResult(map, u.id);
    return {
      ...u,
      topics: u.topics.map((t): HiveTopic => {
        const level = levelOf(map, t.id);
        const material = materialFor(world, t.id);
        return {
          ...t,
          level,
          steps: stepsFor(level, t.id === unfinished),
          ...(material ? { material } : {}),
        };
      }),
      unitTest: result
        ? { level: 'reinforced' as const, result }
        : { level: 'not_started' as const },
    };
  });
  return {
    id: subjectId,
    subjectId,
    subjectName: subject.name,
    grade: subject.grade,
    textbookId: textbook.id,
    part: volume.part,
    textbooks: world.curriculum.textbooks.filter((t) => t.subjectId === subjectId).map(summary),
    units,
    currentTopicId: unfinished,
    savedTopicIds: world.activity.savedTopicIds,
    filled: filledCount(map),
    total: units.reduce((n, u) => n + u.topics.length, 0),
  };
}

export const selectPlacement = (world: DemoWorld): PlacementQuestion[] => world.placement;
