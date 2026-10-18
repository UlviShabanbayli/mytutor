import { useTodayStore } from './store';

beforeEach(() => {
  useTodayStore.setState({ firstDay: null, lastVisit: null, firstStepTaken: false, readIds: [] });
});

describe('visit', () => {
  it('remembers the first day and reports no break on the first visit', () => {
    expect(useTodayStore.getState().visit('2026-10-09')).toBe(0);
    expect(useTodayStore.getState()).toMatchObject({
      firstDay: '2026-10-09',
      lastVisit: '2026-10-09',
    });
  });

  it('reports the days since the previous visit and keeps the first day', () => {
    useTodayStore.getState().visit('2026-10-09');
    expect(useTodayStore.getState().visit('2026-10-18')).toBe(9);
    expect(useTodayStore.getState().visit('2026-10-18')).toBe(0);
    expect(useTodayStore.getState().firstDay).toBe('2026-10-09');
  });
});

describe('markRead', () => {
  it('adds ids once', () => {
    useTodayStore.getState().markRead(['a', 'b']);
    useTodayStore.getState().markRead(['b', 'c']);
    expect(useTodayStore.getState().readIds).toEqual(['a', 'b', 'c']);
  });
});
