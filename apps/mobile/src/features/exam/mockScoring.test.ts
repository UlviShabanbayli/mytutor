import type { OptionKey } from '@mytutor/types';
import { demoMock } from './demo';
import { DEMO_GROUPS, DEMO_QUESTIONS } from './demoQuestions';
import { countMap, levelOf, mapStatus, scoreMock } from './mockScoring';
import type { MockExam } from './types';

const mock = demoMock('general-3') as MockExam;

describe('demo questions', () => {
  it('has 25 questions with five different options and the key among them', () => {
    expect(DEMO_QUESTIONS).toHaveLength(25);
    for (const q of DEMO_QUESTIONS) {
      const texts = q.options.map((o) => o.text);
      expect(new Set(texts).size).toBe(5);
      expect(q.options.map((o) => o.key)).toEqual(['A', 'B', 'C', 'D', 'E']);
      expect(DEMO_GROUPS.some((g) => g.id === q.groupId)).toBe(true);
    }
  });

  it('covers the five units like the design (5 · 5 · 6 · 5 · 4)', () => {
    const counts = DEMO_GROUPS.map((g) => DEMO_QUESTIONS.filter((q) => q.groupId === g.id).length);
    expect(counts).toEqual([5, 5, 6, 5, 4]);
  });

  it('gives each variant the same questions from a different start', () => {
    const variant = demoMock('variant-2');
    expect(variant?.questions[0]?.id).toBe('dq6');
    expect(variant?.questions).toHaveLength(25);
    expect(demoMock('nope')).toBeNull();
  });
});

describe('scoreMock', () => {
  it('scores right, wrong and empty answers with a breakdown by unit', () => {
    const answers: Record<string, OptionKey> = {};
    mock.questions.slice(0, 18).forEach((q) => (answers[q.id] = q.correctKey));
    // Five wrong answers, two left empty.
    mock.questions.slice(18, 23).forEach((q) => (answers[q.id] = q.correctKey === 'A' ? 'B' : 'A'));
    const score = scoreMock(mock, answers);
    expect(score).toMatchObject({ correct: 18, wrong: 5, empty: 2, total: 25, percent: 72 });
    expect(score.missed).toHaveLength(7);
    expect(score.groups.map((g) => g.level)).toEqual(['good', 'good', 'good', 'weak', 'weak']);
  });

  it('labels levels at 80 and 60 percent', () => {
    expect(levelOf(80)).toBe('good');
    expect(levelOf(79)).toBe('mid');
    expect(levelOf(60)).toBe('mid');
    expect(levelOf(59)).toBe('weak');
  });
});

describe('question map', () => {
  it('shows flagged over answered and counts each status', () => {
    const answers: Record<string, OptionKey> = { dq1: 'B', dq2: 'A' };
    expect(mapStatus('dq1', answers, ['dq1'])).toBe('flagged');
    expect(mapStatus('dq2', answers, [])).toBe('answered');
    expect(mapStatus('dq3', answers, [])).toBe('empty');
    expect(countMap(mock.questions, answers, ['dq1'])).toEqual({
      answered: 1,
      flagged: 1,
      empty: 23,
    });
  });
});
