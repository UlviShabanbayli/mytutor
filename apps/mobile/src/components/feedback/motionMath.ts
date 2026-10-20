// Pure helpers behind the feedback moments (docs/design/motion.md, "Cavab anları və mükafatlar").
// The ones marked 'worklet' also run on the UI thread inside useAnimatedStyle/useAnimatedProps.

export type Point = { x: number; y: number };

/** A point on the quadratic curve s → e bent towards c, at t (0–1). */
export function quadPoint(s: Point, c: Point, e: Point, t: number): Point {
  'worklet';
  const u = 1 - t;
  return {
    x: u * u * s.x + 2 * u * t * c.x + t * t * e.x,
    y: u * u * s.y + 2 * u * t * c.y + t * t * e.y,
  };
}

/** The control point that makes the quadratic s → e pass through `through` halfway. */
export function controlThrough(s: Point, e: Point, through: Point): Point {
  return { x: 2 * through.x - (s.x + e.x) / 2, y: 2 * through.y - (s.y + e.y) / 2 };
}

/**
 * Splits `total` points over `parts` drops, the bigger shares first: 15 over 8 is
 * 2,2,2,2,2,2,2,1 (feedback.points C), 10 over 8 is 2,2,1,1,1,1,1,1.
 */
export function splitPoints(total: number, parts: number): number[] {
  const n = Math.max(1, Math.floor(parts));
  const whole = Math.max(0, Math.round(total));
  const base = Math.floor(whole / n);
  const extra = whole - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}

/** `n` spots on a circle, the first at 12 o'clock, clockwise (feedback.score C). */
export function ringSpots(n: number, radius: number, centre: Point): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return { x: centre.x + radius * Math.sin(a), y: centre.y - radius * Math.cos(a) };
  });
}

/** The head of a ring's arc that starts at 12 o'clock and has drawn `fraction` (feedback.goal C). */
export function arcHead(fraction: number, centre: Point, radius: number): Point {
  'worklet';
  const a = 2 * Math.PI * fraction;
  return { x: centre.x + radius * Math.sin(a), y: centre.y - radius * Math.cos(a) };
}

/** GSAP's power2.out, used by the lab's count-ups. */
export function easeOutQuad(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) * (1 - c);
}

/** The whole number a count-up shows at progress t (0–1). */
export function countAt(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * easeOutQuad(t));
}

/**
 * Width of each progress cell so `count` cells and their gaps fit `width`, never above `max`
 * (feedback.progress C draws 10 cells of up to 20pt).
 */
export function cellWidth(count: number, width: number, gap: number, max: number): number {
  if (count <= 0 || width <= 0) return max;
  return Math.max(4, Math.min(max, (width - gap * (count - 1)) / count));
}

/**
 * The nectar body with a wavy surface for a box w×h filled to `level` (0–1): a sine of
 * `amplitude` whose crests move with `phase` (0–1 = one wavelength). feedback.lessondone B.
 */
export function wavePath(w: number, h: number, level: number, phase: number, amplitude: number) {
  'worklet';
  const top = h * (1 - level);
  const wavelength = w / 2;
  const step = Math.max(2, w / 24);
  let d = `M0 ${h} L0 ${top}`;
  for (let x = 0; x <= w + step; x += step) {
    const y = top + amplitude * Math.sin(2 * Math.PI * (x / wavelength + phase));
    d += ` L${Math.min(x, w).toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${w} ${h} Z`;
}

/** Pointy-top hexagon points in a w×h box, `inset` from its edges. */
export function hexPoints(w: number, h: number, inset = 0): string {
  const ih = h - 2 * inset;
  return [
    [w / 2, inset],
    [w - inset, inset + ih * 0.25],
    [w - inset, inset + ih * 0.75],
    [w / 2, h - inset],
    [inset, inset + ih * 0.75],
    [inset, inset + ih * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/** Perimeter of `hexPoints(w, h)`, for drawing its outline with a dash offset. */
export function hexPerimeter(w: number, h: number): number {
  const slanted = Math.hypot(w / 2, h / 4);
  return 4 * slanted + 2 * (h / 2);
}
