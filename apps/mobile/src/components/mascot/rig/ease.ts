/**
 * The motion lab drives Vızı with GSAP eases; these are the same curves as Reanimated easing
 * worklets, so a lab timing like `0.55s power2.inOut` ports as `0.55, ease.p2io`.
 * power1 = quad, power2 = cubic, power3 = quart (GSAP naming).
 */
export type Ease = (t: number) => number;

function powIn(n: number): Ease {
  return (t) => {
    'worklet';
    return Math.pow(t, n);
  };
}

function powOut(n: number): Ease {
  return (t) => {
    'worklet';
    return 1 - Math.pow(1 - t, n);
  };
}

function powInOut(n: number): Ease {
  return (t) => {
    'worklet';
    return t < 0.5 ? Math.pow(t * 2, n) / 2 : 1 - Math.pow((1 - t) * 2, n) / 2;
  };
}

/** GSAP back.out(k): overshoots by k and settles. */
export function backOut(k = 1.70158): Ease {
  return (t) => {
    'worklet';
    const p = t - 1;
    return p * p * ((k + 1) * p + k) + 1;
  };
}

/** GSAP back.in(k): pulls back before leaving. */
export function backIn(k = 1.70158): Ease {
  return (t) => {
    'worklet';
    return t * t * ((k + 1) * t - k);
  };
}

/** GSAP elastic.out(amplitude, period). */
export function elasticOut(amplitude = 1, period = 0.3): Ease {
  const a = amplitude >= 1 ? amplitude : 1;
  const p = period / (amplitude < 1 ? amplitude : 1);
  const shift = (p / (2 * Math.PI)) * Math.asin(1 / a);
  const w = (2 * Math.PI) / p;
  return (t) => {
    'worklet';
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return a * Math.pow(2, -10 * t) * Math.sin((t - shift) * w) + 1;
  };
}

const none: Ease = (t) => {
  'worklet';
  return t;
};

const sineIn: Ease = (t) => {
  'worklet';
  return 1 - Math.cos((t * Math.PI) / 2);
};

const sineOut: Ease = (t) => {
  'worklet';
  return Math.sin((t * Math.PI) / 2);
};

const sineIO: Ease = (t) => {
  'worklet';
  return -(Math.cos(Math.PI * t) - 1) / 2;
};

export const ease = {
  none,
  p1in: powIn(2),
  p1out: powOut(2),
  p1io: powInOut(2),
  p2in: powIn(3),
  p2out: powOut(3),
  p2io: powInOut(3),
  p3out: powOut(4),
  sineIn,
  sineOut,
  sineIO,
  /** back.out(2.2): bubbles, antennae landing in a pose. */
  back22: backOut(2.2),
  back2: backOut(2),
  back3: backOut(3),
  /** elastic.out(1.1, 0.3): antenna boing. */
  boing: elasticOut(1.1, 0.3),
  /** elastic.out(1, 0.45): landing after a hop. */
  land: elasticOut(1, 0.45),
  /** elastic.out(1, 0.5): settling after a flight. */
  settle: elasticOut(1, 0.5),
} as const;
