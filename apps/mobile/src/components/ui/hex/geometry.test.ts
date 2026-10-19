import { CAP_INSET, grainPoints, hexCellGeometry, hexCorners, lengthOf } from './geometry';

describe('hexCellGeometry', () => {
  it('insets the reinforced cap by 0.12 of the width (hive.seal)', () => {
    const geo = hexCellGeometry(100);
    expect(CAP_INSET).toBe(0.12);
    expect(geo.h).toBe(113);
    expect(geo.cap.split(' ')[0]).toBe('50,12');
    expect(geo.cap.split(' ')[1]).toBe(`88,${12 + (113 - 24) * 0.25}`);
  });

  it('fills small cells with nectar entirely, larger ones half-way', () => {
    expect(hexCellGeometry(22).nectarTop).toBe(0);
    expect(hexCellGeometry(64).nectarTop).toBe(36);
  });
});

describe('lengthOf', () => {
  it('measures the closed outline', () => {
    const square = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ] as const;
    expect(lengthOf(square)).toBe(40);
    expect(lengthOf(hexCorners(40, 46))).toBeGreaterThan(0);
  });
});

describe('grainPoints', () => {
  it('grows a grain around its centre', () => {
    expect(grainPoints(50, 50, 10, 20, 1)).toBe('50,40 55,45 55,55 50,60 45,55 45,45');
    expect(grainPoints(50, 50, 10, 20, 2).split(' ')[0]).toBe('50,30');
  });
});
