import { CAP_INSET, grainPath, hexCellGeometry, hexCorners, lengthOf, pathOf } from './geometry';

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

describe('grainPath', () => {
  it('grows a grain around its centre', () => {
    expect(grainPath(50, 50, 10, 20, 1)).toBe('M50 40L55 45L55 55L50 60L45 55L45 45Z');
    expect(grainPath(50, 50, 10, 20, 2).startsWith('M50 30L')).toBe(true);
  });
});

describe('pathOf', () => {
  it('closes the outline', () => {
    expect(
      pathOf([
        [0, 0],
        [10, 0],
        [5, 8],
      ]),
    ).toBe('M0 0L10 0L5 8Z');
  });
});
