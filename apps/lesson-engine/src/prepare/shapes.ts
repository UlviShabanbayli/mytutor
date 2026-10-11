import { safeLength } from './length';
import type { Box, StrokePath } from './types';

/** Small deterministic wobble so lines look hand-drawn, stable across renders. */
function wobble(seed: string, amount: number): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + (ch.codePointAt(0) ?? 0)) | 0;
  return ((h % 1000) / 1000) * amount;
}

const stroke = (d: string): StrokePath => ({ d, length: safeLength(d) });

export function linePath(
  id: string,
  from: { x: number; y: number },
  to: { x: number; y: number },
): StrokePath {
  const mx = (from.x + to.x) / 2 + wobble(`${id}x`, 6);
  const my = (from.y + to.y) / 2 + wobble(`${id}y`, 6);
  return stroke(`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`);
}

/** Rectangle drawn as four hand-drawn sides, clockwise from the top-left corner. */
export function rectPaths(id: string, box: Box): StrokePath[] {
  const { x, y, width: w, height: h } = box;
  return [
    linePath(`${id}-t`, { x, y }, { x: x + w, y }),
    linePath(`${id}-r`, { x: x + w, y }, { x: x + w, y: y + h }),
    linePath(`${id}-b`, { x: x + w, y: y + h }, { x, y: y + h }),
    linePath(`${id}-l`, { x, y: y + h }, { x, y }),
  ];
}

/** A slightly curved underline below a text box. */
export function underlinePath(target: Box): StrokePath {
  const y = target.y + target.height + 18;
  return stroke(
    `M ${target.x - 10} ${y} Q ${target.x + target.width / 2} ${y + 10} ${target.x + target.width + 10} ${y - 4}`,
  );
}
