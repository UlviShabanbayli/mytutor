import type { SessionStep, StudyTest } from '@mytutor/types';
import { READY_UNITS, demoSource, readyTopic } from '../curriculum';
import { R7, r7, r7Unit, testIdOf } from '../ids';
import { personById } from '../people';
import { LALE } from '../ids';
import { QUESTIONS } from './questions';

/** Topic tests "test-<topicId>" for unit 4 and its unit test "test-riyaziyyat-7-u4". */

export const TOPIC_TEST_POINTS = 10;
export const UNIT_TEST_POINTS = 40;

/** Matching and a written solution, so the 4.3 test shows every kind of step. */
const EXTRA_4_3: SessionStep[] = [
  {
    kind: 'match',
    id: 'q-4-3-match',
    prompt: 'Hər düsturu öz açılışı ilə birləşdir.',
    left: ['(a + b)³', '(a − b)³', 'a³ + b³'],
    right: ['a³ − 3a²b + 3ab² − b³', '(a + b)(a² − ab + b²)', 'a³ + 3a²b + 3ab² + b³'],
    pairs: [2, 0, 1],
    source: demoSource(r7('4.3'), 'demo sual'),
  },
  {
    kind: 'written',
    id: 'q-4-3-written',
    prompt: '(x + 1)³ − 3x(x + 1) ifadəsini sadələşdir.',
    source: demoSource(r7('4.3'), 'demo tapşırıq'),
    reviewer: personById(LALE).fullName,
  },
];

function topicTest(number: string): StudyTest {
  const topic = readyTopic(r7(number));
  const questions = QUESTIONS[number] ?? [];
  return {
    test: {
      id: testIdOf(topic.id),
      topicId: topic.id,
      subjectId: R7,
      title: topic.shortTitle,
      questions,
      math: {},
    },
    steps: [
      ...questions.map((q) => ({ kind: 'question' as const, id: q.id, question: q })),
      ...(number === '4.3' ? EXTRA_4_3 : []),
    ],
    kind: 'topic',
    topicCode: topic.number,
    points: TOPIC_TEST_POINTS,
  };
}

function unitTest(unit: string): StudyTest {
  const found = READY_UNITS.find((u) => u.id === r7Unit(unit));
  const questions = (found?.topics ?? []).flatMap((t) => QUESTIONS[t.number] ?? []);
  return {
    test: {
      id: testIdOf(r7Unit(unit)),
      topicId: r7Unit(unit),
      subjectId: R7,
      title: found?.title ?? unit,
      questions,
      math: {},
    },
    steps: questions.map((q) => ({ kind: 'question' as const, id: q.id, question: q })),
    kind: 'unit',
    topicCode: unit,
    points: UNIT_TEST_POINTS,
  };
}

export const TESTS: StudyTest[] = [...Object.keys(QUESTIONS).map(topicTest), unitTest('4')];

export const questionCountOf = (testId: string) =>
  TESTS.find((t) => t.test.id === testId)?.test.questions.length ?? 0;
