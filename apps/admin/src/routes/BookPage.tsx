import { ChevronRight, ListTree } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { BookActionsMenu } from '@/components/books/BookActionsMenu';
import { BookSteps } from '@/components/books/BookSteps';
import { ExtractMissingButton } from '@/components/books/ExtractMissingButton';
import { matchesFilter, type TopicFilter, TopicFilterBar } from '@/components/books/TopicFilterBar';
import { UnitAccordion } from '@/components/books/UnitAccordion';
import { BookStandardsTab } from '@/components/links/BookStandardsTab';
import { buttonClass, CommandHint, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useStructure } from '@/features/content/queries';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { missingSources, nextReviewTopic } from '@/features/progress/stages';
import { useLibrary } from '@/features/progress/useLibrary';
import { commands } from '@/lib/commands';
import { NotFoundPage } from './NotFoundPage';

type BookPageProps = { tab: 'topics' | 'standards' };

/** A book's units and topics with the next action for each; or its standard set links. */
export function BookPage({ tab }: BookPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookId = '' } = useParams();
  const { index, library } = useLibrary();
  const item = library.find((b) => b.book.id === bookId);
  const structure = useStructure(item?.book.structure ?? null);
  const [filter, setFilter] = useState<TopicFilter>({ stage: 'all', flaggedOnly: false });
  const [opened, setOpened] = useState<Set<number> | null>(null);
  const base = `/books/${encodeURIComponent(bookId)}`;
  const title = item ? bookTitle(item.book) : '';
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    { label: t('nav.books'), to: '/books' },
    { label: title, to: base },
    ...(tab === 'standards' ? [{ label: t('bookPage.tabs.standards') }] : []),
  ]);

  if (index.isPending) return <LoadingState />;
  if (index.isError) return <ErrorState onRetry={() => void index.refetch()} />;
  if (!item) return <NotFoundPage />;
  const { book, units, topics, stats } = item;
  const next = nextReviewTopic(topics);
  const missing = missingSources(topics).map((topic) => topic.number);
  const linked = new Set(Object.keys(book.standardLinks?.topics ?? {}));
  for (const link of book.standardLinks?.items ?? []) linked.add(link.topic);
  // Opened by default: the unit of the topic to review next, else the first.
  const nextUnit = units.find((u) => u.topics.some((topic) => topic.number === next?.number));
  const open = opened ?? new Set([nextUnit?.index ?? units[0]?.index ?? 0]);
  const toggle = (index: number) => {
    const set = new Set(open);
    if (set.has(index)) set.delete(index);
    else set.add(index);
    setOpened(set);
  };

  const header = (
    <header className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1.5">
        <h1 className="font-sans-black text-3xl text-foreground">
          {tab === 'standards' ? t('bookPage.standardLinks') : title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tab === 'standards'
            ? title
            : [
                structure.data
                  ? t('bookPage.pageCount', { count: structure.data.source.pageCount })
                  : null,
                t('bookPage.unitCount', { count: units.length }),
                t('books.topics', { count: stats.topics }),
              ]
                .filter(Boolean)
                .join(' · ')}
        </p>
      </div>
      {tab === 'topics' ? (
        <>
          <BookActionsMenu
            book={book}
            onDeleted={() => void navigate('/books', { replace: true })}
          />
          {next ? (
            <Link
              to={`${base}/topics/${encodeURIComponent(next.number)}/review`}
              className={buttonClass('primary', 'h-12 rounded-md px-4 text-[15px]')}
            >
              {t(next.stage === 'review' ? 'bookPage.continueAt' : 'bookPage.startAt', {
                number: next.number,
              })}
              <ChevronRight className="size-5" />
            </Link>
          ) : (
            <ExtractMissingButton book={book} topics={missing} />
          )}
        </>
      ) : (
        <Link to={base} className={buttonClass('secondary')}>
          {t('bookPage.backToTopics')}
        </Link>
      )}
    </header>
  );

  if (!book.structure)
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          icon={<ListTree className="size-6" />}
          title={t('bookPage.noStructureTitle')}
          body={t('bookPage.noStructureBody')}
        >
          <CommandHint command={commands.split} />
        </EmptyState>
      </div>
    );
  if (structure.isPending) return <LoadingState />;
  if (structure.isError)
    return <ErrorState onRetry={() => void structure.refetch()} detail={structure.error.message} />;

  return (
    <div className="flex flex-col gap-5">
      {header}
      {tab === 'standards' ? (
        <BookStandardsTab book={book} structure={structure.data} />
      ) : (
        <>
          <BookSteps bookId={book.id} stats={stats} linkedTopics={linked.size} />
          <TopicFilterBar topics={topics} filter={filter} onChange={setFilter} />
          <div className="flex flex-col gap-2.5">
            {units.map((unit) => (
              <UnitAccordion
                key={unit.index}
                bookId={book.id}
                unit={unit}
                topics={unit.topics.filter((topic) => matchesFilter(topic, filter))}
                offset={structure.data.source.printedPageOffset}
                canExtract={book.canExtract}
                linkedTopics={linked}
                open={open.has(unit.index)}
                onToggle={() => toggle(unit.index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
