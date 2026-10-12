import { ListChecks, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { ContentBookEntry, TextbookStructure } from '@mytutor/types';
import {
  buttonClass,
  EmptyState,
  ErrorState,
  LoadingState,
  SegmentedControl,
} from '@/components/ui';
import { coverage as coverageOf } from '@/features/standards/links';
import { useBookStandards } from '@/features/standards/useBookStandards';
import { CoverageStats } from './CoverageStats';
import { StandardSetSelect } from './StandardSetSelect';
import { StandardCoverageList } from './StandardCoverageList';
import { TopicLinksList } from './TopicLinksList';

type BookStandardsTabProps = { book: ContentBookEntry; structure: TextbookStructure };

/** Links the book's topics to the standards of its standard set, and shows what is covered. */
export function BookStandardsTab({ book, structure }: BookStandardsTabProps) {
  const { t } = useTranslation();
  const bs = useBookStandards(book);
  const [view, setView] = useState<'topics' | 'standards'>('topics');
  const topicCount = structure.units.flatMap((u) =>
    u.items.filter((i) => i.type === 'topic'),
  ).length;

  if (bs.standardSets.length === 0 && !bs.links.standardSetId)
    return (
      <EmptyState
        icon={<ListChecks className="size-6" />}
        title={t('links.noStandardSetsTitle')}
        body={t('links.noStandardSetsBody')}
      >
        <Link to="/standards" className={buttonClass('primary')}>
          {t('links.goToStandardSets')}
        </Link>
      </EmptyState>
    );

  const body = () => {
    if (!bs.links.standardSetId) return null;
    if (!bs.entry)
      return (
        <p className="flex items-start gap-2 rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('links.missingStandardSet')}
        </p>
      );
    if (bs.isPending) return <LoadingState />;
    if (!bs.standardSet) return <ErrorState onRetry={bs.refetch} />;
    const coverage = coverageOf(bs.links);
    return (
      <>
        <CoverageStats
          coverage={coverage}
          topicCount={topicCount}
          standards={bs.standardSet.standards}
        />
        <SegmentedControl
          label={t('links.view')}
          value={view}
          onChange={setView}
          options={[
            { value: 'topics', label: t('links.byTopic') },
            { value: 'standards', label: t('links.byStandard') },
          ]}
        />
        {view === 'topics' ? (
          <TopicLinksList units={structure.units} standardSet={bs.standardSet} bs={bs} />
        ) : (
          <StandardCoverageList bookId={book.id} standardSet={bs.standardSet} coverage={coverage} />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <StandardSetSelect bs={bs} />
      {body()}
    </div>
  );
}
