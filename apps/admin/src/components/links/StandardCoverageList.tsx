import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { StandardSet } from '@mytutor/types';
import { Badge } from '@/components/ui';
import type { Coverage } from '@/features/standards/links';
import { groupStandards } from '@/features/standards/standards';
import { cn } from '@/lib/cn';

type StandardCoverageListProps = { bookId: string; standardSet: StandardSet; coverage: Coverage };

/** The standard set seen from the book: which topics cover each standard, and the gaps. */
export function StandardCoverageList({ bookId, standardSet, coverage }: StandardCoverageListProps) {
  const { t } = useTranslation();
  const checkId = useId();
  const [gapsOnly, setGapsOnly] = useState(false);
  const shown = standardSet.standards.filter(
    (s) => !gapsOnly || !coverage.topicsByCode.has(s.code),
  );
  const topicUrl = (topic: string) =>
    `/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(topic)}/source`;

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={checkId}
        className="flex min-h-11 cursor-pointer items-center gap-2 self-start text-sm text-foreground"
      >
        <input
          id={checkId}
          type="checkbox"
          checked={gapsOnly}
          onChange={(e) => setGapsOnly(e.target.checked)}
          className="size-4 accent-primary"
        />
        {t('links.gapsOnly')}
      </label>
      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('links.noGaps')}</p>
      ) : (
        groupStandards(shown).map((group) => (
          <section key={group.line ?? ''} className="rounded-lg border border-border bg-card">
            <h2 className="border-b border-border px-4 py-2 font-sans-bold text-sm text-primary">
              {group.line ?? t('standards.noLine')}
            </h2>
            <ul className="divide-y divide-border">
              {group.rows.map(({ standard, depth }) => {
                const topics = coverage.topicsByCode.get(standard.code) ?? [];
                return (
                  <li
                    key={standard.code}
                    className={cn(
                      'flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-start',
                      depth > 0 && 'sm:pl-9',
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 font-mono text-xs text-primary">
                        {standard.code}
                      </span>
                      <span className="min-w-0 text-foreground">{standard.text}</span>
                    </span>
                    <span className="flex shrink-0 flex-wrap gap-1 sm:max-w-[40%] sm:justify-end">
                      {topics.length ? (
                        topics.map((topic) => (
                          <Link
                            key={topic}
                            to={topicUrl(topic)}
                            className="rounded-full bg-success-muted px-2 py-0.5 font-sans-bold text-xs text-success hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {t('links.topicChip', { topic })}
                          </Link>
                        ))
                      ) : (
                        <Badge tone="accent">{t('links.notLinked')}</Badge>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
