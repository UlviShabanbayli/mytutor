import { BookText, BrainCircuit, Clapperboard, FileSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { ExtractSourceButton } from '@/components/books/ExtractSourceButton';
import { KnowledgeMissing } from '@/components/knowledge/KnowledgeMissing';
import { LessonTab } from '@/components/lesson/LessonTab';
import { LinkedKnowledgeTab } from '@/components/links/LinkedKnowledgeTab';
import { TopicStandards } from '@/components/links/TopicStandards';
import { SourceTab } from '@/components/source/SourceTab';
import {
  Badge,
  buttonClass,
  CommandHint,
  EmptyState,
  ErrorState,
  LoadingState,
  TabNav,
} from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useBook, useKnowledge, useTopicSource } from '@/features/content/queries';
import { useBookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { commands } from '@/lib/commands';
import { NotFoundPage } from './NotFoundPage';

const TABS = ['source', 'knowledge', 'lesson'] as const;
type TabKey = (typeof TABS)[number];
const isTab = (value: string | undefined): value is TabKey => TABS.some((tab) => tab === value);

export function TopicPage() {
  const { t } = useTranslation();
  const { bookId = '', number = '', tab } = useParams();
  const book = useBook(bookId);
  const entry = book.data?.topics.find((topic) => topic.number === number) ?? null;
  const source = useTopicSource(entry?.source ?? null);
  const knowledge = useKnowledge(entry?.knowledge ?? null);
  const bc = useBookCurriculum(book.data);
  const title = source.data ? `${number}. ${source.data.topic.title}` : number;
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    {
      label: book.data ? bookTitle(book.data) : t('nav.books'),
      to: `/books/${encodeURIComponent(bookId)}`,
    },
    { label: title },
  ]);

  if (book.isPending) return <LoadingState />;
  if (book.isError) return <ErrorState onRetry={() => void book.refetch()} />;
  if (!book.data || !isTab(tab)) return <NotFoundPage />;

  if (!entry) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          icon={<FileSearch className="size-6" />}
          title={t('topic.notReadyTitle')}
          body={t('topic.notReadyBody')}
        >
          {book.data.canExtract ? (
            <ExtractSourceButton bookId={bookId} topic={number} />
          ) : (
            <CommandHint command={commands.source(number)} />
          )}
        </EmptyState>
      </div>
    );
  }

  const base = `/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(number)}`;
  const content = () => {
    if (source.isPending) return <LoadingState />;
    if (source.isError) {
      return <ErrorState onRetry={() => void source.refetch()} detail={source.error.message} />;
    }
    if (tab === 'source') return <SourceTab source={source.data} topicDir={entry.dir} />;
    if (tab === 'lesson') return <LessonTab />;
    if (!entry.knowledge) return <KnowledgeMissing topicDir={entry.dir} />;
    if (knowledge.isPending) return <LoadingState />;
    if (knowledge.isError) {
      return (
        <ErrorState onRetry={() => void knowledge.refetch()} detail={knowledge.error.message} />
      );
    }
    return (
      <LinkedKnowledgeTab
        doc={knowledge.data}
        source={source.data}
        topicDir={entry.dir}
        topic={number}
        bc={bc}
      />
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-[1_1_24rem] flex-col gap-1">
          {source.data ? (
            <p className="font-sans-bold text-sm text-primary">
              {t('bookPage.unit', { index: source.data.topic.unit.index })} ·{' '}
              {source.data.topic.unit.title}
            </p>
          ) : null}
          <h1 className="font-sans-black text-3xl text-foreground">{title}</h1>
        </div>
        {entry.knowledge ? (
          <Link to={`${base}/review`} className={buttonClass('primary')}>
            {t('topic.openReview')}
          </Link>
        ) : null}
      </header>
      <TopicStandards bookId={bookId} topic={number} title={title} bc={bc} />
      <TabNav
        label={title}
        tabs={[
          {
            to: `${base}/source`,
            label: t('topic.tabs.source'),
            icon: <BookText className="size-4" />,
          },
          {
            to: `${base}/knowledge`,
            label: t('topic.tabs.knowledge'),
            icon: <BrainCircuit className="size-4" />,
            badge: knowledge.data ? <Badge>{knowledge.data.items.length}</Badge> : null,
          },
          {
            to: `${base}/lesson`,
            label: t('topic.tabs.lesson'),
            icon: <Clapperboard className="size-4" />,
          },
        ]}
      />
      {content()}
    </div>
  );
}
