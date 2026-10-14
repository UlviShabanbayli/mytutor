import { useTranslation } from 'react-i18next';
import type { TestQuestion, TopicCatalogue } from '@mytutor/types';
import { Badge } from '@/components/ui';

type QuestionLinksProps = { question: TestQuestion; catalogue: TopicCatalogue | null };

/** The textbook topics a question is keyed to, each with its role and why; and what is missing. */
export function QuestionLinks({ question, catalogue }: QuestionLinksProps) {
  const { t } = useTranslation();
  const topicOf = (bookId: string, number: string) =>
    catalogue?.topics.find((tp) => tp.bookId === bookId && tp.number === number) ?? null;
  const links = [...question.links].sort((a, b) =>
    a.role === b.role ? 0 : a.role === 'required' ? -1 : 1,
  );
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-sans-bold uppercase tracking-wide text-muted-foreground">
        {t('testQuestions.keys')}
      </span>
      {links.length === 0 && !question.uncovered ? (
        <span className="text-sm text-muted-foreground">{t('testQuestions.noKeys')}</span>
      ) : null}
      <ul className="flex flex-col gap-1.5">
        {links.map((link) => {
          const topic = topicOf(link.bookId, link.number);
          return (
            <li key={`${link.bookId}/${link.number}`} className="flex flex-col gap-0.5 text-sm">
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone={link.role === 'required' ? 'primary' : 'neutral'}>
                  {t(`testQuestions.role.${link.role}`)}
                </Badge>
                <span className="font-sans-bold text-foreground">
                  {topic
                    ? t('testQuestions.topic', {
                        grade: topic.grade ?? '?',
                        number: topic.number,
                        title: topic.title,
                      })
                    : link.number}
                </span>
                {link.confidence !== null ? (
                  <span className="text-xs text-muted-foreground">
                    {t('testQuestions.confidence', { value: Math.round(link.confidence * 100) })}
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-muted-foreground">{link.reason}</span>
            </li>
          );
        })}
      </ul>
      {question.uncovered ? (
        <p className="rounded-md bg-accent-muted px-3 py-2 text-sm text-foreground">
          <span className="font-sans-bold">{t('testQuestions.uncovered')}</span>{' '}
          {question.uncovered}
        </p>
      ) : null}
    </div>
  );
}
