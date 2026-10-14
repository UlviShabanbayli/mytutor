import { Fragment } from 'react';
import { MathText } from '@/components/ui';
import { dollarMath } from '@/features/lessons/dollarMath';

/** Text with its mathematics between single dollar signs, typeset. */
export function MathLine({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {dollarMath(text).map((part, i) =>
        part.math ? (
          <MathText key={i} latex={part.text} />
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </span>
  );
}
