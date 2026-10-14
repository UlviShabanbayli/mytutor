import { ChevronDown, FileSearch, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BookSpine } from '@/components/books/BookSpine';
import { STAGE_ORDER, stageFill } from '@/components/books/stageTone';
import { cn } from '@/lib/cn';
import { GuideSection } from './GuideSection';
import { SampleButton, SampleLabel } from './samples';
import { PIPELINE_STEPS } from '@/lib/features';

const cell = (className: string, flagged = false) => (
  <span
    className={cn(
      'relative flex h-7 w-9 items-center justify-center rounded-[6px] text-[10px] font-sans-black',
      className,
    )}
  >
    1.1
    {flagged ? (
      <span className="absolute -right-[3px] -top-[3px] size-2.5 rounded-full border-2 border-card bg-destructive" />
    ) : null}
  </span>
);

const bar = (fills: string[]) => (
  <span className="flex gap-[3px]">
    {fills.map((fill, i) => (
      <span key={i} className={cn('h-1.5 w-4 rounded-full', fill)} />
    ))}
  </span>
);

export function BooksGuide() {
  const { t } = useTranslation();
  return (
    <GuideSection
      id="books"
      title={t('guide.books.title')}
      rows={[
        {
          sample: <SampleLabel>{t('steps.label', { count: PIPELINE_STEPS })}</SampleLabel>,
          text: t('guide.books.steps'),
        },
        {
          sample: (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-sans-black text-primary-foreground">
              {t('next.recommended', { step: 3 })}
            </span>
          ),
          text: t('guide.books.recommended'),
        },
        { sample: <BookSpine title="7-ci sinif 1-ci hissə" />, text: t('guide.books.spine') },
        {
          sample: (
            <span className="flex gap-[3px]">
              {STAGE_ORDER.map((stage) => (
                <span key={stage}>{cell(stageFill[stage])}</span>
              ))}
            </span>
          ),
          text: t('guide.books.cells'),
        },
        ...STAGE_ORDER.map((stage) => ({
          sample: (
            <>
              {cell(stageFill[stage])}
              <SampleLabel className="text-xs">{t(`stage.${stage}`)}</SampleLabel>
            </>
          ),
          text: t(`guide.books.${stage}`),
        })),
        { sample: cell(stageFill.knowledge, true), text: t('guide.books.dot') },
        {
          sample: (
            <SampleButton variant="primary">
              <FileSearch className="size-3.5" />
              {t('extractAll.start', { count: 21 })}
            </SampleButton>
          ),
          text: t('guide.books.extractAll'),
        },
        {
          sample: (
            <span className="rounded-full bg-accent-muted px-3 py-1 text-xs font-sans-bold text-foreground ring-[1.5px] ring-inset ring-accent">
              3 {t('bookPage.steps.review', { done: 0, total: 26 })}
            </span>
          ),
          text: t('guide.books.bookSteps'),
        },
        {
          sample: <SampleLabel className="text-xs">{t('bookPage.flaggedOnly')}</SampleLabel>,
          text: t('guide.books.filter'),
        },
        {
          sample: (
            <span className="flex items-center gap-2 text-xs">
              <span className="font-sans-black text-primary">
                {t('bookPage.unit', { index: 1 })}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </span>
          ),
          text: t('guide.books.unit'),
        },
        {
          sample: bar(['bg-success', 'bg-success', 'bg-accent', 'bg-border', 'bg-border']),
          text: t('guide.books.bar'),
        },
        { sample: bar(['bg-success']), text: t('guide.books.barDone') },
        { sample: bar(['bg-accent']), text: t('guide.books.barCurrent') },
        { sample: bar(['bg-primary/30']), text: t('guide.books.barQueued') },
        {
          sample: <SampleButton>{t('bookPage.startReview')}</SampleButton>,
          text: t('guide.books.action'),
        },
        { sample: <SampleButton>{t('bookPage.more')}</SampleButton>, text: t('guide.books.more') },
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
