import { answerDemo } from '@mytutor/demo-data';
import { studyTestSchema } from '@mytutor/schemas';
import type { PracticeTest, TestResult } from '@mytutor/types';
import { prettyExpression, sameExpression } from './expression';
import { stepIndexOf } from './lessons';
import {
  decodeMatch,
  emptyMatch,
  encodeMatch,
  isMatchCorrect,
  pairNumber,
  pick,
  type MatchState,
} from './matching';
import { buildMistakesTest, collectMistakes, groupMistakes, mergeMistakes } from './mistakes';
import { applyNumericKey, displayNumber, sanitizeNumeric } from './numericInput';
import { reviewTimeline } from './review';
import { isAnswered, scoreSteps, stepVerdict, writtenAnswer } from './steps';
import { formatClock, isThisWeek } from './time';
import type { MatchStep, StudyTest } from './types';

const NOW = new Date('2026-10-20T06:00:00.000Z');

/** The demo world's 4.3 topic test: three questions, a matching step and a written one. */
const cubeTest: StudyTest = studyTestSchema.parse(
  answerDemo('/v1/tests/test-riyaziyyat-7-4-3', { persona: 'nermin', now: NOW }).body,
);
const matchStep = cubeTest.steps.find((s): s is MatchStep => s.kind === 'match');
if (!matchStep) throw new Error('the 4.3 test has no matching step');

describe('lessons', () => {
  const all = ['video', 'text', 'example', 'exercise'] as const;

  it('reads the step parameter as a number, a topic step or a lesson step', () => {
    expect([stepIndexOf('3', [...all]), stepIndexOf(undefined, [...all])]).toEqual([2, 0]);
    expect([stepIndexOf('9', [...all]), stepIndexOf('x', [...all])]).toEqual([0, 0]);
    expect([stepIndexOf('examples', [...all]), stepIndexOf('practice', [...all])]).toEqual([2, 3]);
    expect(stepIndexOf('text', ['text'])).toBe(0);
    expect(stepIndexOf('practice', ['text'])).toBe(0);
  });
});

describe('sameExpression', () => {
  const book = 'a³ + 9a²b + 27ab² + 27b³';

  it('accepts the same terms in any order and spelling', () => {
    expect(sameExpression(book, book)).toBe(true);
    expect(sameExpression('27b^3 + a^3 + 9ba² + 27ab*b', book)).toBe(true);
    expect(sameExpression('4a² - 4ab + b²', '4a² − 4ab + b²')).toBe(true);
  });

  it('rejects a different answer', () => {
    expect(sameExpression('a³ + 27b³', book)).toBe(false);
    expect(sameExpression('a³ + 9a²b + 27ab² − 27b³', book)).toBe(false);
    expect(sameExpression('', book)).toBe(false);
    expect(sameExpression('(a − 3)(a + 3)', '(a + 3)(a − 3)')).toBe(false);
  });

  it('keeps brackets around powers and shows what was typed as printed', () => {
    expect(sameExpression('(a+b)(a^2-ab+b^(2))', '(a + b)(a² − ab + b²)')).toBe(true);
    expect(prettyExpression('a^3 - 3a^(2)b')).toBe('a³ − 3a²b');
  });
});

describe('numeric keypad', () => {
  it('builds a number key by key', () => {
    const typed = ['3', ',', '5', '-'].reduce(
      (v, k) => applyNumericKey(v, k as Parameters<typeof applyNumericKey>[1]),
      '',
    );
    expect(typed).toBe('-3,5');
    expect(applyNumericKey('-3,5', ',')).toBe('-3,5');
    expect(applyNumericKey('', ',')).toBe('0,');
    expect(displayNumber('-3,5')).toBe('−3,5');
    expect(sanitizeNumeric(' −12.5x')).toBe('-12,5');
  });
});

