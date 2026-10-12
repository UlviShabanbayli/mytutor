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
import { coverage as coverageOf } from '@/features/curriculum/links';
import { useBookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { CoverageStats } from './CoverageStats';
import { CurriculumSelect } from './CurriculumSelect';
import { StandardCoverageList } from './StandardCoverageList';
import { TopicLinksList } from './TopicLinksList';

type BookCurriculumTabProps = { book: ContentBookEntry; structure: TextbookStructure };

/** Links the book's topics to the standards of its curriculum, and shows what is covered. */
export function BookCurriculumTab({ book, structure }: BookCurriculumTabProps) {
  const { t } = useTranslation();
  const bc = useBookCurriculum(book);
  const [view, setView] = useState<'topics' | 'standards'>('topics');
  const topicCount = structure.units.flatMap((u) =>
    u.items.filter((i) => i.type === 'topic'),
  ).length;

  if (bc.curricula.length === 0 && !bc.links.curriculumId)
    return (
      <EmptyState
        icon={<ListChecks className="size-6" />}
        title={t('links.noCurriculaTitle')}
        body={t('links.noCurriculaBody')}
      >
        <Link to="/curricula" className={buttonClass('primary')}>
          {t('links.goToCurricula')}
        </Link>
      </EmptyState>
    );

  const body = () => {
    if (!bc.links.curriculumId) return null;
    if (!bc.entry)
      return (
        <p className="flex items-start gap-2 rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('links.missingCurriculum')}
        </p>
      );
    if (bc.isPending) return <LoadingState />;
    if (!bc.curriculum) return <ErrorState onRetry={bc.refetch} />;
    const coverage = coverageOf(bc.links);
    return (
      <>
        <CoverageStats
          coverage={coverage}
          topicCount={topicCount}
          standards={bc.curriculum.standards}
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
          <TopicLinksList units={structure.units} curriculum={bc.curriculum} bc={bc} />
        ) : (
          <StandardCoverageList bookId={book.id} curriculum={bc.curriculum} coverage={coverage} />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <CurriculumSelect bc={bc} />
      {body()}
    </div>
  );
}
