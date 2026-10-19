import { Volume2 } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExtractedItem } from '@mytutor/types';
import { MathText, TextWithMath } from '@/components/ui';

type MathPart = { text: string | null; latex: string | null };

/** A word of three letters or more: the text says more than its formula ("və" does not). */
const WORDS = /\p{L}{3,}/u;

function Mixed({ part, once }: { part: MathPart; once: boolean }) {
  // `once`: the text when it has words, else its formula; the review shows both to compare.
  const text = part.text && (!once || !part.latex || WORDS.test(part.text)) ? part.text : null;
  const latex = part.latex && (!once || !text) ? part.latex : null;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      {text ? <TextWithMath text={text} /> : null}
      {latex ? <MathText latex={latex} /> : null}
    </span>
  );
}

type KnowledgeItemBodyProps = {
  item: ExtractedItem;
  /** Shows a text and its formula once, as a lesson does; the review shows both. */
  once?: boolean;
};

/**
 * Type-specific rendering of an extracted item; all math goes through KaTeX, also LaTeX the
 * model wrote into a prose field.
 */
export function KnowledgeItemBody({ item, once = false }: KnowledgeItemBodyProps) {
  const { t } = useTranslation();
  switch (item.type) {
    case 'formula':
      return (
        <div className="flex flex-col gap-1">
          {item.name ? <p className="font-sans-bold text-sm">{item.name}</p> : null}
          <MathText latex={item.latex} display className="text-lg" />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Volume2 className="size-3.5" aria-label={t('knowledge.spoken')} />
            {item.spoken}
          </p>
        </div>
      );
    case 'worked_example':
      return (
        <div className="flex flex-col gap-2 text-sm">
          <p>
            <span className="font-sans-bold">{item.label}</span>{' '}
            <Mixed part={item.problem} once={once} />
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            {item.steps.map((step, i) => (
              <li key={i}>
                <Mixed part={step} once={once} />
              </li>
            ))}
          </ol>
          {item.explanation ? (
            <p className="text-muted-foreground">
              <span className="font-sans-bold">{t('knowledge.explanation')}:</span>{' '}
              <TextWithMath text={item.explanation} />
            </p>
          ) : null}
        </div>
      );
    case 'exercise':
      return (
        <div className="flex flex-col gap-2 text-sm">
          <p>
            <span className="font-sans-bold">{item.number}.</span>{' '}
            <TextWithMath text={item.instruction} />
          </p>
          {item.items.length ? (
            <ul className="grid gap-1 sm:grid-cols-2">
              {item.items.map((sub, i) => (
                // Labels can repeat or be empty (unlabelled sub-items), so the index is part of the key.
                <li key={`${i}-${sub.label}`} className="flex gap-1.5">
                  {sub.label ? (
                    <span className="font-sans-bold">
                      {/^[\p{L}\d]+$/u.test(sub.label) ? `${sub.label})` : sub.label}
                    </span>
                  ) : null}
                  <Mixed part={sub} once={once} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    case 'definition':
      return (
        <p className="text-sm">
          <span className="font-sans-bold">
            <TextWithMath text={item.concept} />:
          </span>{' '}
          <TextWithMath text={item.statement} />
        </p>
      );
    case 'rule':
    case 'question':
      return (
        <div className="flex flex-col gap-1 text-sm">
          <p>
            <TextWithMath text={item.type === 'rule' ? item.statement : item.text} />
          </p>
          {item.latex ? <MathText latex={item.latex} display className="text-lg" /> : null}
        </div>
      );
    case 'figure':
      return (
        <div className="flex flex-col gap-1 text-sm">
          <p>
            <TextWithMath text={item.description} />
          </p>
          {item.labels.length ? (
            <p className="text-xs text-muted-foreground">
              {t('knowledge.labels')}:{' '}
              {item.labels.map((label, i) => (
                // Labels can repeat, so the index is part of the key.
                <Fragment key={`${i}-${label}`}>
                  {i > 0 ? ', ' : null}
                  <TextWithMath text={label} />
                </Fragment>
              ))}
            </p>
          ) : null}
        </div>
      );
    case 'term':
      return (
        <p className="text-sm">
          <span className="font-sans-bold">{item.term}</span>{' '}
          <span className="text-muted-foreground">
            — <TextWithMath text={item.context} />
          </span>
        </p>
      );
    case 'prerequisite':
      return (
        <p className="text-sm">
          <TextWithMath text={item.statement} />
        </p>
      );
  }
}
