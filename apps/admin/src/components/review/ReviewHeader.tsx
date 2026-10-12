import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass } from '@/components/ui';
import { cn } from '@/lib/cn';

type ReviewHeaderProps = {
  /** Where "Saxla və çıx" leads: decisions are already saved. */
  exitTo: string;
  unit: string;
  title: string;
  blocks: { done: number; total: number };
  items: { done: number; total: number };
};

/** The topic, its steps with "Review" as now, and how far the review got. */
export function ReviewHeader({ exitTo, unit, title, blocks, items }: ReviewHeaderProps) {
  const { t } = useTranslation();
  const steps = [
    { label: t('steps.source'), state: 'done' },
    { label: t('steps.knowledge'), state: 'done' },
    { label: t('review.stepNow'), state: 'now' },
    { label: t('steps.standards'), state: 'later' },
    { label: t('steps.lesson'), state: 'later' },
  ] as const;
  const percent = blocks.total ? Math.round((blocks.done / blocks.total) * 100) : 0;

  return (
    <header className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-2">
        <span className="text-sm font-sans-bold text-primary">{unit}</span>
        <h1 className="font-sans-black text-[28px] leading-tight text-foreground">{title}</h1>
        <ol
          aria-label={t('bookPage.steps.label')}
          className="flex flex-wrap items-center gap-1.5 text-xs font-sans-black"
        >
          {steps.map((step, i) => (
            <li
              key={step.label}
              aria-current={step.state === 'now' ? 'step' : undefined}
              className="flex items-center gap-1.5"
            >
              {i > 0 ? (
                <span aria-hidden className="text-muted-foreground/60">
                  →
                </span>
              ) : null}
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1',
                  step.state === 'done' && 'bg-success-muted text-success',
                  step.state === 'now' && 'bg-primary text-primary-foreground',
                  step.state === 'later' && 'bg-muted text-muted-foreground',
                )}
              >
                {i + 1} {step.label}
                {step.state === 'done' ? (
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <Link to={exitTo} className={buttonClass('secondary', 'h-12 rounded-md')}>
        {t('review.saveAndExit')}
      </Link>
      <div className="flex min-w-[16rem] flex-[0_1_19rem] flex-col gap-1.5 rounded-md border border-border bg-card px-3.5 py-3">
        <span className="flex text-[13px] font-sans-bold">
          <span className="flex-1 text-foreground">{t('review.blocks', blocks)}</span>
          <span className="text-muted-foreground">{t('review.items', items)}</span>
        </span>
        <span
          role="progressbar"
          aria-label={t('review.progress')}
          aria-valuemin={0}
          aria-valuemax={blocks.total}
          aria-valuenow={blocks.done}
          className="h-2 rounded-full bg-border"
        >
          <span className="block h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </span>
      </div>
    </header>
  );
}
