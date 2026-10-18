import type { CropRect } from './types';

/** Where the frame starts: a wide band in the upper middle, like the camera guide. */
export const DEFAULT_CROP: CropRect = { x: 0.04, y: 0.2, w: 0.92, h: 0.32 };

/** Smallest frame, as fractions of the photo area. */
export const MIN_CROP = { w: 0.2, h: 0.1 };

export type Corner = 'tl' | 'tr' | 'bl' | 'br';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** The frame dragged by (dx, dy) fractions, kept inside the photo area. */
export function moveCrop(start: CropRect, dx: number, dy: number): CropRect {
  return {
    ...start,
    x: clamp(start.x + dx, 0, 1 - start.w),
    y: clamp(start.y + dy, 0, 1 - start.h),
  };
}

/** The frame with one corner dragged by (dx, dy); the opposite corner stays put. */
export function resizeCrop(start: CropRect, corner: Corner, dx: number, dy: number): CropRect {
  let left = start.x;
  let top = start.y;
  let right = start.x + start.w;
  let bottom = start.y + start.h;

  if (corner === 'tl' || corner === 'bl') left = clamp(left + dx, 0, right - MIN_CROP.w);
  else right = clamp(right + dx, left + MIN_CROP.w, 1);
  if (corner === 'tl' || corner === 'tr') top = clamp(top + dy, 0, bottom - MIN_CROP.h);
  else bottom = clamp(bottom + dy, top + MIN_CROP.h, 1);

  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** True when the frame is (almost) the whole photo, i.e. nothing is cut away. */
export function isWholePhoto(crop: CropRect | null): boolean {
  if (!crop) return true;
  return crop.x < 0.01 && crop.y < 0.01 && crop.w > 0.98 && crop.h > 0.98;
}
