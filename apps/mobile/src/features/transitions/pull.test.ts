import { PULL_MAX, PULL_THRESHOLD, pullOffset, pullProgress } from './pull';

describe('pull to refresh', () => {
  it('moves the list half as far as the finger, never up and never past the limit', () => {
    expect(pullOffset(80)).toBe(40);
    expect(pullOffset(-30)).toBe(0);
    expect(pullOffset(1000)).toBe(PULL_MAX);
  });

  it('reaches the threshold after a 112pt drag', () => {
    expect(pullProgress(pullOffset(112))).toBe(1);
    expect(pullProgress(PULL_THRESHOLD / 2)).toBe(0.5);
  });
});
