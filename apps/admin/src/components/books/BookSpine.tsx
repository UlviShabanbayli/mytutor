import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

const GRADE = /(\d{1,2})-c[iıuü]\s+sinif/iu;
const PART = /(\d)-(c[iıuü])\s+hiss/iu;

type BookSpineProps = { title: string; strong?: boolean };

/** A small book cover: the grade large and the part below, read from the title. */
export function BookSpine({ title, strong = false }: BookSpineProps) {
  const { t } = useTranslation();
  const grade = GRADE.exec(title)?.[1];
  const partMatch = PART.exec(title);
  const part = partMatch ? `${partMatch[1]}-${partMatch[2]}` : null;
  return (
    <div
      aria-hidden
      className={cn(
        'flex h-[62px] w-12 shrink-0 flex-col items-center justify-center rounded-[10px]',
        strong ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
      )}
    >
      {grade ? (
        <>
          <span className="font-sans-black text-[22px] leading-none">{grade}</span>
          {part ? (
            <span className="text-[9px] font-sans-black">{t('books.part', { part })}</span>
          ) : null}
        </>
      ) : (
        <BookOpen className="size-6" />
      )}
    </div>
  );
}
