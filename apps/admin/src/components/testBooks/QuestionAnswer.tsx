import { useTranslation } from 'react-i18next';
import type { TestQuestion } from '@mytutor/types';
import { cn } from '@/lib/cn';
import { MathLine } from './MathLine';

/** The question's options or items as printed, with the book's answer marked. */
export function QuestionAnswer({ question }: { question: TestQuestion }) {
  const { t } = useTranslation();
  const { answer } = question;
  return (
    <div className="flex flex-col gap-2 text-sm">
      {question.options.length ? (
        <ul className="flex flex-col gap-1">
          {question.options.map((o) => (
            <li
              key={o.key}
              className={cn(
                'flex gap-2 rounded-md px-2 py-1',
                answer?.choice === o.key && 'bg-success-muted font-sans-bold text-success',
              )}
            >
              <span>{o.key})</span>
              <MathLine text={o.text} />
            </li>
          ))}
        </ul>
      ) : null}
      {question.matching ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <ul className="flex flex-col gap-1">
            {question.matching.left.map((o) => (
              <li key={o.key}>
                {o.key}. <MathLine text={o.text} />
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-1">
            {question.matching.right.map((o) => (
              <li key={o.key}>
                {o.key}. <MathLine text={o.text} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p
        className={cn(
          'rounded-md px-3 py-2',
          answer ? 'bg-success-muted text-foreground' : 'bg-accent-muted',
        )}
      >
        <span className="font-sans-bold">{t('testQuestions.answer')}</span>{' '}
        {!answer
          ? t('testQuestions.noAnswer')
          : answer.pairs
            ? Object.entries(answer.pairs)
                .map(([item, letters]) => `${item} → ${letters.join(', ')}`)
                .join('; ')
            : answer.printed}{' '}
        {answer ? (
          <span className="text-xs text-muted-foreground">
            {t('testQuestions.answerPage', { page: answer.printedPage ?? answer.page })}
          </span>
        ) : null}
      </p>
    </div>
  );
}
