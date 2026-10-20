import { studyGoalSchema } from '@mytutor/schemas';
import type { DemoWorld, ExamState, Leaderboard, MockExam, StudyGoal } from '@mytutor/types';
import { withExamGoal } from '../exam/goal';
import { leaderboard } from '../exam/mocks';
import type { DemoQuery } from './common';

/**
 * GET /v1/exam[/plan|/weak-spots|/mocks|/deadlines|/next-mock], /v1/exam/mocks/:id,
 * /v1/exam/leaderboard/:scope. The server keeps no state: the app sends the goal it chose
 * (`?goal=graduation_9`, `&group=I`, `&date=YYYY-MM-DD`); without one the student's own goal
 * (the school programme) applies.
 */

export function goalFromQuery(world: DemoWorld, query: DemoQuery): StudyGoal {
  if (!query.goal) return world.student.goal;
  if (query.goal === 'school') return { kind: 'school' };
  const parsed = studyGoalSchema.safeParse({
    kind: 'exam',
    exam: query.goal,
    group: query.group ?? null,
    date: query.date ?? null,
  });
  return parsed.success ? parsed.data : world.student.goal;
}

export const selectExam = (world: DemoWorld, goal: StudyGoal): ExamState =>
  withExamGoal(world, goal).exam;

export function selectMock(world: DemoWorld, id: string): MockExam | null {
  return world.mocks.find((m) => m.id === id) ?? null;
}

/** The next scheduled general mock (the exam tab's card, the plan's note, registration). */
export function selectNextMock(world: DemoWorld): MockExam | null {
  return world.mocks.find((m) => m.kind === 'scheduled') ?? null;
}

/** Where the student's latest mock stands; null before the first one. */
export function selectLeaderboard(world: DemoWorld, scope: string): Leaderboard | null {
  const run = world.mockRuns[world.mockRuns.length - 1];
  if (!run || (scope !== 'class' && scope !== 'country')) return null;
  if (scope === 'class' && world.student.classIds.length === 0) return null;
  return leaderboard(run, world.student.nickname, scope);
}