describe('matching', () => {
  it('pairs, re-picks and splits pairs', () => {
    let state: MatchState = emptyMatch(3);
    state = pick(state, 'left', 0);
    expect(state.picked).toEqual({ side: 'left', index: 0 });
    state = pick(state, 'right', 2);
    expect(state.pairs).toEqual([2, null, null]);
    state = pick(pick(state, 'right', 0), 'left', 1);
    expect(state.pairs).toEqual([2, 0, null]);
    expect(pairNumber(state.pairs, 1)).toBe(2);
    state = pick(state, 'right', 2);
    expect(state.pairs).toEqual([null, 0, null]);
    expect(pairNumber(state.pairs, 1)).toBe(1);
  });

  it('stores pairs as text and checks them', () => {
    expect(decodeMatch(encodeMatch([2, null, 1]), 3)).toEqual([2, null, 1]);
    expect(isMatchCorrect(matchStep, '2,0,1')).toBe(true);
    expect(isMatchCorrect(matchStep, '0,2,1')).toBe(false);
  });
});

describe('session steps', () => {
  it('checks every kind and scores only what the app can check', () => {
    const [q1, , q3] = cubeTest.steps;
    if (!q1 || !q3) throw new Error('4.3 steps missing');
    expect(stepVerdict(q1, 'C')).toBe('correct');
    expect(stepVerdict(q3, '28')).toBe('correct');
    expect(isAnswered(matchStep, '2,0,')).toBe(false);
    const answers = { 'q-4-3-1': 'C', 'q-4-3-2': 'A', 'q-4-3-3': '28', 'q-4-3-match': '2,0,1' };
    expect(scoreSteps(cubeTest.steps, { ...answers, 'q-4-3-written': writtenAnswer(1) })).toEqual({
      correct: 3,
      scored: 4,
      pending: 1,
    });
  });
});

describe('mistakes', () => {
  const test: PracticeTest = cubeTest.test;
  const result = (answers: Record<string, string>, finishedAt: string): TestResult => ({
    testId: test.id,
    subjectId: test.subjectId,
    title: test.title,
    correct: 0,
    total: 3,
    answers,
    finishedAt,
  });

  it('keeps questions whose latest answer is wrong', () => {
    const older = result(
      { 'q-4-3-1': 'A', 'q-4-3-2': 'A', 'q-4-3-3': '28' },
      '2026-10-17T10:00:00Z',
    );
    const newer = result({ 'q-4-3-2': 'B' }, '2026-10-18T10:00:00Z');
    const entries = collectMistakes([newer, older], { [test.id]: test });
    expect(entries.map((e) => e.question.id)).toEqual(['q-4-3-1']);
    const [group] = groupMistakes(entries);
    expect(group?.items[0]?.yours).toBe('A · x³ + 8');
    expect(group?.items[0]?.right).toBe('C · x³ + 6x² + 12x + 8');
    expect(buildMistakesTest(entries, 'Səhvlərim')?.questions).toHaveLength(1);
    expect(buildMistakesTest([], 'Səhvlərim')).toBeNull();
  });

  it("puts the device's mistakes into the world's group of the same topic", () => {
    const world = answerDemo('/v1/mistakes', { persona: 'nermin', now: NOW }).body as Parameters<
      typeof mergeMistakes
    >[1];
    const entries = collectMistakes([result({ 'q-4-3-1': 'A' }, NOW.toISOString())], {
      [test.id]: test,
    });
    const merged = mergeMistakes(groupMistakes(entries), world);
    const cube = merged.filter((g) => g.topicId === 'riyaziyyat-7-4-3');
    expect(cube).toHaveLength(1);
    expect(cube[0]?.items[0]?.id).toBe('q-4-3-1');
    expect(merged).toHaveLength(world.length);
  });
});

describe('review and time', () => {
  it('counts each review from the one before it', () => {
    const dots = reviewTimeline(new Date(2026, 9, 14), [2, 7, 21], 1);
    expect(dots.map((d) => [d.date.getDate(), d.state])).toEqual([
      [16, 'done'],
      [23, 'next'],
      [13, 'later'],
    ]);
  });

  it('formats clocks and weeks', () => {
    expect(formatClock(134)).toBe('2:14');
    expect(formatClock(400)).toBe('6:40');
    const sunday = new Date(2026, 9, 18, 12);
    expect(isThisWeek(new Date(2026, 9, 12, 9).toISOString(), sunday)).toBe(true);
    expect(isThisWeek(new Date(2026, 9, 11, 9).toISOString(), sunday)).toBe(false);
  });
});
