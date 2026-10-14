import { LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BOOK_TITLE_MAX, SUBJECT_IDS, subjectIdSchema } from '@mytutor/schemas';
import { ActionError } from '@/components/books/ActionError';
import { PdfDropZone } from '@/components/books/PdfDropZone';
import { Button, Input, inputClass } from '@/components/ui';
import { titleFromFileName } from '@/features/content/bookTitle';
import type { useAddTestBook } from '@/features/testBooks/mutations';

type AddTestBookFormProps = {
  add: ReturnType<typeof useAddTestBook>;
  onClose: () => void;
};

/** A test book's PDF, its title and its subject; on success its page opens. */
export function AddTestBookForm({ add, onClose }: AddTestBookFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleId = useId();
  const subjectId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  // Until the user types a title, each picked file suggests one.
  const [titleEdited, setTitleEdited] = useState(false);
  const [subject, setSubject] = useState('');
  const [rejected, setRejected] = useState(false);
  const picked = subjectIdSchema.safeParse(subject);
  const ready = file !== null && title.trim().length > 0 && picked.success && !add.isPending;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!file || !ready || !picked.success) return;
        add.mutate(
          { file, title: title.trim(), subject: picked.data },
          {
            onSuccess: ({ testBookId }) => {
              onClose();
              void navigate(`/test-books/${encodeURIComponent(testBookId)}`);
            },
          },
        );
      }}
    >
      <p className="text-sm text-muted-foreground">{t('testBooks.dialogBody')}</p>
      <PdfDropZone
        file={file}
        disabled={add.isPending}
        onReject={() => setRejected(true)}
        onChange={(next) => {
          setRejected(false);
          add.reset();
          setFile(next);
          if (next && (!titleEdited || !title.trim())) setTitle(titleFromFileName(next.name));
        }}
      />
      {rejected ? (
        <p role="alert" className="text-sm text-destructive">
          {t('addBook.notPdf')}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={titleId} className="font-sans-bold text-sm text-foreground">
          {t('testBooks.titleLabel')}
        </label>
        <Input
          id={titleId}
          value={title}
          maxLength={BOOK_TITLE_MAX}
          disabled={add.isPending}
          placeholder={t('testBooks.titlePlaceholder')}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleEdited(true);
            if (add.isError) add.reset();
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={subjectId} className="font-sans-bold text-sm text-foreground">
          {t('testBooks.subjectLabel')}
        </label>
        <select
          id={subjectId}
          value={subject}
          required
          disabled={add.isPending}
          onChange={(e) => {
            setSubject(e.target.value);
            if (add.isError) add.reset();
          }}
          className={inputClass()}
        >
          <option value="" disabled>
            {t('testBooks.subjectPlaceholder')}
          </option>
          {SUBJECT_IDS.map((id) => (
            <option key={id} value={id}>
              {t(`subjects.${id}`)}
            </option>
          ))}
        </select>
      </div>
      {add.isError ? <ActionError error={add.error} /> : null}
      {add.isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          {t('testBooks.pending')}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={add.isPending}>
          {t('testBooks.cancel')}
        </Button>
        <Button type="submit" disabled={!ready}>
          {t('testBooks.submit')}
        </Button>
      </div>
    </form>
  );
}
