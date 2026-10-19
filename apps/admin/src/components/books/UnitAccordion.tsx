import { ChevronDown, ChevronUp } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { printedPage } from '@/features/content/pages';
import type { TopicRowData, UnitData } from '@/features/progress/stages';
import { StepBarLegend } from './StepBar';
import { TopicTable } from './TopicTable';

type UnitAccordionProps = {
  bookId: string;
  unit: UnitData;
  /** The unit's topics that pass the filter. */
  topics: TopicRowData[];
  offset: number | null;
  canExtract: boolean;
  linkedTopics: Set<string>;
  open: boolean;
  onToggle: () => void;
};

/** A unit as one row; opened, its topics as a table. */
export function UnitAccordion(props: UnitAccordionProps) {
  const { t } = useTranslation();
  const { unit, topics, open, onToggle } = props;
  const panelId = useId();
  const flagged = unit.topics.reduce(
    (sum, topic) => sum + (topic.entry?.review?.openFlagged ?? 0),
    0,
  );
  const items = unit.topics.reduce((sum, topic) => sum + (topic.entry?.summary?.items ?? 0), 0);
  const from = printedPage(unit.startPage, props.offset);
  const to = printedPage(unit.endPage, props.offset);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <section
      className={open ? 'overflow-hidden rounded-lg border border-border bg-card shadow-sm' : ''}
    >
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={`flex min-h-[60px] w-full cursor-pointer flex-wrap items-center gap-3 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 ${
            open
              ? 'border-b border-border'
              : 'rounded-lg border border-border bg-card hover:bg-muted'
          }`}
        >
          <span className="text-[13px] font-sans-black text-primary">
            {t('bookPage.unit', { index: unit.index })}
          </span>
          <span className="flex-[1_1_12rem] font-sans-black text-base text-foreground">
            {unit.title}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {[
              t('common.printedPages', { from, to }),
              t('books.topics', { count: unit.topics.length }),
              items ? t('bookPage.items', { count: items }) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {flagged ? (
            <span className="rounded-full bg-destructive-muted px-2.5 py-0.5 text-xs font-sans-bold text-destructive">
              {t('stage.flaggedCount', { count: flagged })}
            </span>
          ) : null}
          <Chevron className="size-5 text-muted-foreground" aria-hidden />
        </button>
      </h2>
      {open ? (
        <div id={panelId}>
          {topics.length ? (
            <TopicTable
              bookId={props.bookId}
              topics={topics}
              offset={props.offset}
              canExtract={props.canExtract}
              linkedTopics={props.linkedTopics}
            />
          ) : (
            <p className="px-5 py-4 text-sm text-muted-foreground">{t('bookPage.noneMatch')}</p>
          )}
          <StepBarLegend />
        </div>
      ) : null}
    </section>
  );
}
