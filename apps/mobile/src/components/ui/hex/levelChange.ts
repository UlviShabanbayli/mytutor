import type { CellState } from '../HexCell';

/** The approved level changes of a cell (docs/design/motion.md, "Hüceyrələr və pətək"). */
export type CellMotionKind = 'fill' | 'honey' | 'seal' | 'crystal';

/** [start, duration] in ms after the change starts. */
type Span = readonly [number, number];

/**
 * Which approved motion takes a cell from one level to another; null when there is none
 * (no change, or a step back such as crystal → honey, which simply shows the new level).
 */
export function cellMotionKind(from: CellState, to: CellState): CellMotionKind | null {
  if (from === to) return null;
  switch (to) {
    case 'lesson_completed':
      return from === 'not_started' ? 'fill' : null;
    case 'mastered':
      return from === 'not_started' || from === 'lesson_completed' ? 'honey' : null;
    case 'reinforced':
      return from === 'mastered' ? 'seal' : null;
    case 'needs_practice':
      return from === 'mastered' || from === 'reinforced' ? 'crystal' : null;
    default:
      return null;
  }
}

/** How long the label's ink and word cross-fade at `swap`. */
export const SWAP_MS = 220;

/** Grain centres of hive.crystallize C, in % of the cell's width and height. */
export const GRAINS: readonly (readonly [number, number])[] = [
  [18, 64],
  [40, 30],
  [62, 72],
  [74, 40],
  [30, 84],
  [50, 52],
  [84, 60],
];

/**
 * The choreography of each level change, from the motion lab. `swap` is when the label's ink
 * and word change; `end` is when the cell shows its plain new level again.
 */
export const cellTimeline = {
  /** hive.fill-nectar A · Sakit dolma: nectar rises to the half after 500ms. */
  fill: { rise: [500, 900] as Span, swap: 1150, end: 1500 },
  /** hive.nectar-honey C · Bal damcısı: rise to full, turn honey, glow; the chip comes at 1250. */
  honey: {
    rise: [500, 700] as Span,
    colour: [850, 450] as Span,
    glow: [1150, 700] as Span,
    chip: [1250, 1400] as Span,
    swap: 1150,
    end: 1900,
  },
  /** hive.seal C · Kontur çəkilir: the cap is traced, fills, the body darkens. */
  seal: {
    trace: [600, 700] as Span,
    traceOut: [1550, 200] as Span,
    cap: [1300, 260] as Span,
    darken: [1300, 350] as Span,
    swap: 1400,
    /** The light tap when the cap has filled. */
    cue: 1560,
    end: 1800,
  },
  /** hive.crystallize C · Dənəciklər: grains grow, the crystal layer comes under them. */
  crystal: {
    grains: 500,
    grainStep: 110,
    grain: 1300,
    frost: [1500, 600] as Span,
    grainsOut: [2250, 200] as Span,
    facets: [2300, 400] as Span,
    swap: 1900,
    end: 2700,
  },
} as const;
