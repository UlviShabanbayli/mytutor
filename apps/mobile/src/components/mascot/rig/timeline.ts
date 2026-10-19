import {
  cancelAnimation,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { ease, type Ease } from './ease';
import { planTrack, type Segment, type Value } from './planTrack';

export type { Value } from './planTrack';

type Track = SharedValue<number> | SharedValue<number[]>;

// Which timeline last started each value, so killing an old one never stops a newer one.
const owners = new WeakMap<object, Timeline>();

/**
 * A GSAP-like timeline compiled onto Reanimated: every value gets one sequence of
 * withDelay/withTiming steps that runs on the UI thread; `call`s run as JS timers (state
 * changes, haptics, bubbles). Build with `to`/`set`/`call`, then `play` once.
 */
export class Timeline {
  private tracks = new Map<Track, Segment[]>();
  private calls: { at: number; fn: () => void }[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private order = 0;
  /** The time (s) the last tween or call ends: the length of the timeline. */
  duration = 0;

  to(sv: SharedValue<number>, to: number, at: number, dur: number, curve?: Ease): this;
  to(sv: SharedValue<number[]>, to: number[], at: number, dur: number, curve?: Ease): this;
  to(sv: Track, to: Value, at: number, dur: number, curve: Ease = ease.p2io): this {
    const list = this.tracks.get(sv) ?? [];
    list.push({ at, to, dur, ease: curve, order: this.order++ });
    this.tracks.set(sv, list);
    this.duration = Math.max(this.duration, at + dur);
    return this;
  }

  set(sv: SharedValue<number>, to: number, at: number): this;
  set(sv: SharedValue<number[]>, to: number[], at: number): this;
  set(sv: Track, to: Value, at: number): this {
    return typeof to === 'number'
      ? this.to(sv as SharedValue<number>, to, at, 0)
      : this.to(sv as SharedValue<number[]>, to, at, 0);
  }

  /** A there-and-back tween (GSAP yoyo): `times` legs alternating `to` and `back`. */
  yoyo(
    sv: SharedValue<number>,
    to: number,
    back: number,
    at: number,
    leg: number,
    times: number,
    curve?: Ease,
  ): this {
    for (let i = 0; i < times; i++) this.to(sv, i % 2 === 0 ? to : back, at + i * leg, leg, curve);
    return this;
  }

  call(at: number, fn: () => void): this {
    this.calls.push({ at, fn });
    this.duration = Math.max(this.duration, at);
    return this;
  }

  /** Starts every track now; with `loop` (s) the whole timeline repeats with that period. */
  play(loop?: number): this {
    for (const [sv, segments] of this.tracks) {
      const plan = planTrack(segments, loop);
      // The wait before the first tween wraps the whole sequence: a withDelay as the first step
      // of withSequence shows the sequence's last value while it waits (Reanimated 4.5).
      const lead = plan[0]?.delay ?? 0;
      const steps = plan.map((s, i) => {
        const tween = withTiming(s.to, { duration: s.duration, easing: s.ease });
        return s.delay > 0 && i > 0 ? withDelay(s.delay, tween) : tween;
      });
      if (steps.length === 0) continue;
      const inner = steps.length === 1 ? (steps[0] as Value) : withSequence(...steps);
      const seq = lead > 0 ? withDelay(lead, inner) : inner;
      // The overloads of `to` keep each value's tweens the same type as the value.
      (sv as SharedValue<Value>).value = loop ? withRepeat(seq, -1, false) : seq;
      owners.set(sv, this);
    }
    for (const c of this.calls) this.timers.push(setTimeout(c.fn, Math.round(c.at * 1000)));
    return this;
  }

  /** Stops the values this timeline still owns where they are and drops pending calls. */
  kill(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    for (const sv of this.tracks.keys()) {
      if (owners.get(sv) !== this) continue;
      cancelAnimation(sv as SharedValue<Value>);
      owners.delete(sv);
    }
  }
}
