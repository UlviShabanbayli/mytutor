import { useTodayStore } from './store';

beforeEach(() => {
  useTodayStore.setState({ lastVisit: null, firstStepTaken: [] });
});

describe('visit', () => {
  it('reports no break on the first visit', () => {
    expect(useTodayStore.getState().visit('2026-10-09')).toBe(0);
    expect(useTodayStore.getState().lastVisit).toBe('2026-10-09');
  });

  it('reports the days since the previous visit', () => {
    useTodayStore.getState().visit('2026-10-09');
    expect(useTodayStore.getState().visit('2026-10-18')).toBe(9);
    expect(useTodayStore.getState().visit('2026-10-18')).toBe(0);
  });
});

describe('takeFirstStep', () => {
  it('remembers the first step per persona, once', () => {
    useTodayStore.getState().takeFirstStep('fresh');
    useTodayStore.getState().takeFirstStep('fresh');
    expect(useTodayStore.getState().firstStepTaken).toEqual(['fresh']);
  });
});
