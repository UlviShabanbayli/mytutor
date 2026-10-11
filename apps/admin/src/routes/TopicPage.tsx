import { BookText, BrainCircuit, Clapperboard, FileSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { KnowledgeMissing } from '@/components/knowledge/KnowledgeMissing';
import { KnowledgeTab } from '@/components/knowledge/KnowledgeTab';
import { LessonTab } from '@/components/lesson/LessonTab';
import { SourceTab } from '@/components/source/SourceTab';
import {
  Badge,
  Breadcrumbs,
  CommandHint,
  EmptyState,
  ErrorState,
  LoadingState,
  TabNav,
} from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useBook, useKnowledge, useTopicSource } from '@/features/content/queries';
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

  if (book.isPending) return <LoadingState />;
  if (book.isError) return <ErrorState onRetry={() => void book.refetch()} />;
  if (!book.data || !isTab(tab)) return <NotFoundPage />;

  const crumbs = [
    { label: t('books.title'), to: '/' },
    { label: bookTitle(book.data), to: `/books/${encodeURIComponent(bookId)}` },
    { label: number },
  ];

  if (!entry) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs items={crumbs} />
        <EmptyState
          icon={<FileSearch className="size-6" />}
          title={t('topic.notReadyTitle')}
          body={t('topic.notReadyBody')}
        >
          <CommandHint command={commands.source(number)} />
        </EmptyState>
      </div>
    );
  }

  const base = `/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(number)}`;
  const title = source.data ? `${number}. ${source.data.topic.title}` : number;
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
    return <KnowledgeTab doc={knowledge.data} source={source.data} topicDir={entry.dir} />;
  };

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: title } : c))} />
      <header className="flex flex-col gap-1">
        {source.data ? (
          <p className="font-sans-bold text-sm text-primary">
            {t('curriculum.unit', { index: source.data.topic.unit.index })} ·{' '}
            {source.data.topic.unit.title}
          </p>
        ) : null}
        <h1 className="font-sans-black text-3xl text-foreground">{title}</h1>
      </header>
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
