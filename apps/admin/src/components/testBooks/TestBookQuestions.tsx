import { useTranslation } from 'react-i18next';
import type { TestBookEntry } from '@mytutor/types';
import { ErrorState, LoadingState, StatCard } from '@/components/ui';
import { useTestQuestions, useTopicCatalogue } from '@/features/testBooks/queries';
import { QuestionBrowser } from './QuestionBrowser';

type TestBookQuestionsProps = {
  book: TestBookEntry;
  questions: NonNullable<TestBookEntry['questions']>;
};

/** What was split from the book: counts, then every question to look through. */
export function TestBookQuestions({ book, questions }: TestBookQuestionsProps) {
  const { t } = useTranslation();
  const doc = useTestQuestions(questions.path);
  const catalogue = useTopicCatalogue(book.topics);
  const folder = questions.path.replace(/\/questions\.json$/, '');
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
        <StatCard
          label={t('testQuestions.stats.questions')}
          value={questions.total}
          detail={t('testQuestions.stats.pages', { read: questions.pagesRead, total: book.pages })}
        />
        <StatCard
          label={t('testQuestions.stats.answered')}
          value={questions.answered}
          tone="success"
        />
        <StatCard label={t('testQuestions.stats.linked')} value={questions.linked} tone="primary" />
        <StatCard
          label={t('testQuestions.stats.uncovered')}
          value={questions.uncovered}
          tone="accent"
        />
        <StatCard
          label={t('testQuestions.stats.flagged')}
          value={questions.flagged}
          tone={questions.flagged ? 'destructive' : 'neutral'}
        />
      </div>
      {doc.isPending ? (
        <LoadingState />
      ) : doc.isError ? (
        <ErrorState onRetry={() => void doc.refetch()} />
      ) : (
        <QuestionBrowser doc={doc.data} folder={folder} catalogue={catalogue.data ?? null} />
      )}
    </div>
  );
}
