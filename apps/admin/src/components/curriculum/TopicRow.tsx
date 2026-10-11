import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { ContentTopicEntry } from '@mytutor/types';
import { ExtractSourceButton } from './ExtractSourceButton';
import { StageChip } from './StageChip';

type TopicRowProps = {
  bookId: string;
  number: string;
  title: string;
  pages: string;
  entry: ContentTopicEntry | undefined;
  /** The book PDF is on disk, so a missing source can be extracted from here. */
  canExtract: boolean;
};

export function TopicRow({ bookId, number, title, pages, entry, canExtract }: TopicRowProps) {
  const { t } = useTranslation();
  const body = (
    <>
      <span className="flex h-8 min-w-12 shrink-0 items-center justify-center rounded-sm bg-secondary px-2 font-sans-black text-sm tabular-nums text-secondary-foreground">
        {number}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-sans-bold text-sm text-foreground">{title}</span>
          <span className="block text-xs text-muted-foreground">{pages}</span>
        </span>
        <span className="flex flex-wrap gap-1">
          <StageChip label={t('curriculum.stage.source')} ready={Boolean(entry?.source)} />
          <StageChip label={t('curriculum.stage.knowledge')} ready={Boolean(entry?.knowledge)} />
          <StageChip label={t('curriculum.stage.lesson')} ready={false} />
        </span>
      </span>
    </>
  );

  if (!entry) {
    return canExtract ? (
      <li className="flex items-center gap-3 px-4 py-3">
        {body}
        <ExtractSourceButton bookId={bookId} topic={number} />
      </li>
    ) : (
      <li
        className="flex items-center gap-3 px-4 py-3 opacity-70"
        title={`${t('curriculum.sourceMissing')}. ${t('curriculum.noPdf')}`}
      >
        {body}
        <span className="size-5 shrink-0" aria-hidden />
      </li>
    );
  }
  return (
    <li>
      <Link
        to={`/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(number)}/source`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {body}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
