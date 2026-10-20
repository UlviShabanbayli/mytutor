import { armHandoff, useHandoffStore } from './handoffStore';

const rect = { x: 300, y: 60, width: 24, height: 27 };

describe('handoff store', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useHandoffStore.setState({ source: null, flight: null, target: null, landed: true });
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('does nothing without a source cell', () => {
    armHandoff();
    expect(useHandoffStore.getState().flight).toBeNull();
  });

  it('arms a flight from the header cell and lands it', () => {
    useHandoffStore.getState().setSource('4.3', rect);
    armHandoff();
    expect(useHandoffStore.getState()).toMatchObject({
      flight: { code: '4.3', from: rect },
      landed: false,
    });
    useHandoffStore.getState().land();
    expect(useHandoffStore.getState()).toMatchObject({ flight: null, landed: true });
  });

  it('gives up when the result never shows its cell', () => {
    useHandoffStore.getState().setSource('4.3', rect);
    armHandoff();
    jest.advanceTimersByTime(3000);
    expect(useHandoffStore.getState().landed).toBe(true);
  });
});
