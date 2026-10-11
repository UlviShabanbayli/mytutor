import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { CurriculumEntry } from '@mytutor/types';
import { ExtractMissingButton } from '@/components/books/ExtractMissingButton';
import { buttonClass, CommandHint } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { type NextStep, nextSteps } from '@/features/progress/nextSteps';
import { topicUrl } from '@/features/progress/search';
import type { LibraryBook } from '@/features/progress/useLibrary';
import { commands } from '@/lib/commands';
import { RecommendedStep } from './RecommendedStep';

type NextStepsProps = { library: LibraryBook[]; curricula: CurriculumEntry[] };

/** One recommended next step, large, and up to two other useful ones. */
export function NextSteps({ library, curricula }: NextStepsProps) {
  const { t } = useTranslation();
  const [first, ...rest] = nextSteps(library, curricula);
  if (!first) return null;

  const side = (step: NextStep) => {
    const book = 'book' in step ? bookTitle(step.book.book) : '';
    switch (step.kind) {
      case 'extract':
        return {
          tag: t('next.tagSource'),
          title: t('next.extract', { book, count: step.topics.length }),
          action: (
            <ExtractMissingButton book={step.book.book} topics={step.topics} variant="secondary" />
          ),
        };
      case 'knowledge':
        return {
          tag: t('next.tagKnowledge'),
          title: t('next.knowledge', { book, count: step.count }),
          action: <CommandHint command={commands.knowledge(t('next.topicDir'))} />,
        };
      case 'curricula':
        return {
          tag: t('next.tagCurriculum'),
          title: t('next.curricula'),
          action: (
            <Link to="/curricula" className={buttonClass('secondary')}>
              {t('curricula.add')}
            </Link>
          ),
        };
      case 'link':
        return {
          tag: t('next.tagCurriculum'),
          title: t('next.link', { book }),
          action: (
            <Link
              to={`/books/${encodeURIComponent(step.book.book.id)}/curriculum`}
              className={buttonClass('secondary')}
            >
              {t('next.linkAction')}
            </Link>
          ),
        };
      case 'review':
        return {
          tag: t('next.tagReview'),
          title: t('next.reviewShort', { number: step.topic.number, title: step.topic.title }),
          action: (
            <Link to={topicUrl(step.book.book.id, step.topic)} className={buttonClass('secondary')}>
              {t('next.open')}
              <ChevronRight className="size-4" />
            </Link>
          ),
        };
    }
  };

  return (
    <section aria-labelledby="next-steps" className="flex flex-col gap-3">
      <h2 id="next-steps" className="font-sans-black text-lg text-foreground">
        {t('next.title')}
      </h2>
      <div className="flex flex-wrap gap-3">
        <RecommendedStep step={first} />
        {rest.slice(0, 2).map((step) => {
          const card = side(step);
          return (
            <article
              key={`${step.kind}-${'book' in step ? step.book.book.id : ''}`}
              className="flex min-w-0 flex-[1_1_15rem] flex-col gap-2 rounded-xl border border-border bg-card p-4"
            >
              <span className="text-xs font-sans-black text-muted-foreground">{card.tag}</span>
              <h3 className="font-sans-black text-base leading-snug text-foreground">
                {card.title}
              </h3>
              <span className="flex-1" />
              {card.action}
            </article>
          );
        })}
      </div>
    </section>
  );
}
