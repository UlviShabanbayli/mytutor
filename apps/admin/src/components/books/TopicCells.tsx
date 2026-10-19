import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { topicUrl } from '@/features/progress/search';
import type { UnitData } from '@/features/progress/stages';
import { cn } from '@/lib/cn';
import { stageFill } from './stageTone';

type TopicCellsProps = { bookId: string; units: UnitData[] };

/** One cell per topic, grouped by unit: the book's progress at a glance. Each cell opens its topic. */
export function TopicCells({ bookId, units }: TopicCellsProps) {
  const { t } = useTranslation();
  return (
    <div className="min-w-0 overflow-x-auto">
      <ul className="flex min-w-[36rem] gap-[3px] pt-1">
        {units.map((unit, u) => (
          <Fragment key={unit.index}>
            {u > 0 ? <li aria-hidden className="w-1.5 shrink-0" /> : null}
            {unit.topics.map((topic) => {
              const flagged = topic.entry?.review?.openFlagged ?? 0;
              const label = [
                `${topic.number}. ${topic.title}`,
                t(`stage.${topic.stage}`),
                flagged ? t('stage.flaggedCount', { count: flagged }) : null,
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <li key={topic.number} className="min-w-[22px] flex-1">
                  <Link
                    to={topicUrl(bookId, topic)}
                    aria-label={label}
                    className={cn(
                      'relative flex h-8 items-center justify-center rounded-[6px] text-[10px] font-sans-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      stageFill[topic.stage],
                    )}
                  >
                    {topic.number}
                    {flagged ? (
                      <span
                        aria-hidden
                        className="absolute -right-[3px] -top-[3px] size-2.5 rounded-full border-2 border-card bg-destructive"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
