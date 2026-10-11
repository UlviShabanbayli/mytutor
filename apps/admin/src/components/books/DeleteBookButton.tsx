import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContentBookEntry } from '@mytutor/types';
import { Button } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { cn } from '@/lib/cn';
import { DeleteBookDialog } from './DeleteBookDialog';

type DeleteBookButtonProps = {
  book: ContentBookEntry;
  /** An icon-only button (book cards) instead of a labelled one (the book's page). */
  iconOnly?: boolean;
  onDeleted?: () => void;
  className?: string;
};

/** Opens the delete confirmation; styled quietly so it never competes with the main action. */
export function DeleteBookButton({
  book,
  iconOnly = false,
  onDeleted,
  className,
}: DeleteBookButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={iconOnly ? 'ghost' : 'secondary'}
        aria-label={iconOnly ? t('books.deleteNamed', { title: bookTitle(book) }) : undefined}
        title={iconOnly ? t('books.delete') : undefined}
        onClick={() => setOpen(true)}
        className={cn(
          'text-muted-foreground hover:bg-destructive-muted hover:text-destructive',
          iconOnly && 'size-11 shrink-0 px-0',
          className,
        )}
      >
        <Trash2 className="size-4" />
        {iconOnly ? null : t('books.delete')}
      </Button>
      <DeleteBookDialog
        book={book}
        open={open}
        onClose={() => setOpen(false)}
        onDeleted={onDeleted}
      />
    </>
  );
}
