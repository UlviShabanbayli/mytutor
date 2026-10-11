import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ExtractedItem } from '@mytutor/types';
import { MathText } from '@/components/ui';

type MathPart = { text: string | null; latex: string | null };

function Mixed({ part }: { part: MathPart }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      {part.text ? <span>{part.text}</span> : null}
      {part.latex ? <MathText latex={part.latex} /> : null}
    </span>
  );
}

/** Type-specific rendering of an extracted item; all math goes through KaTeX. */
export function KnowledgeItemBody({ item }: { item: ExtractedItem }) {
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
            <span className="font-sans-bold">{item.label}</span> <Mixed part={item.problem} />
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            {item.steps.map((step, i) => (
              <li key={i}>
                <Mixed part={step} />
              </li>
            ))}
          </ol>
          {item.explanation ? (
            <p className="text-muted-foreground">
              <span className="font-sans-bold">{t('knowledge.explanation')}:</span>{' '}
              {item.explanation}
            </p>
          ) : null}
        </div>
      );
    case 'exercise':
      return (
        <div className="flex flex-col gap-2 text-sm">
          <p>
            <span className="font-sans-bold">{item.number}.</span> {item.instruction}
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
                  <Mixed part={sub} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    case 'definition':
      return (
        <p className="text-sm">
          <span className="font-sans-bold">{item.concept}:</span> {item.statement}
        </p>
      );
    case 'rule':
    case 'question':
      return (
        <div className="flex flex-col gap-1 text-sm">
          <p>{item.type === 'rule' ? item.statement : item.text}</p>
          {item.latex ? <MathText latex={item.latex} display className="text-lg" /> : null}
        </div>
      );
    case 'figure':
      return (
        <div className="flex flex-col gap-1 text-sm">
          <p>{item.description}</p>
          {item.labels.length ? (
            <p className="text-xs text-muted-foreground">
              {t('knowledge.labels')}: {item.labels.join(', ')}
            </p>
          ) : null}
        </div>
      );
    case 'term':
      return (
        <p className="text-sm">
          <span className="font-sans-bold">{item.term}</span>{' '}
          <span className="text-muted-foreground">— {item.context}</span>
        </p>
      );
    case 'prerequisite':
      return <p className="text-sm">{item.statement}</p>;
  }
}
