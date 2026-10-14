import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { BookSpine } from '@/components/books/BookSpine';
import { UnitAccordion } from '@/components/books/UnitAccordion';
import { buttonClass, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useStructure } from '@/features/content/queries';
import type { LibraryBook } from '@/features/progress/useLibrary';

type CurriculumBookTopicsProps = {
  item: LibraryBook;
  /** Opens the book's first unit, for the curriculum's first textbook. */
  firstOpen: boolean;
};

const NO_LINKS = new Set<string>();

/** One textbook's units and topics, shown as on its book page. */
export function CurriculumBookTopics({ item, firstOpen }: CurriculumBookTopicsProps) {
  const { t } = useTranslation();
  const structure = useStructure(item.book.structure);
  const first = item.units[0]?.index;
  const [opened, setOpened] = useState<Set<number> | null>(null);
  const open = opened ?? new Set(firstOpen && first !== undefined ? [first] : []);
  const title = bookTitle(item.book);
  const toggle = (index: number) => {
    const set = new Set(open);
    if (set.has(index)) set.delete(index);
    else set.add(index);
    setOpened(set);
  };

  return (
    <section className="flex flex-col gap-2.5" aria-label={title}>
      <div className="flex flex-wrap items-center gap-3">
        <BookSpine title={title} />
        <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5">
          <h2 className="truncate font-sans-black text-lg text-foreground">{title}</h2>
          <span className="text-[13px] text-muted-foreground">
            {t('curricula.bookTopicStats', {
              topics: item.stats.topics,
              approved: item.stats.approved,
            })}
          </span>
        </div>
        <Link
          to={`/books/${encodeURIComponent(item.book.id)}`}
          className={buttonClass('secondary')}
        >
          {t('curricula.openBook')}
        </Link>
      </div>
      {!item.book.structure ? (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {t('curricula.noStructure')}
        </p>
      ) : !item.ready ? (
        <LoadingState />
      ) : (
        item.units.map((unit) => (
          <UnitAccordion
            key={unit.index}
            bookId={item.book.id}
            unit={unit}
            topics={unit.topics}
            offset={structure.data?.source.printedPageOffset ?? null}
            canExtract={item.book.canExtract}
            linkedTopics={NO_LINKS}
            open={open.has(unit.index)}
            onToggle={() => toggle(unit.index)}
          />
        ))
      )}
    </section>
  );
}
