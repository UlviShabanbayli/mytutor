import { useTranslation } from 'react-i18next';
import type { TestQuestion, TopicCatalogue } from '@mytutor/types';
import { Badge } from '@/components/ui';
import { contentUrl } from '@/features/content/api';
import { MathLine } from './MathLine';
import { QuestionAnswer } from './QuestionAnswer';
import { QuestionLinks } from './QuestionLinks';

type QuestionCardProps = {
  question: TestQuestion;
  /** The test book's folder: crops and figures are relative to it. */
  folder: string;
  catalogue: TopicCatalogue | null;
};

/** One question: the printed cut-out beside what was read from it, its answer and its keys. */
export function QuestionCard({ question, folder, catalogue }: QuestionCardProps) {
  const { t } = useTranslation();
  const flag = (f: string) => {
    const [code = '', detail = ''] = f.split(/:\s(.*)/s);
    return t(`testQuestions.flags.${code}`, { defaultValue: code, detail });
  };
  return (
    <article className="grid gap-4 rounded-lg border border-border bg-card p-4 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3">
        <header className="flex flex-wrap items-center gap-2">
          <span className="font-sans-black text-lg text-foreground">№ {question.number}</span>
          <Badge tone="primary">{t(`testQuestions.type.${question.type}`)}</Badge>
          {question.pages.map((p) => (
            <span key={p.page} className="text-xs text-muted-foreground">
              {t('testQuestions.page', { page: p.printedPage ?? p.page })}
            </span>
          ))}
        </header>
        {question.flags.length ? (
          <ul className="flex flex-col gap-1">
            {question.flags.map((f) => (
              <li
                key={f}
                className="rounded-md bg-destructive-muted px-2 py-1 text-xs text-destructive"
              >
                {flag(f)}
              </li>
            ))}
          </ul>
        ) : null}
        {question.crops.map((crop) => (
          <img
            key={crop}
            src={contentUrl(folder, crop)}
            alt={t('testQuestions.printed', { number: question.number })}
            loading="lazy"
            className="w-full max-w-xl rounded-md border border-border bg-white"
          />
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {question.situation ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
            <span className="font-sans-bold">{question.situation.title}.</span>{' '}
            <MathLine text={question.situation.text} />
          </p>
        ) : null}
        <MathLine text={question.stem} className="text-[15px] leading-relaxed text-foreground" />
        {question.figures.map((figure) => (
          <img
            key={figure}
            src={contentUrl(folder, figure)}
            alt={t('testQuestions.figure', { number: question.number })}
            loading="lazy"
            className="max-h-72 w-auto self-start rounded-md border border-border bg-white"
          />
        ))}
        <QuestionAnswer question={question} />
        <QuestionLinks question={question} catalogue={catalogue} />
      </div>
    </article>
  );
}
