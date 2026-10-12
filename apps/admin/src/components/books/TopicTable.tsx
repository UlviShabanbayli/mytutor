import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { printedPage } from '@/features/content/pages';
import type { TopicRowData } from '@/features/progress/stages';
import { cn } from '@/lib/cn';
import { StepBar } from './StepBar';
import { TopicAction } from './TopicAction';

type TopicTableProps = {
  bookId: string;
  topics: TopicRowData[];
  offset: number | null;
  canExtract: boolean;
  linkedTopics: Set<string>;
};

/** A unit's topics: pages, how far each got, how many items need a look, what to do next. */
export function TopicTable({ bookId, topics, offset, canExtract, linkedTopics }: TopicTableProps) {
  const { t } = useTranslation();
  const th = 'px-3 py-2.5 font-sans-bold';
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className={cn(th, 'pl-4')}>{t('bookPage.col.topic')}</th>
            <th className={th}>{t('bookPage.col.pages')}</th>
            <th className={th}>{t('bookPage.col.step')}</th>
            <th className={cn(th, 'text-right')}>{t('bookPage.col.items')}</th>
            <th className={cn(th, 'text-right')}>{t('bookPage.col.flagged')}</th>
            <th className={cn(th, 'pr-4 text-right')}>{t('bookPage.col.action')}</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => {
            const flagged = topic.entry?.review?.openFlagged ?? 0;
            const from = printedPage(topic.startPage, offset);
            const to = printedPage(topic.endPage, offset);
            return (
              <tr
                key={topic.number}
                className={cn(
                  'border-t border-border',
                  topic.stage === 'review' && 'bg-accent-muted/50',
                )}
              >
                <td className="py-3 pl-4 pr-3">
                  <span className="inline-flex items-center gap-2.5">
                    <span className="inline-flex h-[30px] min-w-10 items-center justify-center rounded-[8px] bg-secondary px-1.5 font-sans-black text-[13px] text-secondary-foreground">
                      {topic.number}
                    </span>
                    {topic.entry ? (
                      <Link
                        to={`/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(topic.number)}/source`}
                        className="font-sans-bold text-foreground hover:underline"
                      >
                        {topic.title}
                      </Link>
                    ) : (
                      <span className="font-sans-bold text-muted-foreground">{topic.title}</span>
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                  {from === to ? from : `${from}–${to}`}
                </td>
                <td className="px-3 py-3">
                  <StepBar topic={topic} linked={linkedTopics.has(topic.number)} />
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {topic.entry?.summary?.items ?? '—'}
                </td>
                <td
                  className={cn(
                    'px-3 py-3 text-right tabular-nums',
                    flagged ? 'font-sans-black text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {flagged || '—'}
                </td>
                <td className="py-3 pl-3 pr-4 text-right">
                  <TopicAction bookId={bookId} topic={topic} canExtract={canExtract} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
