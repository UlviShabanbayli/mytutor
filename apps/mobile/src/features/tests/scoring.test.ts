import type { PracticeTest, Question } from '@mytutor/types';
import { isCorrect, rightAnswer } from './answers';
import { countCorrect, percent, scoreTier } from './scoring';
import { answeredToday, useTestSessionStore } from './sessionStore';
import { mathParts, spokenText } from './testMath';

const source = { kind: 'test_bank', title: 'Toplu', section: 'Natural ədədlər', page: 5 } as const;
const choice: Question = {
  id: 'q1',
  topicId: 't1',
  type: 'choice',
  stem: '$2^{3}$ neçədir?',
  options: ['6', '8', '9', '5', '3'].map((text, i) => ({
    key: (['A', 'B', 'C', 'D', 'E'] as const)[i] ?? 'A',
    text,
  })),
  correctKey: 'B',
  answer: null,
  explanation: null,
  figures: [],
  source,
};
const open: Question = {
  ...choice,
  id: 'q2',
  type: 'open',
  stem: 'Ədədi tapın.',
  options: [],
  correctKey: null,
  answer: '2,8',
};
const test: PracticeTest = {
  id: 't1',
  topicId: 't1',
  subjectId: 'riyaziyyat',
  title: 'Natural ədədlər',
  questions: [choice, open],
  math: {},
};

describe('answers', () => {
  it('checks an option by its key and a typed number by its value', () => {
    expect(isCorrect(choice, 'B')).toBe(true);
    expect(isCorrect(choice, 'A')).toBe(false);
    expect(isCorrect(open, '2,8')).toBe(true);
    expect(isCorrect(open, ' 2.80 ')).toBe(true);
    expect(isCorrect(open, '+2,8')).toBe(true);
    expect(isCorrect(open, '28')).toBe(false);
    expect(isCorrect(open, 'iki')).toBe(false);
    expect(isCorrect(open, undefined)).toBe(false);
    expect([rightAnswer(choice), rightAnswer(open)]).toEqual(['B', '2,8']);
  });

  it('splits formulas from words and reads them out as written', () => {
    expect(mathParts('$2^{3}$ neçədir?')).toEqual([
      { math: true, text: '2^{3}' },
      { math: false, text: ' neçədir?' },
    ]);
    expect(spokenText('$x$ + 1')).toBe('x + 1');
  });
});

describe('scoring', () => {
  it('counts right answers of both kinds', () => {
    expect(countCorrect(test, { q1: 'B', q2: '2,8' })).toBe(2);
    expect(countCorrect(test, { q1: 'A', q2: '2,8' })).toBe(1);
  });

  it('maps percentages to tiers', () => {
    expect(percent(4, 5)).toBe(80);
    expect(percent(0, 0)).toBe(0);
    expect(scoreTier(90)).toBe('excellent');
    expect(scoreTier(60)).toBe('good');
    expect(scoreTier(59)).toBe('practice');
  });
});

describe('session store', () => {
  beforeEach(() => useTestSessionStore.setState({ session: null, results: [] }));

  it('locks the answer after checking and records the result on finish', () => {
    const store = useTestSessionStore.getState();
    const q1 = test.questions[0];
    if (!q1?.correctKey) throw new Error('choice question missing');

    store.start(test.id);
    store.select(q1.id, q1.correctKey);
    store.check();
    store.select(q1.id, q1.correctKey === 'A' ? 'B' : 'A');
    expect(useTestSessionStore.getState().session?.answers[q1.id]).toBe(q1.correctKey);

    const result = useTestSessionStore.getState().finish(test);
    expect(result.correct).toBe(1);
    expect(useTestSessionStore.getState().session).toBeNull();
    expect(answeredToday(useTestSessionStore.getState().results)).toBe(1);
  });

  it('resumes an unfinished session for the same test', () => {
    const store = useTestSessionStore.getState();
    store.start(test.id);
    store.next();
    store.start(test.id);
    expect(useTestSessionStore.getState().session?.index).toBe(1);
  });
});
