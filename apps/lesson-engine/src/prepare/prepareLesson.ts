import type { LessonAction, LessonScript } from '@mytutor/types';
import type { Font } from 'opentype.js';
import { layoutText } from './handwriting';
import { linePath, rectPaths, underlinePath } from './shapes';
import type { Box, PreparedAction, PreparedLesson, StrokePath } from './types';

export const FPS = 30;
/** Speaking-rate estimate used until real TTS durations are available. */
const CHARS_PER_SECOND = 15;
const GAP_SECONDS = 0.35;
const TAIL_SECONDS = 1;
/** Chalk speed in board units per second, and the share of a step drawing may take. */
const DRAW_SPEED = 1100;
/** Drawing spans at least this share of its step so the chalk keeps pace with the voice. */
const MIN_DRAW_SHARE = 0.55;
const MAX_DRAW_SHARE = 0.85;

export function estimateSeconds(narration: string): number {
  return Math.max(1.5, narration.length / CHARS_PER_SECOND);
}

type Resolved =
  | {
      kind: 'stroke';
      id: string;
      color: LessonAction['color'];
      paths: StrokePath[];
      filled: boolean;
      box: Box;
    }
  | { kind: 'hatch'; id: string; color: LessonAction['color']; box: Box };

/** How much "drawing" an action is, to share the step's time fairly. */
const weight = (a: Resolved) =>
  a.kind === 'hatch' ? a.box.width * 0.8 : a.paths.reduce((sum, p) => sum + p.length, 0);

function resolve(action: LessonAction, font: Font, written: Map<string, Box>): Resolved {
  switch (action.type) {
    case 'write': {
      const { paths, box } = layoutText(font, action.text, action.at, action.size, action.align);
      written.set(action.id, box);
      return { kind: 'stroke', id: action.id, color: action.color, paths, filled: true, box };
    }
    case 'line': {
      const path = linePath(action.id, action.from, action.to);
      const box = {
        x: action.from.x,
        y: action.from.y,
        width: action.to.x - action.from.x,
        height: action.to.y - action.from.y,
      };
      return {
        kind: 'stroke',
        id: action.id,
        color: action.color,
        paths: [path],
        filled: false,
        box,
      };
    }
    case 'rect': {
      const box = { x: action.at.x, y: action.at.y, width: action.width, height: action.height };
      return {
        kind: 'stroke',
        id: action.id,
        color: action.color,
        paths: rectPaths(action.id, box),
        filled: false,
        box,
      };
    }
    case 'fill':
      return {
        kind: 'hatch',
        id: action.id,
        color: action.color,
        box: { x: action.at.x, y: action.at.y, width: action.width, height: action.height },
      };
    case 'underline': {
      const target = written.get(action.target);
      if (!target) throw new Error(`underline "${action.id}": unknown target "${action.target}"`);
      return {
        kind: 'stroke',
        id: action.id,
        color: action.color,
        paths: [underlinePath(target)],
        filled: false,
        box: target,
      };
    }
  }
}

/**
 * Turns a lesson script into frame-accurate actions. Each step lasts as long as its narration
 * (`durations` from TTS when available, otherwise an estimate); its drawing is spread over it.
 */
export function prepareLesson(
  script: LessonScript,
  font: Font,
  durations: Record<string, number> = {},
): PreparedLesson {
  const written = new Map<string, Box>();
  const steps: PreparedLesson['steps'] = [];
  const actions: PreparedAction[] = [];
  let cursor = 0;

  for (const step of script.steps) {
    const seconds = durations[step.id] ?? estimateSeconds(step.narration);
    const from = cursor;
    const to = from + Math.round(seconds * FPS);
    steps.push({ id: step.id, narration: step.narration, from, to });

    const resolved = step.actions.map((a) => resolve(a, font, written));
    const total = resolved.reduce((sum, a) => sum + weight(a), 0);
    const stepFrames = to - from;
    const drawFrames = Math.min(
      Math.max((total / DRAW_SPEED) * FPS, stepFrames * MIN_DRAW_SHARE),
      stepFrames * MAX_DRAW_SHARE,
    );
    let at = from + Math.round(0.2 * FPS);
    for (const a of resolved) {
      const frames = Math.max(4, Math.round((weight(a) / Math.max(total, 1)) * drawFrames));
      actions.push({ ...a, from: at, to: at + frames });
      at += frames;
    }
    cursor = to + Math.round(GAP_SECONDS * FPS);
  }

  return {
    fps: FPS,
    durationInFrames: cursor + Math.round(TAIL_SECONDS * FPS),
    theme: script.theme,
    title: `${script.topic.number}. ${script.topic.title}`,
    source: `Mənbə: ${script.source.title}, səh. ${script.source.printedPages.join(', ')}`,
    steps,
    actions,
  };
}
