import { createContext, useContext } from 'react';
import type { MathSvg } from '@mytutor/types';

/** The formulas of the test on screen, by their LaTeX, for MathText to draw. */
export const TestMathContext = createContext<Record<string, MathSvg>>({});

export const useTestMath = () => useContext(TestMathContext);

/** "$a^{2}$ ədədi" → parts of plain text and formulas, in order. */
export function mathParts(text: string): { math: boolean; text: string }[] {
  return text
    .split(/(\$[^$]+\$)/)
    .filter(Boolean)
    .map((part) =>
      part.length > 2 && part.startsWith('$') && part.endsWith('$')
        ? { math: true, text: part.slice(1, -1) }
        : { math: false, text: part },
    );
}

/** What a screen reader says for a text with formulas: the formulas as written. */
export const spokenText = (text: string) => text.replace(/\$([^$]+)\$/g, '$1');
