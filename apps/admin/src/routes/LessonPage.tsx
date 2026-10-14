import { BookOpenCheck, FileText, ListChecks, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { LessonBookMaterial } from '@/components/lessons/LessonBookMaterial';
import { LessonSection } from '@/components/lessons/LessonSection';
import { Badge, buttonClass, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useKnowledge, useTopicSource } from '@/features/content/queries';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { lessonMaterial, pageList } from '@/features/lessons/material';
import { useLibrary } from '@/features/progress/useLibrary';
import { useTopicReview } from '@/features/review/useTopicReview';
import { NotFoundPage } from './NotFoundPage';

/**
 * A curriculum's lesson on one textbook topic: its text and video (made and approved here
 * later), then the book's worked examples and exercises, from approved knowledge only.
 */
export function LessonPage() {
  const { t } = useTranslation();
  const { curriculumId = '', bookId = '', number = '' } = useParams();
  const { index, library } = useLibrary();
  const curriculum = index.data?.curricula.find((c) => c.id === curriculumId) ?? null;
  const book = library.find((b) => b.book.id === bookId) ?? null;
  const topic = book?.topics.find((tp) => tp.number === number) ?? null;
  const entry = topic?.entry ?? null;
  const source = useTopicSource(entry?.source ?? null);
  const knowledge = useKnowledge(entry?.knowledge ?? null);
  const review = useTopicReview(bookId, entry);
  const base = `/curricula/${encodeURIComponent(curriculumId)}`;
  const topicUrl = `/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(number)}`;
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    { label: t('curricula.title'), to: '/curricula' },
    { label: curriculum?.title ?? '…', to: `${base}/topics` },
    { label: topic ? `${topic.number}. ${topic.title}` : number },
  ]);

  if (index.isPending || (book && !book.ready)) return <LoadingState />;
  if (index.isError) return <ErrorState onRetry={() => void index.refetch()} />;
  if (!curriculum || !book || !topic || !curriculum.textbooks.some((c) => c.bookId === bookId))
    return <NotFoundPage />;

  const header = (
    <header className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1">
        {source.data ? (
          <p className="font-sans-bold text-sm text-primary">
            {t('bookPage.unit', { index: source.data.topic.unit.index })} ·{' '}
            {source.data.topic.unit.title}
          </p>
        ) : null}
        <h1 className="font-sans-black text-3xl text-foreground">
          {topic.number}. {topic.title}
        </h1>
        <p className="text-sm text-muted-foreground">{bookTitle(book.book)}</p>
      </div>
      <Link to={`${topicUrl}/source`} className={buttonClass('secondary')}>
        <BookOpenCheck className="size-4" />
        {t('lessons.openInBook')}
      </Link>
    </header>
  );

  if (!entry?.knowledge)
    return (
      <div className="flex flex-col gap-5">
        {header}
        <EmptyState
          icon={<FileText className="size-6" />}
          title={t('lessons.noKnowledgeTitle')}
          body={t('lessons.noKnowledgeBody')}
        >
          <Link to={`${topicUrl}/source`} className={buttonClass('primary')}>
            {t('lessons.openInBook')}
          </Link>
        </EmptyState>
      </div>
    );
  if (source.isPending || knowledge.isPending || review.isPending) return <LoadingState />;
  if (source.isError || knowledge.isError || review.isError)
    return (
      <ErrorState
        onRetry={() => {
          void source.refetch();
          void knowledge.refetch();
          void review.refetch();
        }}
      />
    );

  const material = lessonMaterial(knowledge.data.items, review.data, source.data);
  const pages = [...new Set(material.examples.concat(material.exercises).flatMap((e) => e.pages))];

  return (
    <div className="flex flex-col gap-7">
      {header}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone={material.approved === material.total ? 'success' : 'accent'}>
          {t('lessons.approvedItems', { approved: material.approved, total: material.total })}
        </Badge>
        {pages.length ? (
          <span className="text-muted-foreground">
            {t('lessons.cite', { pages: pageList(pages.sort((a, b) => a - b)) })}
          </span>
        ) : null}
      </div>
      {material.approved === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={t('lessons.notApprovedTitle')}
          body={t('lessons.notApprovedBody')}
        >
          <Link to={`${topicUrl}/review`} className={buttonClass('primary')}>
            {t('topic.openReview')}
          </Link>
        </EmptyState>
      ) : null}
      <LessonSection icon={<FileText className="size-5" />} title={t('lessons.text')}>
        <EmptyState
          icon={<FileText className="size-6" />}
          title={t('lessons.noTextTitle')}
          body={t('lessons.noTextBody')}
        />
      </LessonSection>
      <LessonSection icon={<Video className="size-5" />} title={t('lessons.video')}>
        <EmptyState
          icon={<Video className="size-6" />}
          title={t('lessons.noVideoTitle')}
          body={t('lessons.noVideoBody')}
        />
      </LessonSection>
      <LessonBookMaterial material={material} source={source.data} topicDir={entry.dir} />
    </div>
  );
}
