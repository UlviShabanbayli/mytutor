import { testIdOf } from '@mytutor/demo-data';
import type { Assignment, AssignmentKind, Audience, SolutionStep } from '@mytutor/types';
import type { TopicView, UnitView } from './types';

/** Pure builders of the teacher's demo events (the hooks in queries.ts send them). */

const PREFIX: Record<AssignmentKind, string> = {
  homework: 'hw',
  test: 'quiz',
  lesson: 'lesson',
  mock: 'mock',
};

/** A homework has as many exercises as the world's homework ("4.1 çalışmaları": 5). */
export const HOMEWORK_EXERCISES = 5;

/** "quiz-4-4", "hw-4-1", "mock-u4"; "-2", "-3"… when the id is taken already. */
export function assignmentIdFor(
  kind: AssignmentKind,
  topic: TopicView,
  unit: UnitView,
  taken: readonly string[],
): string {
  const base =
    kind === 'mock' ? `mock-u${unit.number}` : `${PREFIX[kind]}-${topic.number.replace('.', '-')}`;
  let id = base;
  for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`;
  return id;
}

export type AssignmentDraft = {
  classId: string;
  kind: AssignmentKind;
  topic: TopicView;
  unit: UnitView;
  audience: Audience;
  dueAt: string;
  title: string;
  description: string;
};

/** The assignment an `assignment.created` event carries; tests lead to the topic's or unit's test. */
export function newAssignment(d: AssignmentDraft, taken: readonly string[], now: Date): Assignment {
  const base: Assignment = {
    id: assignmentIdFor(d.kind, d.topic, d.unit, taken),
    classId: d.classId,
    kind: d.kind,
    topicId: d.topic.id,
    title: d.title,
    description: d.description,
    audience: d.audience,
    assignedAt: now.toISOString(),
    dueAt: d.dueAt,
  };
  if (d.kind === 'mock') return { ...base, unitId: d.unit.id, testId: testIdOf(d.unit.id) };
  if (d.kind === 'test') return { ...base, testId: testIdOf(d.topic.id) };
  if (d.kind === 'homework') return { ...base, itemCount: HOMEWORK_EXERCISES };
  return base;
}

const sameStep = (a: SolutionStep | undefined, b: SolutionStep) =>
  a !== undefined && a.text === b.text && a.formula === b.formula;

/**
 * The steps an `ask.answered` event carries: the teacher's whole solution, each changed step
 * marked `edited`, when it differs from the AI's; nothing when she approved the AI's as they are.
 */
export function editedSteps(
  ai: readonly SolutionStep[],
  steps: readonly SolutionStep[],
): SolutionStep[] | undefined {
  const same = ai.length === steps.length && steps.every((s, i) => sameStep(ai[i], s));
  if (same || steps.length === 0) return undefined;
  return steps.map((s, i) => (sameStep(ai[i], s) ? s : { ...s, edited: true }));
}
