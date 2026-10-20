import { rankProgress } from './rank';

describe('rankProgress', () => {
  it('places the rank on the ladder with what is left for the next one', () => {
    expect(rankProgress('worker', 2140, { minPoints: 6000 })).toEqual({
      index: 2,
      target: 6000,
      ratio: 2140 / 6000,
      remaining: 3860,
    });
  });

  it('starts at the first rank', () => {
    expect(rankProgress('larva', 0, { minPoints: 500 })).toMatchObject({
      index: 0,
      target: 500,
      remaining: 500,
    });
  });

  it('has nothing left at the top rank', () => {
    expect(rankProgress('hiveMaster', 20000, null)).toEqual({
      index: 4,
      target: null,
      ratio: 1,
      remaining: 0,
    });
  });
});
