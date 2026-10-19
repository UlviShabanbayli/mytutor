import type { BrowKey } from './poses';

// Faces of the Vızı rig (motion lab, section "vizi"), in viewBox units.

export type MouthKind = 'line' | 'open' | 'o';

/**
 * Mouths: `line` is a stroked curve, `open` a filled curve with a tongue, `o` an ellipse
 * [cx, cy, rx, ry]. The talk shapes are the visemes used while Vızı speaks.
 */
export const MOUTH = {
  smile: { kind: 'line', shape: [88, 122, 100, 136, 112, 122] },
  hmm: { kind: 'line', shape: [90, 128, 102, 124, 112, 128] },
  flat: { kind: 'line', shape: [92, 128, 100, 128, 108, 128] },
  soft: { kind: 'line', shape: [90, 124, 100, 132, 110, 124] },
  frown: { kind: 'line', shape: [88, 134, 100, 124, 112, 134] },
  grin: { kind: 'line', shape: [92, 122, 104, 134, 116, 120] },
  side: { kind: 'line', shape: [70, 128, 82, 136, 92, 128] },
  wist: { kind: 'line', shape: [91, 130, 100, 127, 109, 130] },
  laugh: {
    kind: 'open',
    shape: [84, 118, 100, 142, 116, 118],
    tongue: [92, 128, 100, 136, 108, 128],
  },
  cheer: {
    kind: 'open',
    shape: [80, 114, 100, 152, 120, 114],
    tongue: [90, 130, 100, 142, 110, 130],
  },
  talk: {
    kind: 'open',
    shape: [88, 122, 100, 138, 112, 122],
    tongue: [94, 129, 100, 133, 106, 129],
  },
  talkS: {
    kind: 'open',
    shape: [90, 123, 100, 131, 110, 123],
    tongue: [96, 127, 100, 129, 104, 127],
  },
  talkW: {
    kind: 'open',
    shape: [86, 121, 100, 143, 114, 121],
    tongue: [93, 131, 100, 138, 107, 131],
  },
  o: { kind: 'o', shape: [100, 132, 9, 11] },
  osm: { kind: 'o', shape: [100, 130, 6, 7] },
  yawn: { kind: 'o', shape: [100, 134, 12, 15] },
} satisfies Record<string, { kind: MouthKind; shape: number[]; tongue?: number[] }>;

export type MouthKey = keyof typeof MOUTH;

/** Visemes picked at random while Vızı talks. */
export const TALK_KEYS: readonly MouthKey[] = [
  'talkS',
  'talk',
  'talkW',
  'talk',
  'smile',
  'talkS',
  'o',
  'talk',
];

/**
 * One face: pupil offsets [lx, ly, rx, ry, scale], upper lids [y, slant] (y −62 open … +24
 * closed), lower lids y (44 hidden … 0 happy squint), brows, mouth, eye scale, cheeks, lashes.
 */
export type Expression = {
  p: readonly [number, number, number, number, number];
  lid: readonly [number, number];
  low: number;
  brow: BrowKey | null;
  m: MouthKey;
  eye: number;
  ch: number;
  lash: number;
};

const EDEF: Expression = {
  p: [0, 0, 0, 0, 1],
  lid: [-62, 0],
  low: 44,
  brow: null,
  m: 'smile',
  eye: 1,
  ch: 1,
  lash: 0,
};

const EXPR = {
  hero: {},
  happy: { p: [-1, -2, 1, -2, 1], low: 2 },
  grin: { p: [0, -1, 0, -1, 1], m: 'grin' },
  sevinc: { p: [-1, -2, 1, -2, 1], low: 0, m: 'laugh' },
  bayram: { p: [-1, -4, 1, -4, 1], low: -4, m: 'cheer' },
  dusunur: { p: [7, -14, 11, -14, 1], brow: 'think', m: 'hmm', ch: 0 },
  up: { p: [0, -10, 0, -10, 1], brow: 'raised', m: 'hmm', ch: 0 },
  izah: { p: [5, -4, 9, -4, 1], brow: 'raised', m: 'talk', ch: 0 },
  fokus: { p: [1, 2, -1, 2, 1], lid: [-16, 13.6], m: 'flat', ch: 0 },
  down: { p: [3, 9, 3, 9, 1], lid: [-24, 0], m: 'flat', ch: 0 },
  teeccub: { p: [-5, -4, 5, -4, 0.62], eye: 1.12, brow: 'up', m: 'o', ch: 0 },
  teselli: { p: [-1, 2, 1, 2, 1], lid: [-19, -12], brow: 'soft', m: 'soft' },
  darixdim: { p: [-3, 6, 3, 6, 1], lid: [-14, -15], m: 'frown', ch: 0 },
  wist: { p: [-3, 5, 3, 5, 1], lid: [-16, -13], m: 'wist', ch: 0 },
  yuxulu: { p: [-1, 8, 1, 8, 0.92], lid: [1, 0], m: 'osm', ch: 0 },
  yatir: { p: [-1, 8, 1, 8, 0.92], lid: [24, 0], lash: 1, m: 'osm', ch: 0 },
  ucur: { p: [5, -6, 11, -6, 1], m: 'grin' },
  kesfiyyat: { p: [1, 0, 1, 0, 1], brow: 'scout', m: 'side', ch: 0 },
} satisfies Record<string, Partial<Expression>>;

export type ExprKey = keyof typeof EXPR;

export function expression(name: ExprKey): Expression {
  return { ...EDEF, ...(EXPR[name] as Partial<Expression>) };
}
