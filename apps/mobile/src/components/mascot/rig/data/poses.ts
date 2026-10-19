// Body poses of the Vızı rig, copied number by number from the 13 mood drawings (moodArt.ts) by
// the motion lab (docs/design/motion-lab.html, section "vizi"). All values are in the 200×200
// viewBox of the mascot. Arms and brows are quadratic curves [x0, y0, cx, cy, x1, y1].

/** Left arm, shoulder at (30, 118). */
export const ARM_L = {
  down: [30, 118, 14, 124, 12, 138],
  up: [32, 110, 12, 92, 16, 64],
  hands: [30, 112, 12, 104, 10, 88],
  open: [30, 116, 10, 108, 4, 120],
  hang: [30, 120, 22, 136, 30, 148],
  fly: [30, 118, 14, 112, 10, 98],
} satisfies Record<string, number[]>;

/** Right arm, shoulder at (170, 112). `chin`, `lens` and `hold` are drawn in front of the face. */
export const ARM_R = {
  down: [170, 118, 186, 124, 188, 138],
  wave: [170, 112, 190, 100, 188, 76],
  up: [168, 110, 188, 92, 184, 64],
  hands: [170, 112, 188, 104, 190, 88],
  open: [170, 116, 190, 108, 196, 120],
  hang: [170, 120, 178, 136, 170, 148],
  fly: [170, 112, 190, 100, 192, 86],
  point: [170, 110, 186, 104, 198, 104],
  chin: [172, 120, 150, 142, 120, 136],
  lens: [168, 132, 182, 140, 178, 160],
  hold: [170, 116, 186, 126, 190, 144],
} satisfies Record<string, number[]>;

export type ArmLKey = keyof typeof ARM_L;
export type ArmRKey = keyof typeof ARM_R;

/** Right-arm poses drawn over the face (a hand on the chin, a magnifier, a lens). */
export const FRONT_ARMS: readonly ArmRKey[] = ['chin', 'lens', 'hold'];

/** Antennae: a curve from the head plus the tip [x0, y0, cx, cy, x1, y1, tipX, tipY]. */
export const ANT = {
  normal: { l: [86, 38, 80, 18, 68, 12, 66, 11], r: [114, 38, 120, 18, 132, 12, 134, 11] },
  cheer: { l: [86, 38, 78, 16, 62, 12, 60, 11], r: [114, 38, 122, 16, 138, 12, 140, 11] },
  think: { l: [86, 38, 80, 18, 68, 12, 66, 11], r: [114, 38, 122, 20, 136, 20, 138, 20] },
  explain: { l: [86, 38, 80, 18, 68, 12, 66, 11], r: [114, 38, 118, 22, 126, 16, 128, 14] },
  focus: { l: [86, 38, 82, 18, 76, 10, 75, 9], r: [114, 38, 118, 18, 124, 10, 125, 9] },
  alert: { l: [88, 36, 88, 22, 88, 8, 88, 6], r: [112, 36, 112, 22, 112, 8, 112, 6] },
  soft: { l: [86, 38, 78, 22, 64, 22, 62, 22], r: [114, 38, 122, 22, 136, 22, 138, 22] },
  droop: { l: [86, 38, 70, 26, 62, 40, 62, 44], r: [114, 38, 130, 26, 138, 40, 138, 44] },
  sleepy: { l: [86, 38, 74, 24, 62, 30, 60, 32], r: [114, 38, 126, 24, 138, 30, 140, 32] },
  fly: { l: [86, 38, 84, 18, 76, 8, 76, 7], r: [114, 38, 120, 18, 130, 8, 131, 7] },
} satisfies Record<string, { l: number[]; r: number[] }>;

export type AntKey = keyof typeof ANT;

/** Left wing ellipse [cx, cy, rx, ry, rotation]; the right wing is its mirror. */
export const WING = {
  normal: [44, 76, 28, 20, -35],
  cheer: [40, 70, 30, 20, -50],
  droop: [46, 88, 26, 17, -10],
  sleepy: [46, 84, 26, 17, -20],
  fly: [50, 70, 30, 18, -60],
} satisfies Record<string, number[]>;

export type WingKey = keyof typeof WING;

export function mirrorWing(w: readonly number[]): number[] {
  return [200 - (w[0] ?? 0), w[1] ?? 0, w[2] ?? 0, w[3] ?? 0, -(w[4] ?? 0)];
}

/** Brows [left curve, right curve]. */
export const BROW = {
  think: [
    [56, 58, 74, 54, 92, 60],
    [108, 52, 126, 44, 144, 50],
  ],
  raised: [
    [58, 60, 74, 54, 90, 60],
    [110, 60, 126, 54, 142, 60],
  ],
  up: [
    [54, 52, 72, 44, 90, 50],
    [110, 50, 128, 44, 146, 52],
  ],
  soft: [
    [60, 62, 76, 54, 92, 58],
    [108, 58, 124, 54, 140, 62],
  ],
  scout: [
    [56, 58, 74, 50, 90, 56],
    [110, 60, 126, 54, 142, 60],
  ],
} satisfies Record<string, [number[], number[]]>;

export type BrowKey = keyof typeof BROW;
