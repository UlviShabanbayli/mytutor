import { getLength } from '@remotion/paths';

/** Straight-line length through the path's coordinates; a lower-bound estimate. */
function polylineLength(d: string): number {
  const nums = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  let total = 0;
  for (let i = 2; i + 1 < nums.length; i += 2) {
    total += Math.hypot(
      (nums[i] ?? 0) - (nums[i - 2] ?? 0),
      (nums[i + 1] ?? 0) - (nums[i - 1] ?? 0),
    );
  }
  return total;
}

/** @remotion/paths' length, or NaN where it gives none or cannot read the path. */
function lengthOf(d: string): number {
  try {
    return getLength(d);
  } catch {
    // Compact glyph data ("M9.5-.6" near the origin) can be more than its parser reads.
    return Number.NaN;
  }
}

/**
 * Path length that is always finite. Some glyph curves make @remotion/paths return NaN or
 * throw; then each subpath is measured on its own, falling back to a polyline estimate.
 */
export function safeLength(d: string): number {
  const whole = lengthOf(d);
  if (Number.isFinite(whole)) return whole;
  return d
    .split(/(?=M)/)
    .filter((sub) => sub.trim() !== '')
    .reduce((sum, sub) => {
      const len = lengthOf(sub);
      return sum + (Number.isFinite(len) ? len : polylineLength(sub));
    }, 0);
}
