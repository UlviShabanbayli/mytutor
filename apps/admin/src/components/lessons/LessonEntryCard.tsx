import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { ItemFigures } from '@/components/knowledge/ItemFigures';
import { KnowledgeItemBody } from '@/components/knowledge/KnowledgeItemBody';
import { figuresOf, toExtracted } from '@/features/knowledge/items';
import { pageList, type MaterialEntry } from '@/features/lessons/material';
import { BookAnswer } from './BookAnswer';

type LessonEntryCardProps = { entry: MaterialEntry; source: TopicSource; topicDir: string };

/** A textbook example or exercise in a lesson, with the drawings it needs and its pages. */
export function LessonEntryCard({ entry, source, topicDir }: LessonEntryCardProps) {
  const { t } = useTranslation();
  const extracted = toExtracted(entry.item);
  const figures = figuresOf(entry.item, source);
  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card p-4">
      {extracted ? <KnowledgeItemBody item={extracted} once /> : null}
      {figures.length ? <ItemFigures figures={figures} topicDir={topicDir} /> : null}
      {entry.answers.length ? <BookAnswer answers={entry.answers} /> : null}
      <p className="text-xs text-muted-foreground">
        {t('lessons.cite', { pages: pageList(entry.pages) })}
      </p>
    </article>
  );
}
