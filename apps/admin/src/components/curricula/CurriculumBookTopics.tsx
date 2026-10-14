import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { BookSpine } from '@/components/books/BookSpine';
import { buttonClass, LoadingState } from '@/components/ui';
import { bookTitle, printedPage } from '@/features/content/pages';
import { useStructure } from '@/features/content/queries';
import type { TopicStage } from '@/features/progress/stages';
import type { LibraryBook } from '@/features/progress/useLibrary';
import { cn } from '@/lib/cn';

type CurriculumBookTopicsProps = { curriculumId: string; item: LibraryBook };

const stageLook: Record<TopicStage, string> = {
  approved: 'bg-success-muted text-success',
  review: 'bg-accent-muted text-foreground',
  knowledge: 'bg-accent-muted text-foreground',
  source: 'bg-muted text-muted-foreground',
  none: 'bg-muted text-muted-foreground',
};

/** One textbook's units and topics, each topic a lesson of the curriculum. */
export function CurriculumBookTopics({ curriculumId, item }: CurriculumBookTopicsProps) {
  const { t } = useTranslation();
  const structure = useStructure(item.book.structure);
  const offset = structure.data?.source.printedPageOffset ?? null;
  const title = bookTitle(item.book);
  const lessonUrl = (number: string) =>
    `/curricula/${encodeURIComponent(curriculumId)}/lessons/${encodeURIComponent(
      item.book.id,
    )}/${encodeURIComponent(number)}`;

  return (
    <section className="flex flex-col gap-3" aria-label={title}>
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
          <div key={unit.index} className="overflow-hidden rounded-lg border border-border bg-card">
            <h3 className="flex flex-wrap items-baseline gap-2 border-b border-border px-4 py-3">
              <span className="text-[13px] font-sans-black text-primary">
                {t('bookPage.unit', { index: unit.index })}
              </span>
              <span className="font-sans-black text-base text-foreground">{unit.title}</span>
            </h3>
            <ul className="divide-y divide-border">
              {unit.topics.map((topic) => (
                <li key={topic.number}>
                  <Link
                    to={lessonUrl(topic.number)}
                    className="flex min-h-12 flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="inline-flex h-[30px] min-w-10 items-center justify-center rounded-[8px] bg-secondary px-1.5 font-sans-black text-[13px] text-secondary-foreground">
                      {topic.number}
                    </span>
                    <span className="flex-[1_1_14rem] font-sans-bold text-sm text-foreground">
                      {topic.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t('common.printedPages', {
                        from: printedPage(topic.startPage, offset),
                        to: printedPage(topic.endPage, offset),
                      })}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-sans-bold',
                        stageLook[topic.stage],
                      )}
                    >
                      {t(`curricula.material.${topic.stage}`)}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
