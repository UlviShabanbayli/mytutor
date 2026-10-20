import { groupByDay } from './chat';
import type { ThreadMessage } from './types';

const message = (id: string, at: Date): ThreadMessage => ({
  id,
  from: 'teacher',
  text: id,
  at: at.toISOString(),
  status: 'read',
  reported: false,
});

describe('groupByDay', () => {
  it('orders messages and starts a group on each new calendar day', () => {
    const groups = groupByDay([
      message('c', new Date(2026, 9, 18, 10, 30)),
      message('a', new Date(2026, 9, 17, 23, 50)),
      message('b', new Date(2026, 9, 18, 0, 5)),
    ]);
    expect(groups.map((g) => g.messages.map((m) => m.id))).toEqual([['a'], ['b', 'c']]);
  });
});
