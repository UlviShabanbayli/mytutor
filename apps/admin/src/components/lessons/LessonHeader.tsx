import { BookOpenCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass } from '@/components/ui';

type LessonHeaderProps = {
  unit: { index: number; title: string } | null;
  title: string;
  book: string;
  /** The topic's page in its book. */
  topicUrl: string;
};

/** A lesson's unit, title and book, with the way back to the topic in the book. */
export function LessonHeader({ unit, title, book, topicUrl }: LessonHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1">
        {unit ? (
          <p className="font-sans-bold text-sm text-primary">
            {t('bookPage.unit', { index: unit.index })} · {unit.title}
          </p>
        ) : null}
        <h1 className="font-sans-black text-3xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{book}</p>
      </div>
      <Link to={`${topicUrl}/source`} className={buttonClass('secondary')}>
        <BookOpenCheck className="size-4" />
        {t('lessons.openInBook')}
      </Link>
    </header>
  );
}
