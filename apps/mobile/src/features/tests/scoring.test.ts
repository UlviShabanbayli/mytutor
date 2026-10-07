import { demoTests } from './demoData';
import { countCorrect, percent, scoreTier } from './scoring';
import { answeredToday, useTestSessionStore } from './sessionStore';

const test = demoTests[0];
if (!test) throw new Error('demo test missing');

describe('scoring', () => {
  it('counts only answers matching the correct key', () => {
    const [q1, q2] = test.questions;
    if (!q1 || !q2) throw new Error('demo questions missing');
    expect(countCorrect(test, { [q1.id]: q1.correctKey, [q2.id]: 'A' })).toBe(
      q2.correctKey === 'A' ? 2 : 1,
    );
  });

  it('maps percentages to tiers', () => {
    expect(percent(4, 5)).toBe(80);
    expect(percent(0, 0)).toBe(0);
    expect(scoreTier(90)).toBe('excellent');
    expect(scoreTier(60)).toBe('good');
    expect(scoreTier(59)).toBe('practice');
  });
});

describe('demo content', () => {
  it('every question cites a source and has five options', () => {
    for (const t of demoTests) {
      for (const q of t.questions) {
        expect(q.options).toHaveLength(5);
        expect(q.options.some((o) => o.key === q.correctKey)).toBe(true);
        expect(q.source.title.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('session store', () => {
  beforeEach(() => useTestSessionStore.setState({ session: null, results: [] }));

  it('locks the answer after checking and records the result on finish', () => {
    const store = useTestSessionStore.getState();
    const q1 = test.questions[0];
    if (!q1) throw new Error('demo question missing');

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
