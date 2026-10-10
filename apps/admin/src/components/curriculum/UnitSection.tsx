import { useTranslation } from 'react-i18next';
import type { ContentTopicEntry, TextbookUnit } from '@mytutor/types';
import { Card } from '@/components/ui';
import { printedPage } from '@/features/content/pages';
import { TopicRow } from './TopicRow';

type UnitSectionProps = {
  bookId: string;
  unit: TextbookUnit;
  offset: number | null;
  topics: ContentTopicEntry[];
  canExtract: boolean;
};

export function UnitSection({ bookId, unit, offset, topics, canExtract }: UnitSectionProps) {
  const { t } = useTranslation();
  const pages = (from: number, to: number) =>
    from === to
      ? t('common.printedPage', { page: printedPage(from, offset) })
      : t('common.printedPages', { from: printedPage(from, offset), to: printedPage(to, offset) });

  return (
    <Card className="overflow-hidden">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <h2 className="font-sans-bold text-base text-foreground">
          <span className="text-primary">{t('curriculum.unit', { index: unit.index })}</span>
          <span className="text-muted-foreground"> · </span>
          {unit.title}
        </h2>
        <span className="text-xs text-muted-foreground">{pages(unit.startPage, unit.endPage)}</span>
      </header>
      <ul className="divide-y divide-border">
        {unit.items.map((item) =>
          item.type === 'topic' ? (
            <TopicRow
              key={item.number}
              bookId={bookId}
              number={item.number}
              title={item.title}
              pages={pages(item.startPage, item.endPage)}
              entry={topics.find((e) => e.number === item.number)}
              canExtract={canExtract}
            />
          ) : (
            <li
              key={`${item.kind}-${item.startPage}`}
              className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-muted-foreground"
            >
              <span className="truncate">{item.title}</span>
              <span className="shrink-0">{pages(item.startPage, item.endPage)}</span>
            </li>
          ),
        )}
      </ul>
    </Card>
  );
}
