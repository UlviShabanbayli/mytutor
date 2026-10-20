import type { Href } from 'expo-router';
import type { Topic } from '@mytutor/types';
import type { PlanStep, StepKind } from './types';

/** A practice test step is worth what the world's test steps are worth ("+10"). */
const TEST_STEP_POINTS = 10;

/** Steps and, when every step's length is known, their total minutes. */
export function planSummary(steps: PlanStep[]): { count: number; minutes: number | null } {
  const known = steps.every((s) => s.minutes !== null);
  return {
    count: steps.length,
    minutes: known ? steps.reduce((sum, s) => sum + (s.minutes ?? 0), 0) : null,
  };
}

/** The screen a plan step opens: the step leads straight to the work (architecture Ş2). */
export function stepHref(kind: StepKind, targetId: string): Href {
  switch (kind) {
    case 'review':
      return '/review';
    case 'lesson':
      return { pathname: '/lesson/[id]', params: { id: targetId } };
    case 'test':
      return { pathname: '/test/[id]', params: { id: targetId } };
    case 'topic':
      return { pathname: '/topic/[id]', params: { id: targetId } };
    case 'assignment':
      return { pathname: '/assignment/[id]', params: { id: targetId } };
    case 'mock':
      return '/exam/mocks';
  }
}

/** A test published from the team's test books (local API only) as an extra practice step. */
export function testStep(topic: Topic): PlanStep {
  return {
    id: `plan-test-${topic.id}`,
    kind: 'test',
    targetId: topic.id,
    code: null,
    cell: 'not_started',
    title: topic.title,
    reason: { kind: 'questions', count: topic.questionCount },
    minutes: null,
    questionCount: topic.questionCount,
    points: TEST_STEP_POINTS,
  };
}

/** The day's steps: the world's plan plus the published practice test, when the API has one. */
export function withRecommendedTest(plan: PlanStep[], topic: Topic | null | undefined) {
  return topic && topic.questionCount > 0 ? [...plan, testStep(topic)] : plan;
}
