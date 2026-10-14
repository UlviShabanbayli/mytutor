import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LessonApprovedNoticeProps = {
  /** The lesson whose text was just approved, as "1.3. Title". */
  title: string;
  /** Other drafts still waiting in the curriculum, this page's among them. */
  waiting: number;
  /** True when the approved lesson is this page's: nothing else was waiting. */
  last: boolean;
};

/** Says the last text was approved, and that this page is the next one to read and approve. */
export function LessonApprovedNotice({ title, waiting, last }: LessonApprovedNoticeProps) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-success-muted p-4 text-success"
    >
      <CheckCircle2 className="size-5 shrink-0" aria-hidden />
      <span className="flex-[1_1_18rem] text-sm">
        <span className="font-sans-bold">{t('lessons.approvedTitle', { title })}</span>{' '}
        {last ? t('lessons.approvedLast') : t('lessons.approvedNext', { count: waiting })}
      </span>
    </div>
  );
}
