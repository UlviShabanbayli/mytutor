import { FileText, ListChecks, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { LessonBookMaterial } from '@/components/lessons/LessonBookMaterial';
import { LessonHeader } from '@/components/lessons/LessonHeader';
import { LessonSection } from '@/components/lessons/LessonSection';
import { LessonTextPanel } from '@/components/lessons/LessonTextPanel';
import { Badge, buttonClass, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useKnowledge, useTopicSource } from '@/features/content/queries';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { useAnswerKey } from '@/features/lessons/answers';
import { itemPages, lessonMaterial, pageList } from '@/features/lessons/material';
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
  const answerKey = useAnswerKey(book?.book.answers ?? null);
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
    <LessonHeader
      unit={source.data?.topic.unit ?? null}
      title={`${topic.number}. ${topic.title}`}
      book={bookTitle(book.book)}
      topicUrl={topicUrl}
    />
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
  if (source.isPending || knowledge.isPending || review.isPending || answerKey.isPending)
    return <LoadingState />;
  if (source.isError || knowledge.isError || review.isError || answerKey.isError)
    return (
      <ErrorState
        onRetry={() => {
          void source.refetch();
          void knowledge.refetch();
          void review.refetch();
          void answerKey.refetch();
        }}
      />
    );

  const material = lessonMaterial(
    knowledge.data.items,
    review.data,
    source.data,
    answerKey.data?.answers,
  );
  const pagesById = itemPages(knowledge.data.items);
  const pagesOf = (ids: string[]) =>
    [...new Set(ids.flatMap((id) => pagesById.get(id) ?? []))].sort((a, b) => a - b);
  const lessonPath =
    curriculum.lessons.find((l) => l.bookId === bookId && l.number === number)?.path ?? null;
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
        <LessonTextPanel
          lessonRef={{ curriculumId, bookId, number }}
          path={lessonPath}
          canWrite={material.approved > 0}
          pagesOf={pagesOf}
        />
      </LessonSection>
      <LessonSection icon={<Video className="size-5" />} title={t('lessons.video')}>
        <EmptyState
          icon={<Video className="size-6" />}
          title={t('lessons.noVideoTitle')}
          body={t('lessons.noVideoBody')}
        />
      </LessonSection>
      <LessonBookMaterial
        material={material}
        source={source.data}
        topicDir={entry.dir}
        bookId={bookId}
        hasAnswerKey={answerKey.data !== null}
      />
    </div>
  );
}
