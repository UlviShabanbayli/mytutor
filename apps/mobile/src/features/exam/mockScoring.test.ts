import { buildDemoWorld } from '@mytutor/demo-data';
import type { OptionKey } from '@mytutor/types';
import { countMap, levelOf, mapStatus, scoreMock } from './mockScoring';

const world = buildDemoWorld({ now: new Date('2026-10-20T06:00:00.000Z'), persona: 'nermin' });
const found = world.mocks.find((m) => m.kind === 'scheduled');
if (!found) throw new Error('The demo world has no general mock');
const mock = found;

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
    const answers: Record<string, OptionKey> = { 'mq-1': 'B', 'mq-2': 'A' };
    expect(mapStatus('mq-1', answers, ['mq-1'])).toBe('flagged');
    expect(mapStatus('mq-2', answers, [])).toBe('answered');
    expect(mapStatus('mq-3', answers, [])).toBe('empty');
    expect(countMap(mock.questions, answers, ['mq-1'])).toEqual({
      answered: 1,
      flagged: 1,
      empty: 23,
    });
  });
});
