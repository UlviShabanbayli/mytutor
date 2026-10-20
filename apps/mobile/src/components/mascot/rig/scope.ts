import { Timeline } from './timeline';

/**
 * Everything one behaviour started (timelines, timers, loops), stopped together when the
 * behaviour ends, the screen loses focus or the mascot unmounts (motion lab `scope()`).
 */
export class Scope {
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private timelines = new Set<Timeline>();
  private stops: (() => void)[] = [];
  dead = false;

  after(seconds: number, fn: () => void): void {
    if (this.dead) return;
    const id = setTimeout(
      () => {
        this.timers.delete(id);
        if (!this.dead) fn();
      },
      Math.round(seconds * 1000),
    );
    this.timers.add(id);
  }

  /** Plays a timeline built by `build` and keeps it for `kill`. */
  play(build: (tl: Timeline) => void, loop?: number): Timeline {
    const tl = new Timeline();
    build(tl);
    if (!this.dead) {
      tl.play(loop);
      this.timelines.add(tl);
      // Finished one-shot timelines are forgotten so long idle loops do not pile up.
      if (loop === undefined) this.after(tl.duration + 0.1, () => this.timelines.delete(tl));
    }
    return tl;
  }

  /** Runs `stop` when the scope dies (loops ease back to rest). */
  onKill(stop: () => void): void {
    this.stops.push(stop);
  }

  kill(): void {
    if (this.dead) return;
    this.dead = true;
    for (const id of this.timers) clearTimeout(id);
    this.timers.clear();
    for (const tl of this.timelines) tl.kill();
    this.timelines.clear();
    for (const stop of this.stops) stop();
    this.stops = [];
  }
}
