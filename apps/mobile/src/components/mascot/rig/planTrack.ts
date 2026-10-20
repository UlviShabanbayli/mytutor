import { ease, type Ease } from './ease';

export type Value = number | number[];
/** One tween on one value, in seconds like the motion lab's GSAP timelines. */
export type Segment = { at: number; to: Value; dur: number; ease: Ease; order: number };

/** One step of a Reanimated sequence, in milliseconds. */
export type Step = { delay: number; to: Value; duration: number; ease: Ease };

/**
 * Turns the tweens of one value into back-to-back steps. A tween that starts while the previous
 * one still runs cuts it short (GSAP lets the later tween win). With `period` the steps are
 * padded to that length so the track can repeat in step with the others.
 */
export function planTrack(segments: readonly Segment[], period?: number): Step[] {
  const sorted = [...segments].sort((a, b) => a.at - b.at || a.order - b.order);
  const steps: Step[] = [];
  let cursor = 0;
  sorted.forEach((seg, i) => {
    const next = sorted[i + 1];
    const start = Math.max(seg.at, cursor);
    const dur = next && next.at < start + seg.dur ? Math.max(0, next.at - start) : seg.dur;
    steps.push({
      delay: Math.round((start - cursor) * 1000),
      to: seg.to,
      duration: Math.round(dur * 1000),
      ease: seg.ease,
    });
    cursor = start + dur;
  });
  const last = steps[steps.length - 1];
  if (period !== undefined && last && cursor < period)
    steps.push({
      delay: Math.round((period - cursor) * 1000),
      to: last.to,
      duration: 0,
      ease: ease.none,
    });
  return steps;
}
