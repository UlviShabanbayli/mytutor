import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { BookStats } from '@/features/progress/stages';
import { cn } from '@/lib/cn';

type BookStepsProps = { bookId: string; stats: BookStats; linkedTopics: number };

type Chip = { label: string; state: 'done' | 'current' | 'later'; to?: string };

/** The book's five steps in a row; the first unfinished one is "now". */
export function BookSteps({ bookId, stats, linkedTopics }: BookStepsProps) {
  const { t } = useTranslation();
  const n = stats.topics;
  const done = [
    stats.withSource === n,
    stats.withKnowledge === n,
    stats.approved === n && n > 0,
    linkedTopics === n && n > 0,
  ];
  const current = done.findIndex((d) => !d);
  const state = (i: number): Chip['state'] =>
    done[i] ? 'done' : i === current ? 'current' : 'later';
  const chips: Chip[] = [
    { label: t('bookPage.steps.source', { done: stats.withSource, total: n }), state: state(0) },
    {
      label: t('bookPage.steps.knowledge', { done: stats.withKnowledge, total: n }),
      state: state(1),
    },
    {
      label: [
        t('bookPage.steps.review', { done: stats.approved, total: n }),
        stats.inReview ? t('steps.inReview', { count: stats.inReview }) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      state: state(2),
    },
    {
      label: t('bookPage.steps.curriculum', { done: linkedTopics, total: n }),
      state: state(3),
      to: `/books/${encodeURIComponent(bookId)}/curriculum`,
    },
    { label: t('bookPage.steps.lesson'), state: 'later' },
  ];
  const look = {
    done: 'bg-success-muted text-success',
    current: 'bg-accent-muted text-foreground ring-[1.5px] ring-inset ring-accent',
    later: 'bg-muted text-muted-foreground',
  };

  return (
    <ol
      aria-label={t('bookPage.steps.label')}
      className="flex flex-wrap items-center gap-1.5 text-[13px] font-sans-bold"
    >
      {chips.map((chip, i) => {
        const body: ReactNode = (
          <>
            {chip.state === 'done' ? (
              <Check className="size-3.5" strokeWidth={2.6} aria-hidden />
            ) : null}
            {i + 1} {chip.label}
          </>
        );
        const className = cn('flex h-9 items-center gap-1.5 rounded-full px-3', look[chip.state]);
        return (
          <li
            key={i}
            aria-current={chip.state === 'current' ? 'step' : undefined}
            className="flex items-center gap-1.5"
          >
            {i > 0 ? (
              <span aria-hidden className="text-muted-foreground/60">
                →
              </span>
            ) : null}
            {chip.to ? (
              <Link to={chip.to} className={cn(className, 'hover:underline')}>
                {body}
              </Link>
            ) : (
              <span className={className}>{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
