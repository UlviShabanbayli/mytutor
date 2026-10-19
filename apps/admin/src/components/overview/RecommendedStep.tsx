import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ExtractMissingButton } from '@/components/books/ExtractMissingButton';
import { buttonClass, CommandHint } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import type { NextStep } from '@/features/progress/nextSteps';
import { topicUrl } from '@/features/progress/search';
import { commands } from '@/lib/commands';

type RecommendedStepProps = { step: NextStep };

const STEP_NUMBER: Record<NextStep['kind'], number> = {
  extract: 1,
  knowledge: 2,
  review: 3,
  standards: 4,
  link: 4,
};

/** The one thing to do next, with why and a single clear button. */
export function RecommendedStep({ step }: RecommendedStepProps) {
  const { t } = useTranslation();
  const book = 'book' in step ? bookTitle(step.book.book) : '';
  let title = '';
  let body = '';
  let progress: number | null = null;
  let action = null;

  if (step.kind === 'review') {
    const review = step.topic.entry?.review;
    const started = step.topic.stage === 'review';
    title = t(started ? 'next.reviewContinue' : 'next.reviewStart', {
      number: step.topic.number,
      title: step.topic.title,
    });
    body = review
      ? t('next.reviewBody', {
          done: review.approvedBlocks,
          total: review.blocks,
          flagged: review.openFlagged,
        })
      : '';
    progress = review?.blocks ? review.approvedBlocks / review.blocks : null;
    action = (
      <Link
        to={topicUrl(step.book.book.id, step.topic)}
        className={buttonClass('primary', 'h-13 rounded-md px-5 text-base')}
      >
        {t(started ? 'next.continue' : 'next.start')}
        <ChevronRight className="size-5" />
      </Link>
    );
  } else if (step.kind === 'extract') {
    title = t('next.extract', { book, count: step.topics.length });
    body = t('next.extractBody');
    action = <ExtractMissingButton book={step.book.book} topics={step.topics} />;
  } else if (step.kind === 'knowledge') {
    title = t('next.knowledge', { book, count: step.count });
    body = t('next.knowledgeBody');
    action = <CommandHint command={commands.knowledge(t('next.topicDir'))} />;
  } else if (step.kind === 'standards') {
    title = t('next.standardSets');
    body = t('next.standardSetsBody');
    action = (
      <Link to="/standards" className={buttonClass('primary')}>
        {t('standardSets.add')}
      </Link>
    );
  } else {
    title = t('next.link', { book });
    body = t('next.linkBody');
    action = (
      <Link
        to={`/books/${encodeURIComponent(step.book.book.id)}/standards`}
        className={buttonClass('primary')}
      >
        {t('next.linkAction')}
      </Link>
    );
  }

  return (
    <article className="flex min-w-0 flex-[2_1_26rem] flex-wrap items-center gap-4 rounded-xl border-2 border-primary bg-card p-5 shadow-[0_12px_28px_rgb(var(--color-primary)/0.10)]">
      <div className="flex min-w-0 flex-[1_1_18rem] flex-col gap-2">
        <span className="self-start rounded-full bg-primary px-2.5 py-0.5 text-xs font-sans-black text-primary-foreground">
          {t('next.recommended', { step: STEP_NUMBER[step.kind] })}
        </span>
        <h3 className="font-sans-black text-[19px] leading-snug text-foreground">{title}</h3>
        {body ? <p className="text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
        {progress !== null ? (
          <span className="h-2 rounded-full bg-secondary">
            <span
              className="block h-2 rounded-full bg-primary"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </span>
        ) : null}
      </div>
      {action}
    </article>
  );
}
