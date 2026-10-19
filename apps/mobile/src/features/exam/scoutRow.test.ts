import { scoutRow } from './scoutRow';

describe('scoutRow', () => {
  it('puts the weak topics in textbook order and finds the first spot of the report', () => {
    const row = scoutRow([
      { topic: '4.5', state: 'needs_practice' },
      { topic: '2.2', state: 'needs_practice' },
      { topic: '5.5', state: 'lesson_completed' },
    ]);
    expect(row.cells.map((c) => c.label)).toEqual(['2.2', '4.5', '5.5']);
    expect(row.found).toBe(1);
  });

  it('orders 2.10 after 2.9 and keeps at most five cells', () => {
    const topics = ['2.10', '2.9', '1.1', '3.3', '3.1', '6.1'];
    const row = scoutRow(topics.map((topic) => ({ topic, state: 'needs_practice' as const })));
    expect(row.cells.map((c) => c.label)).toEqual(['1.1', '2.9', '2.10', '3.1', '3.3']);
    expect(row.found).toBe(2);
  });

  it('copes with an empty report', () => {
    expect(scoutRow([])).toEqual({ cells: [], found: 0 });
  });
});
