/** A corner of a cell in points. */
export type Corner = readonly [number, number];

/** Everything a mastery cell needs to draw its five levels in a w×h box. */
export type CellGeometry = {
  w: number;
  h: number;
  /** Pointy-top outline (SVG points). */
  outer: string;
  /** The wax cap of a reinforced cell (SVG points) and its outline length. */
  cap: string;
  capLength: number;
  /** Where the nectar of a half-filled cell starts (small cells fill entirely). */
  nectarTop: number;
  /** ClipPath id; cells of the same shape and size share it. */
  clipId: string;
};

/**
 * Inset of the reinforced cell's cap on every side, as a share of the width (hive.seal: the
 * user asked for a bigger inner hexagon, 0.19·w → 0.12·w).
 */
export const CAP_INSET = 0.12;

/** Pointy-top corners of a w×h hexagon inset by (dx, dy); `corner` is where the sides start. */
export function hexCorners(w: number, h: number, corner = 0.25, dx = 0, dy = dx): Corner[] {
  const ih = h - dy * 2;
  return [
    [w / 2, dy],
    [w - dx, dy + ih * corner],
    [w - dx, dy + ih * (1 - corner)],
    [w / 2, dy + ih],
    [dx, dy + ih * (1 - corner)],
    [dx, dy + ih * corner],
  ];
}

export function pointsOf(corners: readonly Corner[]): string {
  return corners.map(([x, y]) => `${x},${y}`).join(' ');
}

/** Length of a closed outline through the corners. */
export function lengthOf(corners: readonly Corner[]): number {
  return corners.reduce((sum, [x, y], i) => {
    const [nx, ny] = corners[(i + 1) % corners.length] ?? [x, y];
    return sum + Math.hypot(nx - x, ny - y);
  }, 0);
}

type ShapeOptions = { corner: number; nectarTop: number; clipId: string };

export function cellGeometry(w: number, h: number, shape: ShapeOptions): CellGeometry {
  const capCorners = hexCorners(w, h, shape.corner, w * CAP_INSET);
  return {
    w,
    h,
    outer: pointsOf(hexCorners(w, h, shape.corner)),
    cap: pointsOf(capCorners),
    capLength: lengthOf(capCorners),
    nectarTop: shape.nectarTop,
    clipId: shape.clipId,
  };
}

/** A topic cell: height ×1.125 as in the design; cells under 30pt fill with nectar entirely. */
export function hexCellGeometry(size: number): CellGeometry {
  const h = Math.round(size * 1.125);
  return cellGeometry(size, h, {
    corner: 0.25,
    nectarTop: size < 30 ? 0 : h / 2,
    clipId: `hex${size}`,
  });
}

/**
 * Points of a small pointy-top hexagon centred on (cx, cy), `scale` times its w×h size: the
 * crystal grains of hive.crystallize C.
 */
export function grainPoints(cx: number, cy: number, w: number, h: number, scale: number) {
  'worklet';
  const hw = (w * scale) / 2;
  const hh = (h * scale) / 2;
  const q = hh / 2;
  return `${cx},${cy - hh} ${cx + hw},${cy - q} ${cx + hw},${cy + q} ${cx},${cy + hh} ${cx - hw},${cy + q} ${cx - hw},${cy - q}`;
}
