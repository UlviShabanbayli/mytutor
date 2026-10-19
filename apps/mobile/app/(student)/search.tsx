import { SearchView } from '@/components/learn/SearchView';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useOnline, useRecentSearches, useSearchIndex } from '@/features/learn/queries';
import { useLearnStore } from '@/features/learn/store';

/** Search across the learn area: topics, lessons and questions on the phone. */
export default function SearchScreen() {
  const search = useSearchIndex();
  const online = useOnline();
  const recent = useRecentSearches();
  const addRecent = useLearnStore((s) => s.addRecentSearch);

  if (search.status === 'ready')
    return (
      <SearchView
        hive={search.hive}
        index={search.index}
        recent={recent}
        online={online}
        onSearched={addRecent}
      />
    );
  return (
    <Screen>
      <ScreenHeader title="" />
      {search.status === 'error' ? <ErrorState onRetry={search.retry} /> : <LoadingState />}
    </Screen>
  );
}
