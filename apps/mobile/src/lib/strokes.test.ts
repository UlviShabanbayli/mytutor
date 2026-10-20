import { CHECK_LENGTH, circleLength, hexPoints, polylineLength, WARNING_LENGTH } from './strokes';

describe('polylineLength', () => {
  it('adds the segments', () => {
    expect(
      polylineLength([
        [0, 0],
        [3, 4],
        [3, 10],
      ]),
    ).toBe(11);
    expect(polylineLength([[1, 1]])).toBe(0);
  });

  it('knows the icon strokes', () => {
    expect(CHECK_LENGTH).toBeCloseTo(19.8, 1);
    expect(WARNING_LENGTH).toBeCloseTo(57.08, 1);
  });
});

describe('hexPoints', () => {
  it('draws a pointy-top hexagon in its box', () => {
    expect(hexPoints(28, 32)).toBe('14,0 28,8 28,24 14,32 0,24 0,8');
  });

  it('shrinks by the inset on every side', () => {
    expect(hexPoints(28, 32, 2)).toBe('14,2 26,9 26,23 14,30 2,23 2,9');
  });
});

describe('circleLength', () => {
  it('is 2πr', () => {
    expect(circleLength(31)).toBeCloseTo(194.78, 2);
  });
});
