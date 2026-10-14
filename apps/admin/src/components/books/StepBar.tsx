import { useTranslation } from 'react-i18next';
import type { TopicRowData } from '@/features/progress/stages';
import { cn } from '@/lib/cn';
import { STANDARDS_ENABLED } from '@/lib/features';

type Segment = 'done' | 'current' | 'queued' | 'none';

const fill: Record<Segment, string> = {
  done: 'bg-success',
  current: 'bg-accent',
  queued: 'bg-primary/30',
  none: 'bg-border',
};

/** A topic's steps (source, knowledge, review, standard set when on, lesson) as a small bar. */
export function topicSegments(topic: TopicRowData, linked: boolean): Segment[] {
  const order = ['none', 'source', 'knowledge', 'review', 'approved'];
  const at = order.indexOf(topic.stage);
  const standards: Segment[] = STANDARDS_ENABLED ? [linked ? 'done' : 'none'] : [];
  return [
    at >= 1 ? 'done' : 'queued',
    at >= 2 ? 'done' : at === 1 ? 'queued' : 'none',
    topic.stage === 'approved'
      ? 'done'
      : topic.stage === 'review'
        ? 'current'
        : at === 2
          ? 'queued'
          : 'none',
    ...standards,
    'none',
  ];
}

type StepBarProps = { topic: TopicRowData; linked: boolean };

export function StepBar({ topic, linked }: StepBarProps) {
  const { t } = useTranslation();
  const review = topic.entry?.review;
  const items = topic.entry?.summary?.items ?? 0;
  const label =
    topic.stage === 'review' && review
      ? t('bookPage.inReview', { done: review.decidedItems, total: items })
      : t(`bookPage.stageLabel.${topic.stage}`);
  return (
    <span className="flex flex-col gap-1">
      <span className="flex gap-[3px]" aria-hidden>
        {topicSegments(topic, linked).map((segment, i) => (
          <span key={i} className={cn('h-1.5 w-4 rounded-full', fill[segment])} />
        ))}
      </span>
      <span
        className={cn(
          'text-xs',
          topic.stage === 'review'
            ? 'font-sans-black text-foreground'
            : 'font-sans-bold text-muted-foreground',
        )}
      >
        {label}
      </span>
    </span>
  );
}

/** What the bar's colours mean; shown under each unit's table. */
export function StepBarLegend() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
      <span className="font-sans-bold">{t('bookPage.barLegend')}</span>
      <span>{t('bookPage.barSteps')}</span>
      {(['done', 'current', 'queued'] as const).map((segment) => (
        <span key={segment} className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-4 rounded-full', fill[segment])} aria-hidden />
          {t(`bookPage.segment.${segment}`)}
        </span>
      ))}
    </div>
  );
}
