import { useTranslation } from 'react-i18next';
import { ReviewHowCard } from '@/components/study/ReviewHowCard';
import { ReviewTodayCard } from '@/components/study/ReviewTodayCard';
import { UpcomingReviews } from '@/components/study/UpcomingReviews';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useReviewPlan } from '@/features/study/queries';

export default function ReviewScreen() {
  const { t } = useTranslation();
  const query = useReviewPlan();

  return (
    <Screen className="gap-3">
      <ScreenHeader title={t('study.review.title')} />
      {query.isPending ? <LoadingState /> : null}
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {query.data ? (
        <>
          {query.data.due.length > 0 ? (
            <ReviewTodayCard plan={query.data} />
          ) : (
            <EmptyState
              moment="correct"
              title={t('study.review.emptyTitle')}
              description={t('study.review.emptyBody')}
            />
          )}
          <ReviewHowCard plan={query.data} />
          <UpcomingReviews plan={query.data} />
        </>
      ) : null}
    </Screen>
  );
}
