import { LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BOOK_TITLE_MAX } from '@mytutor/schemas';
import { Button } from '@/components/ui';
import { titleFromFileName } from '@/features/content/bookTitle';
import type { useAddBook } from '@/features/content/mutations';
import { ActionError } from './ActionError';
import { PdfDropZone } from './PdfDropZone';

type AddBookFormProps = { add: ReturnType<typeof useAddBook>; onClose: () => void };

export function AddBookForm({ add, onClose }: AddBookFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  // Until the user types a title, each picked file suggests one.
  const [titleEdited, setTitleEdited] = useState(false);
  const [rejected, setRejected] = useState(false);
  const ready = file !== null && title.trim().length > 0 && !add.isPending;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!file || !ready) return;
        add.mutate(
          { file, title: title.trim() },
          {
            onSuccess: ({ bookId }) => {
              onClose();
              void navigate(`/books/${encodeURIComponent(bookId)}`);
            },
          },
        );
      }}
    >
      <p className="text-sm text-muted-foreground">{t('addBook.body')}</p>
      <PdfDropZone
        file={file}
        disabled={add.isPending}
        onReject={() => setRejected(true)}
        onChange={(picked) => {
          setRejected(false);
          add.reset();
          setFile(picked);
          if (picked && (!titleEdited || !title.trim())) setTitle(titleFromFileName(picked.name));
        }}
      />
      {rejected ? (
        <p role="alert" className="text-sm text-destructive">
          {t('addBook.notPdf')}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={titleId} className="font-sans-bold text-sm text-foreground">
          {t('addBook.titleLabel')}
        </label>
        <input
          id={titleId}
          value={title}
          maxLength={BOOK_TITLE_MAX}
          disabled={add.isPending}
          placeholder={t('addBook.titlePlaceholder')}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleEdited(true);
            if (add.isError) add.reset();
          }}
          className="min-h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
      </div>
      {add.isError ? <ActionError error={add.error} /> : null}
      {add.isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          {t('addBook.pending')}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={add.isPending}>
          {t('addBook.cancel')}
        </Button>
        <Button type="submit" disabled={!ready}>
          {t('addBook.submit')}
        </Button>
      </div>
    </form>
  );
}
