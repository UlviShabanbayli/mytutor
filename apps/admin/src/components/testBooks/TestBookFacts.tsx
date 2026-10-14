import { useTranslation } from 'react-i18next';
import type { TestBookEntry } from '@mytutor/types';
import { formatDay, formatMegabytes } from '@/features/testBooks/format';

/** The uploaded file: name, pages, size and when it was added. */
export function TestBookFacts({ book }: { book: TestBookEntry }) {
  const { t, i18n } = useTranslation();
  const facts = [
    { label: t('testBooks.file'), value: book.file },
    { label: t('testBooks.pagesLabel'), value: String(book.pages) },
    { label: t('testBooks.size'), value: formatMegabytes(book.bytes, i18n.language) },
    { label: t('testBooks.addedLabel'), value: formatDay(book.createdAt, i18n.language) },
  ];
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
      {facts.map(({ label, value }) => (
        <div
          key={label}
          className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-4"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="break-words font-sans-bold text-base text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
