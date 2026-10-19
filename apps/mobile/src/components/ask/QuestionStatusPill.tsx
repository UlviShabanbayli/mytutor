import { useTranslation } from 'react-i18next';
import { StatusPill, type PillKind } from '@/components/ui';
import type { AskStatus } from '@/features/ask/types';

type QuestionStatusPillProps = {
  status: AskStatus;
  className?: string;
};

/** AI text stays marked "AI cavabı · yoxlanır" until a teacher approves it ("Hazırdır"). */
export function QuestionStatusPill({ status, className }: QuestionStatusPillProps) {
  const { t } = useTranslation();
  const pill: Record<AskStatus, { kind: PillKind; label: string }> = {
    queued: { kind: 'soon', label: t('ask.state.chipQueued') },
    sent: { kind: 'soon', label: t('ask.state.chipSent') },
    teacher_checking: { kind: 'ai', label: t('ask.state.chipAi') },
    answered: { kind: 'teacher', label: t('ask.state.chipReady') },
  };

  return <StatusPill kind={pill[status].kind} label={pill[status].label} className={className} />;
}
