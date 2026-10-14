import { CheckCircle2, TriangleAlert } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { Answer } from '@mytutor/types';
import { MathText, TextWithMath } from '@/components/ui';

/** The book's answer to an exercise, from its answer key, with the page it is printed on. */
export function BookAnswer({ answers }: { answers: Answer[] }) {
  const { t } = useTranslation();
  const checked = answers.every((a) => a.status === 'verified');
  const page = answers[0]?.sourcePrintedPage ?? answers[0]?.sourcePage ?? '';
  return (
    <div className="flex flex-col gap-1 rounded-md bg-success-muted px-3 py-2 text-sm text-foreground">
      <p className="flex flex-wrap items-center gap-1.5 font-sans-bold text-success">
        <CheckCircle2 className="size-4" aria-hidden />
        {t('lessons.bookAnswer', { page })}
        {checked ? null : (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2 py-0.5 text-xs text-foreground">
            <TriangleAlert className="size-3" aria-hidden />
            {t('lessons.answerUnchecked')}
          </span>
        )}
      </p>
      <p className="flex flex-wrap items-baseline gap-x-1">
        {answers
          .flatMap((a) => a.parts)
          .map((part, i) => (
            <Fragment key={i}>
              {i > 0 ? '; ' : null}
              {part.label ? <span className="font-sans-bold">{part.label})</span> : null}
              {part.latex ? <MathText latex={part.latex} /> : <TextWithMath text={part.text} />}
            </Fragment>
          ))}
      </p>
    </div>
  );
}
