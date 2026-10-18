import { isWholePhoto, MIN_CROP, moveCrop, resizeCrop } from './crop';

const rect = { x: 0.1, y: 0.2, w: 0.5, h: 0.3 };

describe('moveCrop', () => {
  it('moves the frame and keeps it inside the photo', () => {
    expect(moveCrop(rect, 0.1, 0.1)).toEqual({ ...rect, x: 0.2, y: 0.30000000000000004 });
    expect(moveCrop(rect, 1, -1)).toEqual({ ...rect, x: 0.5, y: 0 });
  });
});

describe('resizeCrop', () => {
  it('moves only the dragged corner', () => {
    const r = resizeCrop(rect, 'br', 0.1, 0.1);
    expect(r.x).toBe(0.1);
    expect(r.y).toBe(0.2);
    expect(r.w).toBeCloseTo(0.6);
    expect(r.h).toBeCloseTo(0.4);
  });

  it('keeps a minimum size and the photo bounds', () => {
    const tiny = resizeCrop(rect, 'tl', 0.9, 0.9);
    expect(tiny.w).toBeCloseTo(MIN_CROP.w);
    expect(tiny.h).toBeCloseTo(MIN_CROP.h);
    const big = resizeCrop(rect, 'tl', -1, -1);
    expect(big.x).toBe(0);
    expect(big.y).toBe(0);
  });
});

describe('isWholePhoto', () => {
  it('is true without a frame or with a full one', () => {
    expect(isWholePhoto(null)).toBe(true);
    expect(isWholePhoto({ x: 0, y: 0, w: 1, h: 1 })).toBe(true);
    expect(isWholePhoto(rect)).toBe(false);
  });
});
