import { FileSearch, ListChecks, ListTree, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StageChip } from '@/components/books/StageChip';
import { Badge } from '@/components/ui';
import { GuideSection } from './GuideSection';
import { SampleButton } from './samples';

export function BooksGuide() {
  const { t } = useTranslation();
  const stage = (key: 'source' | 'knowledge' | 'lesson', ready: boolean) => (
    <StageChip label={t(`bookPage.stage.${key}`)} ready={ready} />
  );
  return (
    <GuideSection
      id="books"
      title={t('guide.books.title')}
      rows={[
        { sample: <Badge>{t('books.units', { count: 5 })}</Badge>, text: t('guide.books.units') },
        {
          sample: <Badge>{t('books.topics', { count: 26 })}</Badge>,
          text: t('guide.books.topics'),
        },
        {
          sample: <Badge tone="success">{t('books.sourcesReady', { count: 26 })}</Badge>,
          text: t('guide.books.sources'),
        },
        {
          sample: <Badge tone="accent">{t('books.noStructure')}</Badge>,
          text: t('guide.books.noStructure'),
        },
        {
          sample: (
            <SampleButton>
              <Trash2 className="size-3.5" />
              {t('books.delete')}
            </SampleButton>
          ),
          text: t('guide.books.delete'),
        },
        {
          sample: (
            <span className="flex gap-3 text-xs font-sans-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <ListTree className="size-3.5" />
                {t('bookPage.tabs.topics')}
              </span>
              <span className="flex items-center gap-1">
                <ListChecks className="size-3.5" />
                {t('bookPage.tabs.curriculum')}
              </span>
            </span>
          ),
          text: t('guide.books.tabs'),
        },
        { sample: stage('source', true), text: t('guide.books.stageReady') },
        { sample: stage('knowledge', false), text: t('guide.books.stageMissing') },
        {
          sample: (
            <>
              {stage('source', true)}
              {stage('knowledge', true)}
              {stage('lesson', false)}
            </>
          ),
          text: t('guide.books.stages'),
        },
        {
          sample: (
            <SampleButton>
              <FileSearch className="size-3.5" />
              {t('bookPage.extract')}
            </SampleButton>
          ),
          text: t('guide.books.extract'),
        },
        {
          sample: (
            <span className="flex items-center gap-2 opacity-70">
              <span className="rounded-sm bg-secondary px-2 py-1 font-sans-black text-xs text-secondary-foreground">
                1.3
              </span>
              <span className="text-sm text-foreground">…</span>
            </span>
          ),
          text: t('guide.books.dimmed'),
        },
        {
          sample: (
            <SampleButton>
              <RotateCcw className="size-3.5" />
              {t('trash.restore')}
            </SampleButton>
          ),
          text: t('guide.books.restore'),
        },
        {
          sample: (
            <SampleButton variant="ghost">
              <span className="flex items-center gap-1 text-destructive">
                <Trash2 className="size-3.5" />
                {t('trash.purge')}
              </span>
            </SampleButton>
          ),
          text: t('guide.books.purge'),
        },
      ]}
    />
  );
}
