import { Fragment, useMemo } from 'react';
import { splitInlineMath } from '@mytutor/schemas';
import { MathText } from './MathText';

type TextWithMathProps = { text: string; className?: string };

/** Prose that may carry LaTeX without delimiters ("Bank -2\frac{1}{4}"): the math is typeset. */
export function TextWithMath({ text, className }: TextWithMathProps) {
  const parts = useMemo(() => splitInlineMath(text), [text]);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.math ? (
          <MathText key={i} latex={part.text} />
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </span>
  );
}
