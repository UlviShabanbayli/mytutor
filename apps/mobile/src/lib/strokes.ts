/**
 * Geometry for lines that draw themselves (micro.check, micro.copy, micro.done, micro.field):
 * react-native-svg has no `pathLength`, so the dash length is computed here.
 */
export type Point = readonly [number, number];

/** Length of an open polyline. */
export function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1] ?? [0, 0];
    const [x1, y1] = points[i] ?? [0, 0];
    total += Math.hypot(x1 - x0, y1 - y0);
  }
  return total;
}

/** The arı check mark on the 24pt icon grid: M5 12.5 l4.5 4.5 L19 7.5. */
export const CHECK_POINTS: readonly Point[] = [
  [5, 12.5],
  [9.5, 17],
  [19, 7.5],
];
export const CHECK_PATH = 'M5 12.5l4.5 4.5L19 7.5';
export const CHECK_LENGTH = polylineLength(CHECK_POINTS);

/** The warning triangle of the icon set: M12 3.5 21.5 20h-19z. */
export const WARNING_TRIANGLE = 'M12 3.5 21.5 20h-19z';
export const WARNING_LENGTH = polylineLength([
  [12, 3.5],
  [21.5, 20],
  [2.5, 20],
  [12, 3.5],
]);

/** Pointy-top hexagon in a w × h box, shrunk by `inset` on every side, as SVG points. */
export function hexPoints(w: number, h: number, inset = 0): string {
  const l = inset;
  const r = w - inset;
  const t = inset;
  const b = h - inset;
  const cx = w / 2;
  const q = (b - t) / 4;
  const pts: Point[] = [
    [cx, t],
    [r, t + q],
    [r, b - q],
    [cx, b],
    [l, b - q],
    [l, t + q],
  ];
  return pts.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}

/** Circumference of a ring of radius r. */
export function circleLength(r: number): number {
  return 2 * Math.PI * r;
}

const round = (n: number) => Math.round(n * 100) / 100;
