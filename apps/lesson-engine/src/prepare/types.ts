import type { LessonColor } from '@mytutor/types';

export type Box = { x: number; y: number; width: number; height: number };

/** One drawable stroke path with its precomputed length (board units). */
export type StrokePath = { d: string; length: number };

/** A drawing action resolved to frames, ready for the video to animate. */
export type PreparedAction =
  | {
      kind: 'stroke';
      id: string;
      color: LessonColor;
      paths: StrokePath[];
      /** Text glyphs are outlined first, then filled in. */
      filled: boolean;
      box: Box;
      from: number;
      to: number;
    }
  | { kind: 'hatch'; id: string; color: LessonColor; box: Box; from: number; to: number };

export type PreparedStep = { id: string; narration: string; from: number; to: number };

/** Everything the Remotion composition needs; serializable as input props. */
export type PreparedLesson = {
  fps: number;
  durationInFrames: number;
  theme: 'blackboard' | 'whiteboard';
  title: string;
  source: string;
  steps: PreparedStep[];
  actions: PreparedAction[];
};
