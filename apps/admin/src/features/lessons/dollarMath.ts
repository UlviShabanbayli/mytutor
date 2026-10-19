import type { InlinePart } from '@mytutor/schemas';

/**
 * Lesson text carries its mathematics between single dollar signs ("bank $-2\frac{1}{4}$
 * nöqtəsində"): split it into prose and math runs. A lone "$" stays prose.
 */
export function dollarMath(text: string): InlinePart[] {
  return text
    .split(/(\$[^$]+\$)/)
    .filter((part) => part !== '')
    .map((part) =>
      part.length > 2 && part.startsWith('$') && part.endsWith('$')
        ? { math: true, text: part.slice(1, -1) }
        : { math: false, text: part },
    );
}
