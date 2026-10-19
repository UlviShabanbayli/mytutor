import { FileSearch, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ContentBookEntry } from '@mytutor/types';
import { Button } from '@/components/ui';
import { isRunning, useExtractQueue } from '@/features/content/extractQueue';
import { ActionError } from './ActionError';

type ExtractMissingButtonProps = {
  book: ContentBookEntry;
  /** Topic numbers without a source. */
  topics: string[];
  variant?: 'primary' | 'secondary';
};

/** Extracts every missing source of a book, one topic after another (free, no AI). */
export function ExtractMissingButton({
  book,
  topics,
  variant = 'primary',
}: ExtractMissingButtonProps) {
  const { t } = useTranslation();
  const run = useExtractQueue((s) => s.runs[book.id]);
  const start = useExtractQueue((s) => s.start);
  const running = isRunning(run);
  if (!book.canExtract || (topics.length === 0 && !running)) return null;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        variant={variant}
        disabled={running}
        aria-busy={running}
        onClick={() => void start(book.id, topics)}
      >
        {running ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <FileSearch className="size-4" />
        )}
        <span aria-live="polite">
          {running && run
            ? t('extractAll.running', { done: run.done, total: run.total })
            : t('extractAll.start', { count: topics.length })}
        </span>
      </Button>
      {run?.error ? <ActionError error={run.error} compact /> : null}
    </div>
  );
}
