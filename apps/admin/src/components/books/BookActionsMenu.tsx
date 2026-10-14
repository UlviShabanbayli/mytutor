import { ChevronDown, ListChecks, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { ContentBookEntry } from '@mytutor/types';
import { buttonClass } from '@/components/ui';
import { DeleteBookDialog } from './DeleteBookDialog';
import { STANDARDS_ENABLED } from '@/lib/features';

type BookActionsMenuProps = { book: ContentBookEntry; onDeleted: () => void };

const item =
  'flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-sm px-3 text-left text-sm font-sans-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Less frequent book actions, out of the way of the main one. */
export function BookActionsMenu({ book, onDeleted }: BookActionsMenuProps) {
  const { t } = useTranslation();
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={buttonClass('secondary', 'h-12 rounded-md px-3.5')}
      >
        {t('bookPage.more')}
        <ChevronDown className="size-4" aria-hidden />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-14 z-30 w-64 rounded-md border border-border bg-card p-1 shadow-lg"
        >
          {STANDARDS_ENABLED ? (
            <Link
              role="menuitem"
              to={`/books/${encodeURIComponent(book.id)}/standards`}
              className={`${item} text-foreground hover:bg-muted`}
            >
              <ListChecks className="size-4" aria-hidden />
              {t('bookPage.standardLinks')}
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDeleting(true);
            }}
            className={`${item} text-destructive hover:bg-destructive-muted`}
          >
            <Trash2 className="size-4" aria-hidden />
            {t('books.delete')}
          </button>
        </div>
      ) : null}
      <DeleteBookDialog
        book={book}
        open={deleting}
        onClose={() => setDeleting(false)}
        onDeleted={onDeleted}
      />
    </div>
  );
}
