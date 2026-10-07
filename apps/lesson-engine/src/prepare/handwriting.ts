import { safeLength } from './length';
import type { Font } from 'opentype.js';
import type { Box, StrokePath } from './types';

const SUPERSCRIPT_SCALE = 0.6;
const SUPERSCRIPT_RISE = 0.42;

/** "(a + b)^2" → characters with a superscript flag; `^` applies to the next character. */
export function tokenize(text: string): { char: string; sup: boolean }[] {
  const tokens: { char: string; sup: boolean }[] = [];
  let sup = false;
  for (const char of text) {
    if (char === '^') {
      sup = true;
      continue;
    }
    tokens.push({ char, sup });
    sup = false;
  }
  return tokens;
}

/** Lays out handwritten text as one outline path per glyph, in writing order. */
export function layoutText(
  font: Font,
  text: string,
  at: { x: number; y: number },
  size: number,
  align: 'left' | 'center',
): { paths: StrokePath[]; box: Box } {
  const tokens = tokenize(text);
  const scale = (sup: boolean) => (sup ? size * SUPERSCRIPT_SCALE : size) / font.unitsPerEm;
  const advance = (char: string) => font.charToGlyph(char).advanceWidth ?? 0;
  const width = tokens.reduce((w, t) => w + advance(t.char) * scale(t.sup), 0);

  let x = align === 'center' ? at.x - width / 2 : at.x;
  const paths: StrokePath[] = [];
  let top = Infinity;
  let bottom = -Infinity;
  for (const t of tokens) {
    const glyph = font.charToGlyph(t.char);
    const fontSize = t.sup ? size * SUPERSCRIPT_SCALE : size;
    const baseline = t.sup ? at.y - size * SUPERSCRIPT_RISE : at.y;
    const path = glyph.getPath(x, baseline, fontSize);
    const d = path.toPathData(1);
    if (d) {
      const bb = path.getBoundingBox();
      top = Math.min(top, bb.y1);
      bottom = Math.max(bottom, bb.y2);
      paths.push({ d, length: safeLength(d) });
    }
    x += advance(t.char) * scale(t.sup);
  }

  const left = align === 'center' ? at.x - width / 2 : at.x;
  return { paths, box: { x: left, y: top, width, height: bottom - top } };
}
