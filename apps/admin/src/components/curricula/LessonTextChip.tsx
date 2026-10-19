import { useTranslation } from 'react-i18next';
import type { LessonEntry } from '@mytutor/types';
import { cn } from '@/lib/cn';

/** Whether a topic's lesson text is approved, or a draft waits; nothing before it is written. */
export function LessonTextChip({ lesson }: { lesson: LessonEntry | undefined }) {
  const { t } = useTranslation();
  if (!lesson || (!lesson.text && !lesson.draft)) return null;
  const waiting = lesson.draft;
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-sans-bold',
        waiting ? 'bg-accent-muted text-foreground' : 'bg-success-muted text-success',
      )}
    >
      {t(waiting ? 'curricula.textDraft' : 'curricula.textReady')}
    </span>
  );
}
