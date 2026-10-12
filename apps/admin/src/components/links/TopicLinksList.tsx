import { useTranslation } from 'react-i18next';
import type { Curriculum, TextbookUnit } from '@mytutor/types';
import { Card } from '@/components/ui';
import { withTopicCodes } from '@/features/curriculum/links';
import type { BookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { StandardLinkEditor } from './StandardLinkEditor';

type TopicLinksListProps = { units: TextbookUnit[]; curriculum: Curriculum; bc: BookCurriculum };

/** Every topic of the book with the standards it is linked to, unit by unit. */
export function TopicLinksList({ units, curriculum, bc }: TopicLinksListProps) {
  const { t } = useTranslation();
  const itemLinks = (topic: string) => bc.links.items.filter((l) => l.topic === topic).length;

  return (
    <div className="flex flex-col gap-4">
      {units.map((unit) => (
        <Card key={unit.index} className="overflow-hidden">
          <h2 className="border-b border-border bg-muted/50 px-4 py-3 font-sans-bold text-base text-foreground">
            <span className="text-primary">{t('bookPage.unit', { index: unit.index })}</span>
            <span className="text-muted-foreground"> · </span>
            {unit.title}
          </h2>
          <ul className="divide-y divide-border">
            {unit.items.flatMap((item) =>
              item.type === 'topic'
                ? [
                    <li key={item.number} className="flex flex-col gap-3 px-4 py-3 sm:flex-row">
                      <div className="flex min-w-0 items-start gap-3 sm:w-72 sm:shrink-0">
                        <span className="flex h-8 min-w-12 shrink-0 items-center justify-center rounded-sm bg-secondary px-2 font-sans-black text-sm tabular-nums text-secondary-foreground">
                          {item.number}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="font-sans-bold text-sm text-foreground">
                            {item.title}
                          </span>
                          {itemLinks(item.number) ? (
                            <span className="text-xs text-muted-foreground">
                              {t('links.itemLinks', { count: itemLinks(item.number) })}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <StandardLinkEditor
                        className="flex-1"
                        subject={`${item.number}. ${item.title}`}
                        codes={bc.links.topics[item.number] ?? []}
                        standards={curriculum.standards}
                        save={bc.save}
                        apply={(codes) => withTopicCodes(bc.links, item.number, codes)}
                      />
                    </li>,
                  ]
                : [],
            )}
          </ul>
        </Card>
      ))}
    </div>
  );
}
