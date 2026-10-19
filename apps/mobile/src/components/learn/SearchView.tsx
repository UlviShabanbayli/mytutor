import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, EmptyState, Text } from '@/components/ui';
import { openTopic } from '@/features/learn/navigation';
import { MIN_QUERY, type SearchIndex, searchLearn } from '@/features/learn/search';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { FilterChips, type SearchFilter } from './FilterChips';
import { LessonHitRow } from './LessonHitRow';
import { QuestionHitRow } from './QuestionHitRow';
import { RecentChips } from './RecentChips';
import { SearchField } from './SearchField';
import { SearchSection } from './SearchSection';
import { TopicHitRow } from './TopicHitRow';

type SearchViewProps = {
  hive: Hive;
  index: SearchIndex;
  recent: string[];
  online: boolean;
  onSearched: (query: string) => void;
};

/** Questions shown before "Hamısı" opens the questions filter. */
const QUESTION_PREVIEW = 3;

/** Search over topics, lessons and questions, with the last searches and filters. */
export function SearchView({ hive, index, recent, online, onSearched }: SearchViewProps) {
  const { t } = useLearnText();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const found = searchLearn(index, query);
  const show = (f: SearchFilter) => filter === 'all' || filter === f;
  const questions =
    filter === 'questions' ? found.questions : found.questions.slice(0, QUESTION_PREVIEW);
  const pick = (q: string) => {
    setQuery(q);
    onSearched(q);
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <SearchField value={query} onChange={setQuery} onSubmit={() => onSearched(query)} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow gap-3 px-4 pb-4 pt-1"
      >
        {online ? null : <Banner kind="offline" message={t('learn.search.offline')} />}
        <RecentChips items={recent} onPick={pick} />
        {query.trim().length < MIN_QUERY ? (
          <Text tone="muted">{t('learn.search.hint')}</Text>
        ) : found.total === 0 ? (
          <EmptyState
            title={t('learn.search.emptyTitle', { query: query.trim() })}
            description={t('learn.search.emptyBody')}
          />
        ) : (
          <>
            <FilterChips value={filter} total={found.total} onChange={setFilter} />
            {show('topics') && found.topics.length > 0 ? (
              <SearchSection title={t('learn.search.topicsHeader', { count: found.topics.length })}>
                {found.topics.map((topic) => (
                  <TopicHitRow
                    key={topic.id}
                    hive={hive}
                    topic={topic}
                    query={query}
                    onPress={() => openTopic(topic.id)}
                  />
                ))}
              </SearchSection>
            ) : null}
            {show('lessons') && found.lessons.length > 0 ? (
              <SearchSection
                title={t('learn.search.lessonsHeader', { count: found.lessons.length })}
              >
                {found.lessons.map((hit) => (
                  <LessonHitRow
                    key={hit.id}
                    hit={hit}
                    query={query}
                    onPress={() =>
                      router.push({
                        pathname: '/lesson/[id]',
                        params: { id: hit.topic.id, step: 'lesson' },
                      })
                    }
                  />
                ))}
              </SearchSection>
            ) : null}
            {show('questions') && found.questions.length > 0 ? (
              <SearchSection
                title={t('learn.search.questionsHeader', { count: found.questions.length })}
                action={
                  filter === 'all' && found.questions.length > QUESTION_PREVIEW ? (
                    <Text
                      accessibilityRole="button"
                      onPress={() => setFilter('questions')}
                      className="px-1 py-3 font-sans-black text-sm text-honey-text"
                    >
                      {t('learn.search.allShort')}
                    </Text>
                  ) : null
                }
              >
                {questions.map((hit) => (
                  <QuestionHitRow
                    key={hit.id}
                    hive={hive}
                    hit={hit}
                    query={query}
                    onPress={() => openTopic(hit.topic.id)}
                  />
                ))}
              </SearchSection>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
