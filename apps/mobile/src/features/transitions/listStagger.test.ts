import { rowDelay, textDelay } from './listStagger';

describe('list stagger', () => {
  it('staggers rows 70ms apart up to the sixth', () => {
    expect([0, 1, 2, 5, 9].map(rowDelay)).toEqual([0, 70, 140, 350, 350]);
  });

  it('brings the text in 80ms after its hexagon', () => {
    expect(textDelay(0)).toBe(80);
    expect(textDelay(2)).toBe(220);
  });
});
