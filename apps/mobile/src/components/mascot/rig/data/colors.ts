/**
 * The mascot's own colours, the same as in the mood drawings (moodArt.ts). They do not change
 * with the colour scheme: Vızı carries its own light. Theme colours (shadow, speed lines, cells)
 * come from `useThemeColors()` in the parts that draw them.
 */
export const VIZI = {
  wing: '#BFE3FF',
  wingHi: '#E6F4FF',
  wingGhost: '#DCEFFF',
  ink: '#4A2C12',
  body: '#FFC929',
  shade: '#F2A900',
  hi: '#FFE27A',
  white: '#FFFFFF',
  pupil: '#2B1B0E',
  cheek: '#FF9A6B',
  tongue: '#FF7A6B',
  stick: '#8A5D00',
  lens: '#2C63C6',
} as const;

/** The body outline (also the clip of its shading and stripes). */
export const BODY_PATH =
  'M100 32 C152 32 174 72 174 114 C174 158 142 184 100 184 C58 184 26 158 26 114 C26 72 48 32 100 32 Z';
