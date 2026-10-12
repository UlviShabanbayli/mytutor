import type {
  LessonAction,
  LessonScenario,
  LessonScript,
  ScenarioElement,
  ScenarioScene,
} from '@mytutor/types';

/** Width of `text` handwritten at `size`, in board units. */
export type Measure = (text: string, size: number) => number;

/** The board area a lesson draws in (1920×1080): the captions run along the bottom. */
export const AREA = { left: 170, right: 1750, top: 110, bottom: 880 };
const CENTER = 960;
const SIZE = { heading: 80, text: 48, math: 64, minMath: 40, label: 44 };
/** Line height, in font sizes, and the space between board elements. */
const LINE = 1.3;
const GAP = 30;
const NUMBER_LINE = { above: 84, below: 84, margin: 50, major: 22, minor: 12, dot: 10 };

/** A board element measured, ready to be drawn from a given top. */
type Laid = { height: number; draw: (top: number) => LessonAction[] };

/** Words into lines no wider than `width`; a word wider than that gets a line of its own. */
function wrap(text: string, size: number, width: number, measure: Measure): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const integerText = (v: number) => (v < 0 ? `-${-v}` : `${v}`);
/** Ids keep to [a-z0-9-]: "-3" becomes "m3", "0.5" becomes "0-5". */
const idPart = (v: number) => `${v < 0 ? 'm' : ''}${Math.abs(v)}`.replace('.', '-');

function layNumberLine(el: Extract<ScenarioElement, { kind: 'numberLine' }>, id: string): Laid {
  const x0 = AREA.left + NUMBER_LINE.margin;
  const x1 = AREA.right - NUMBER_LINE.margin;
  const xOf = (v: number) => x0 + ((v - el.from) / (el.to - el.from)) * (x1 - x0);
  return {
    height: NUMBER_LINE.above + NUMBER_LINE.below,
    draw: (top) => {
      const y = top + NUMBER_LINE.above;
      const actions: LessonAction[] = [
        {
          type: 'line',
          id: `${id}-axis`,
          from: { x: x0 - 30, y },
          to: { x: x1 + 40, y },
          color: 'chalk',
        },
        // Arrow head: the line runs on to the right.
        {
          type: 'line',
          id: `${id}-arrow-a`,
          from: { x: x1 + 18, y: y - 14 },
          to: { x: x1 + 40, y },
          color: 'chalk',
        },
        {
          type: 'line',
          id: `${id}-arrow-b`,
          from: { x: x1 + 18, y: y + 14 },
          to: { x: x1 + 40, y },
          color: 'chalk',
        },
      ];
      const labelled = new Set(el.labels.map((l) => l.at));
      for (let k = Math.ceil(el.from * el.parts); k <= Math.floor(el.to * el.parts); k++) {
        const v = k / el.parts;
        const h = Number.isInteger(v) ? NUMBER_LINE.major : NUMBER_LINE.minor;
        actions.push({
          type: 'line',
          id: `${id}-tick-${idPart(k)}`,
          from: { x: xOf(v), y: y - h },
          to: { x: xOf(v), y: y + h },
          color: 'chalk',
        });
        if (Number.isInteger(v) && !labelled.has(v))
          actions.push({
            type: 'write',
            id: `${id}-n-${idPart(v)}`,
            text: integerText(v),
            at: { x: xOf(v), y: y + NUMBER_LINE.major + SIZE.label + 6 },
            size: SIZE.label,
            color: 'chalk',
            align: 'center',
          });
      }
      el.labels.forEach((l, i) =>
        actions.push({
          type: 'write',
          id: `${id}-label-${i}`,
          text: l.text,
          at: { x: xOf(l.at), y: y + NUMBER_LINE.major + SIZE.label + 6 },
          size: SIZE.label,
          color: 'chalk',
          align: 'center',
        }),
      );
      el.points.forEach((p, i) => {
        actions.push({
          type: 'dot',
          id: `${id}-point-${i}`,
          at: { x: xOf(p.at), y },
          radius: NUMBER_LINE.dot,
          color: p.color,
        });
        if (p.label)
          actions.push({
            type: 'write',
            id: `${id}-point-${i}-label`,
            text: p.label,
            at: { x: xOf(p.at), y: y - NUMBER_LINE.major - 16 },
            size: SIZE.label,
            color: p.color,
            align: 'center',
          });
      });
      return actions;
    },
  };
}

function lay(el: ScenarioElement, id: string, measure: Measure): Laid {
  const width = AREA.right - AREA.left;
  switch (el.kind) {
    case 'heading':
      return {
        height: SIZE.heading * LINE,
        draw: (top) => [
          {
            type: 'write',
            id,
            text: el.text,
            at: { x: CENTER, y: top + SIZE.heading },
            size: SIZE.heading,
            color: 'yellow',
            align: 'center',
          },
        ],
      };
    case 'text': {
      const lines = wrap(el.text, SIZE.text, width, measure);
      return {
        height: lines.length * SIZE.text * LINE,
        draw: (top) =>
          lines.map((text, i) => ({
            type: 'write',
            id: `${id}-${i}`,
            text,
            at: { x: AREA.left, y: top + SIZE.text * (1 + i * LINE) },
            size: SIZE.text,
            color: el.color,
            align: 'left',
          })),
      };
    }
    case 'math': {
      // Mathematics stays on one line: shrink it to fit rather than break it.
      let size = SIZE.math;
      while (size > SIZE.minMath && measure(el.text, size) > width) size -= 4;
      if (measure(el.text, size) > width)
        throw new Error(`"${el.text}" does not fit on one line: split it into two math elements`);
      return {
        height: size * LINE,
        draw: (top) => [
          {
            type: 'write',
            id,
            text: el.text,
            at: { x: AREA.left, y: top + size },
            size,
            color: el.color,
            align: 'left',
          },
        ],
      };
    }
    case 'numberLine':
      return layNumberLine(el, id);
  }
}

const sceneHeight = (laid: Laid[]) => laid.reduce((sum, l) => sum + l.height + GAP, 0) - GAP;

/**
 * Lays a scenario out on the board: elements stack from the top, each scene below the last, and
 * a scene that does not fit starts a clean board. Every position comes from these rules and the
 * scenario's values (a point's place on a number line from its number), never from the scenario.
 */
export function compileScenario(scenario: LessonScenario, measure: Measure): LessonScript {
  let cursor = AREA.top;
  let empty = true;
  const steps = scenario.scenes.map((scene: ScenarioScene) => {
    const laid = scene.board.map((el, j) => lay(el, `${scene.id}-${j}`, measure));
    const height = sceneHeight(laid);
    if (height > AREA.bottom - AREA.top)
      throw new Error(`scene "${scene.id}" does not fit on one board: split it into two scenes`);
    const clear = !empty && (scene.clear || cursor + height > AREA.bottom);
    if (clear) cursor = AREA.top;
    const actions: LessonAction[] = [];
    for (const l of laid) {
      actions.push(...l.draw(cursor));
      cursor += l.height + GAP;
    }
    if (laid.length) empty = false;
    return { id: scene.id, narration: scene.narration, clear, actions };
  });
  return {
    version: 1,
    topic: { number: scenario.topic.number, title: scenario.topic.title },
    source: scenario.source,
    theme: scenario.theme,
    steps,
  };
}
