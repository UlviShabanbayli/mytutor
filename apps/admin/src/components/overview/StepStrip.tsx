import { useTranslation } from 'react-i18next';
import type { BookStats } from '@/features/progress/stages';
import { cn } from '@/lib/cn';
import { PIPELINE_STEPS, STANDARDS_ENABLED } from '@/lib/features';

type StepStripProps = {
  stats: BookStats;
  /** Topic and item links to standard sets across books. */
  links: number;
  standardSets: number;
};

type Step = {
  title: string;
  body: string;
  value: string | null;
  unit?: string;
  progress?: number;
  footer?: string;
  attention?: boolean;
  later?: boolean;
};

/** The five steps from textbook to lesson, with how much is done and what waits. */
export function StepStrip({ stats, links, standardSets }: StepStripProps) {
  const { t } = useTranslation();
  const ratio = (done: number, total: number) => (total ? done / total : 0);
  const waiting = stats.topics - stats.withSource;
  const steps: Step[] = [
    {
      title: t('steps.source'),
      body: t('steps.sourceBody'),
      value: String(stats.withSource),
      unit: t('steps.ofTopics', { count: stats.topics }),
      progress: ratio(stats.withSource, stats.topics),
      footer: waiting ? t('steps.waiting', { count: waiting }) : t('steps.allDone'),
      attention: waiting > 0,
    },
    {
      title: t('steps.knowledge'),
      body: t('steps.knowledgeBody'),
      value: String(stats.withKnowledge),
      unit: t('steps.ofTopics', { count: stats.topics }),
      progress: ratio(stats.withKnowledge, stats.topics),
      footer: t('steps.itemsCost', {
        items: groupDigits(stats.items),
        cost: stats.costUsd.toFixed(2),
      }),
    },
    {
      title: t('steps.review'),
      body: t('steps.reviewBody'),
      value: String(stats.approved),
      unit: t('steps.ofApproved', { count: stats.withKnowledge }),
      progress: ratio(stats.approved, stats.withKnowledge),
      footer: stats.inReview
        ? t('steps.inReview', { count: stats.inReview })
        : t('steps.flagged', { count: stats.openFlagged }),
      attention: stats.withKnowledge > stats.approved,
    },
    ...(STANDARDS_ENABLED
      ? [
          {
            title: t('steps.standards'),
            body: t('steps.standardsBody'),
            value: String(links),
            unit: t('steps.links'),
            footer: standardSets
              ? t('steps.standardSets', { count: standardSets })
              : t('steps.noStandardSets'),
          },
        ]
      : []),
    { title: t('steps.lesson'), body: t('steps.lessonBody'), value: null, later: true },
  ];

  return (
    <section
      aria-label={t('steps.label', { count: PIPELINE_STEPS })}
      className="rounded-xl border border-border bg-card p-1.5"
    >
      <ol className="grid gap-1 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={cn(
              'flex flex-col gap-1.5 rounded-[18px] p-3.5',
              step.attention && 'bg-accent-muted ring-[1.5px] ring-inset ring-accent/60',
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-sans-black',
                  step.later
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  'font-sans-black text-[15px]',
                  step.later ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step.title}
              </span>
            </span>
            <span className="min-h-[34px] text-xs leading-snug text-muted-foreground">
              {step.body}
            </span>
            {step.value === null ? (
              <span className="font-sans-black text-xl text-muted-foreground">{t('nav.soon')}</span>
            ) : (
              <span className="font-sans-black text-2xl text-foreground">
                {step.value}
                <span className="text-sm text-muted-foreground"> {step.unit}</span>
              </span>
            )}
            {step.progress !== undefined ? (
              <span className="h-1.5 rounded-full bg-muted">
                <span
                  className="block h-1.5 rounded-full bg-primary"
                  style={{ width: `${Math.round(step.progress * 100)}%` }}
                />
              </span>
            ) : null}
            {step.footer ? (
              <span
                className={cn(
                  'text-xs font-sans-bold',
                  step.attention ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.footer}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** "1 497": Azerbaijani groups thousands with a space (browsers may lack the locale). */
const groupDigits = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
