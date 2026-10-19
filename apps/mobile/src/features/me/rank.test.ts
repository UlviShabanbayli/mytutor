import { rankProgress } from './rank';

const LADDER = [0, 500, 2000, 6000, 15000];

describe('rankProgress', () => {
  it('finds the current rank and what is left for the next one', () => {
    expect(rankProgress(2140, LADDER)).toEqual({
      index: 2,
      target: 6000,
      ratio: 2140 / 6000,
      remaining: 3860,
    });
  });

  it('starts at the first rank', () => {
    expect(rankProgress(0, LADDER)).toMatchObject({ index: 0, target: 500, remaining: 500 });
  });

  it('moves up exactly at a threshold', () => {
    expect(rankProgress(6000, LADDER)).toMatchObject({ index: 3, target: 15000 });
  });

  it('has nothing left at the top rank', () => {
    expect(rankProgress(20000, LADDER)).toEqual({
      index: 4,
      target: null,
      ratio: 1,
      remaining: 0,
    });
  });
});
