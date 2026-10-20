import type {
  DemoWorld,
  ExamPlan,
  ExamPlanStep,
  ExamState,
  ExamSubject,
  StudyGoal,
  SubjectReadiness,
} from '@mytutor/types';
import { makeClock } from '../clock';
import { READY_TOPICS, READY_UNITS } from '../curriculum';
import { testIdOf } from '../ids';
import { isFilled, levelOf, readinessPercent, topicsAt } from '../mastery';
import { MOCK_QUESTIONS } from './questions';
import { deadlines, mockList } from './lists';
import { errorsByTopic, weakSpots } from './weakSpots';

/**
 * The exam area follows the student's goal. With the school programme there is nothing to
 * show; choosing an exam derives readiness, the plan, weak spots and mocks from mastery.
 */

/** Demo countdown until the server sends the DİM date. */
const DEMO_DAYS_LEFT = { graduation_9: 142, graduation_11: 156, admission: 184 } as const;

const EXAM_SUBJECTS: Record<string, ExamSubject[]> = {
  graduation_9: ['azLanguage', 'math', 'foreignLanguage'],
  graduation_11: ['azLanguage', 'math', 'foreignLanguage'],
  I: ['math', 'physics', 'chemistry'],
  II: ['math', 'geography', 'history'],
  III: ['azLanguage', 'history', 'literature'],
  IV: ['biology', 'chemistry', 'physics'],
  V: ['azLanguage', 'math', 'foreignLanguage'],
};

export function noExam(goal: StudyGoal): ExamState {
  return {
    goal,
    daysLeft: null,
    readiness: [],
    plan: null,
    weakSpots: null,
    mocks: [],
    runs: [],
    deadlines: [],
  };
}

function plan(world: DemoWorld): ExamPlan {
  const map = world.mastery[world.student.personId] ?? {};
  const saved = new Set(world.activity.savedTopicIds);
  const crystals = topicsAt(map, 'needs_practice');
  const current =
    READY_TOPICS.find((t) => levelOf(map, t.id) === 'lesson_completed') ??
    READY_TOPICS.find((t) => !isFilled(levelOf(map, t.id)));
  const unit = READY_UNITS.find((u) => u.id === current?.unitId);
  const errors = errorsByTopic(world.mockRuns, MOCK_QUESTIONS);
  const unitErrors = (unit?.topics ?? []).reduce((s, t) => s + (errors.get(t.id) ?? 0), 0);
  const steps: Omit<ExamPlanStep, 'state'>[] = [];
  const review = (t: (typeof crystals)[number]): Omit<ExamPlanStep, 'state'> => ({
    id: `exam-review-${t.id}`,
    kind: 'review',
    title: `${t.number} ${t.shortTitle}`,
    minutes: 5,
    saved: saved.has(t.id),
    reason: { kind: 'chainRoot', topic: t.shortTitle },
    target: { kind: 'review' },
  });
  const [firstCrystal, ...otherCrystals] = crystals;
  if (firstCrystal) steps.push(review(firstCrystal));
  if (current) {
    steps.push({
      id: `exam-lesson-${current.id}`,
      kind: 'lesson',
      title: `${current.number} ${current.shortTitle}`,
      minutes: 12,
      saved: saved.has(current.id),
      reason:
        world.mockRuns.length > 0 && unitErrors > 0
          ? { kind: 'mockErrors', mocks: world.mockRuns.length, errors: unitErrors }
          : { kind: 'chainRoot', topic: current.shortTitle },
      target: { kind: 'lesson', id: current.id },
    });
  }
  const unitTest = unit ? world.tests.find((t) => t.test.id === testIdOf(unit.id)) : undefined;
  if (unit && unitTest) {
    const first = unit.topics[0]?.number ?? unit.number;
    const last = unit.topics[unit.topics.length - 1]?.number ?? unit.number;
    steps.push({
      id: `exam-test-${unit.id}`,
      kind: 'test',
      title: unit.title,
      minutes: 15,
      saved: saved.has(current?.id ?? ''),
      reason: {
        kind: 'questions',
        count: unitTest.test.questions.length,
        range: `${first}–${last}`,
      },
      target: { kind: 'test', id: testIdOf(unit.id) },
    });
  }
  steps.push(...otherCrystals.map(review));
  const today: ExamPlanStep[] = steps.map((step, i) => ({
    ...step,
    state: i === 0 ? 'now' : 'next',
  }));
  return {
    updatedAt: world.now,
    // The plan starts today: earlier days have no marks, later ones the planned steps.
    days: [-3, -2, -1, 0, 1, 2, 3].map((offset) => ({
      offset,
      missed: false,
      marks: offset < 0 ? [] : offset === 0 ? today.map(() => 'plan' as const) : ['plan', 'plan'],
    })),
    today,
    moved: null,
  };
}

/** The world with the student's goal set: the exam data follows from mastery. */
export function withExamGoal(world: DemoWorld, goal: StudyGoal): DemoWorld {
  const student = { ...world.student, goal };
  if (goal.kind === 'school') return { ...world, student, exam: noExam(goal) };
  const map = world.mastery[student.personId] ?? {};
  const report = weakSpots(map, world.mockRuns, MOCK_QUESTIONS);
  const subjects = EXAM_SUBJECTS[goal.exam === 'admission' ? (goal.group ?? 'I') : goal.exam] ?? [];
  const readiness: SubjectReadiness[] = subjects.map((subject) =>
    subject === 'math'
      ? { subject, ready: true, percent: readinessPercent(map), weakCount: report.spots.length }
      : { subject, ready: false },
  );
  const next = { ...world, student };
  return {
    ...next,
    exam: {
      goal,
      daysLeft: goal.date
        ? Math.max(0, makeClock(new Date(world.now)).daysUntil(`${goal.date}T00:00:00.000Z`))
        : DEMO_DAYS_LEFT[goal.exam],
      readiness,
      plan: plan(next),
      weakSpots: report,
      mocks: mockList(next, readiness),
      runs: world.mockRuns,
      deadlines: deadlines(next),
    },
  };
}
