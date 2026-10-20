import type { DemoWorld, PlanStep, TodayResponse } from '@mytutor/types';
import { readyTopic } from '../curriculum';
import { R7, r7 } from '../ids';
import { LESSON_POINTS } from '../lessons/lesson';
import { levelOf, topicsAt } from '../mastery';
import { teacherTitle } from '../people';
import { TOPIC_TEST_POINTS } from '../tests';
import { myAssignments, studentMap } from './common';

/** GET /v1/today: the plan, the unfinished lesson, due work and the motivation numbers. */

/** Days since the first crystallized topic was mastered (the plan's reason). */
const CRYSTALLIZED_DAYS_AGO = 10;
const REVIEW_POINTS = 10;

function plan(world: DemoWorld): PlanStep[] {
  const map = studentMap(world);
  const steps: PlanStep[] = [];
  const crystal = topicsAt(map, 'needs_practice')[0];
  if (crystal)
    steps.push({
      id: `plan-review-${crystal.id}`,
      kind: 'review',
      targetId: 'review',
      code: crystal.number,
      cell: 'needs_practice',
      title: crystal.shortTitle,
      reason: { kind: 'crystallized', daysAgo: CRYSTALLIZED_DAYS_AGO },
      minutes: Math.max(2, world.review.minutes),
      questionCount: null,
      points: REVIEW_POINTS,
    });
  const lesson = world.activity.unfinishedLesson;
  if (lesson)
    steps.push({
      id: `plan-lesson-${lesson.lessonId}`,
      kind: 'lesson',
      targetId: lesson.lessonId,
      code: lesson.code,
      cell: levelOf(map, lesson.lessonId),
      title: lesson.title,
      reason: { kind: 'unfinished', stepsLeft: lesson.total - lesson.done },
      minutes: 8,
      questionCount: null,
      points: LESSON_POINTS,
    });
  const test = myAssignments(world).find(
    (a) => a.kind === 'test' && a.dueAt > world.now && a.submission === null,
  );
  if (test)
    steps.push({
      id: `plan-assignment-${test.id}`,
      kind: 'assignment',
      targetId: test.id,
      code: test.topic.number,
      cell: levelOf(map, test.topicId),
      title: test.topic.title,
      reason: {
        kind: 'assignment',
        className: world.classes.find((c) => c.id === test.classId)?.shortName ?? test.classId,
      },
      minutes: null,
      questionCount: test.itemCount ?? null,
      points: TOPIC_TEST_POINTS,
    });
  return steps;
}

export function selectToday(world: DemoWorld): TodayResponse {
  const { student, activity } = world;
  const map = studentMap(world);
  const crystals = topicsAt(map, 'needs_practice');
  const week = world.weekReports[student.personId]?.[0];
  // Work due from now on, with its state: handed-in and graded work stays until its due date.
  const due = myAssignments(world).filter((a) => a.dueAt > world.now);
  return {
    studentName: student.name,
    plan: plan(world),
    unfinishedLesson: activity.unfinishedLesson,
    assignments: due.map((a) => {
      const cls = world.classes.find((c) => c.id === a.classId);
      return {
        id: a.id,
        className: cls?.shortName ?? a.classId,
        subject: cls?.subject ?? '',
        teacher: cls ? teacherTitle(cls.teacherId) : '',
        title: a.title,
        dueAt: a.dueAt,
        state: a.submission?.state ?? 'not_started',
        grade: a.submission?.grade ?? null,
      };
    }),
    firstStep: {
      subjectId: R7,
      subject: 'Riyaziyyat 7',
      firstTopicId: readyTopic(r7('1.1')).id,
      placementMinutes: 8,
      firstCellMinutes: 10,
    },
    motivation: {
      points: student.points,
      streak: student.streak,
      shields: student.shields,
      dailyMinutes: student.dailyMinutes,
      minutesToday: activity.minutesToday,
      endedStreak: student.streak,
      restartMinutes: 10,
      freezesThisWeek: week ? week.activeDays.filter((d) => !d).length : 0,
      todayCells: activity.todayCells,
      todayAccuracy: activity.todayAccuracy,
    },
    comeback:
      crystals.length > 0
        ? {
            awayDays: 9,
            crystals: crystals.map((t) => ({ topicId: t.id, code: t.number, title: t.shortTitle })),
            reviewMinutes: Math.max(2, world.review.minutes),
          }
        : null,
  };
}
