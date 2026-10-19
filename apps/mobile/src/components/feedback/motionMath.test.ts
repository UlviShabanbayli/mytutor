import {
  arcHead,
  cellWidth,
  controlThrough,
  countAt,
  hexPerimeter,
  quadPoint,
  ringSpots,
  splitPoints,
  wavePath,
} from './motionMath';

describe('feedback motion math', () => {
  it('bends a curve through the point it is asked to pass halfway', () => {
    const s = { x: -70, y: 100 };
    const e = { x: 300, y: 30 };
    const through = { x: 140, y: 20 };
    const c = controlThrough(s, e, through);
    const mid = quadPoint(s, c, e, 0.5);
    expect(mid.x).toBeCloseTo(through.x);
    expect(mid.y).toBeCloseTo(through.y);
    expect(quadPoint(s, c, e, 0)).toEqual(s);
    expect(quadPoint(s, c, e, 1)).toEqual(e);
  });

  it('splits points over drops with the bigger shares first', () => {
    expect(splitPoints(15, 8)).toEqual([2, 2, 2, 2, 2, 2, 2, 1]);
    expect(splitPoints(10, 8)).toEqual([2, 2, 1, 1, 1, 1, 1, 1]);
    expect(splitPoints(5, 8)).toEqual([1, 1, 1, 1, 1, 0, 0, 0]);
    expect(splitPoints(10, 8).reduce((a, b) => a + b, 0)).toBe(10);
  });

  it('places ring cells clockwise from 12 o’clock', () => {
    const spots = ringSpots(4, 10, { x: 50, y: 50 });
    expect(spots[0]?.x).toBeCloseTo(50);
    expect(spots[0]?.y).toBeCloseTo(40);
    expect(spots[1]?.x).toBeCloseTo(60);
    expect(spots[1]?.y).toBeCloseTo(50);
    expect(spots[2]?.y).toBeCloseTo(60);
  });

  it('finds the head of a goal arc', () => {
    const top = arcHead(0, { x: 60, y: 60 }, 50);
    const right = arcHead(0.25, { x: 60, y: 60 }, 50);
    expect(top.x).toBeCloseTo(60);
    expect(top.y).toBeCloseTo(10);
    expect(right.x).toBeCloseTo(110);
    expect(right.y).toBeCloseTo(60);
  });

  it('counts up with an ease-out and lands on the target', () => {
    expect(countAt(0, 80, 0)).toBe(0);
    expect(countAt(0, 80, 0.5)).toBe(60);
    expect(countAt(0, 80, 1)).toBe(80);
    expect(countAt(15, 20, 2)).toBe(20);
  });

  it('fits progress cells to the width, never wider than the design', () => {
    expect(cellWidth(10, 260, 3, 20)).toBe(20);
    expect(cellWidth(25, 260, 3, 20)).toBeCloseTo((260 - 72) / 25);
    expect(cellWidth(10, 0, 3, 20)).toBe(20);
  });

  it('draws a closed nectar body at the asked level', () => {
    const d = wavePath(80, 90, 0.5, 0, 0);
    expect(d.startsWith('M0 90 L0 45')).toBe(true);
    expect(d.endsWith('L80 90 Z')).toBe(true);
  });

  it('measures a hexagon outline', () => {
    // Four slanted sides of hypot(50, 28) and two vertical sides of 56.
    expect(hexPerimeter(100, 112)).toBeCloseTo(4 * Math.hypot(50, 28) + 112);
  });
});
