import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { LessonText } from '@mytutor/types';
import { MathText } from '@/components/ui';
import { dollarMath } from '@/features/lessons/dollarMath';
import { pageList } from '@/features/lessons/material';

type LessonTextBodyProps = {
  text: LessonText;
  /** Printed pages of the knowledge items a paragraph cites. */
  pagesOf: (itemIds: string[]) => number[];
};

/** The lesson text: headed sections, each paragraph with the book pages it comes from. */
export function LessonTextBody({ text, pagesOf }: LessonTextBodyProps) {
  const { t } = useTranslation();
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {text.sections.map((section, s) => (
        <section key={s} className="flex flex-col gap-2">
          {section.heading ? (
            <h3 className="font-sans-black text-lg text-foreground">{section.heading}</h3>
          ) : null}
          {section.paragraphs.map((paragraph, p) => {
            const pages = pagesOf(paragraph.sources);
            return (
              <p key={p} className="text-[15px] leading-relaxed text-foreground">
                {dollarMath(paragraph.text).map((part, i) =>
                  part.math ? (
                    <MathText key={i} latex={part.text} />
                  ) : (
                    <Fragment key={i}>{part.text}</Fragment>
                  ),
                )}{' '}
                {pages.length ? (
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    ({t('lessons.cite', { pages: pageList(pages) })})
                  </span>
                ) : null}
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}
