import { FileSearch, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useExtractSource } from '@/features/content/mutations';
import { ActionError } from './ActionError';

type ExtractSourceButtonProps = { bookId: string; topic: string };

/** Extracts one topic's source layer from the book PDF (no AI); the row turns into a link. */
export function ExtractSourceButton({ bookId, topic }: ExtractSourceButtonProps) {
  const { t } = useTranslation();
  const extract = useExtractSource(bookId);
  return (
    <span className="flex shrink-0 flex-col items-end gap-1">
      <Button
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        disabled={extract.isPending}
        aria-busy={extract.isPending}
        onClick={() => extract.mutate(topic)}
      >
        {extract.isPending ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <FileSearch className="size-4" />
        )}
        {/* Visible text stays the accessible name; the topic number only adds context. */}
        <span aria-live="polite">
          {extract.isPending ? t('curriculum.extracting') : t('curriculum.extract')}
        </span>
        <span className="sr-only"> ({topic})</span>
      </Button>
      {extract.isError ? <ActionError error={extract.error} compact /> : null}
    </span>
  );
}
