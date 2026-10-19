import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { evidenceText } from '@/features/exam/labels';
import type { StepReason } from '@/features/exam/types';

type StepReasonTextProps = {
  reason: StepReason;
};

/** Why a step is in today's plan: "Son 3 sınaqda 7 səhv", "Dünəndən köçürülüb". */
export function StepReasonText({ reason }: StepReasonTextProps) {
  const { t } = useTranslation();
  const text = (() => {
    switch (reason.kind) {
      case 'chainRoot':
        return t('exam.steps.reason.chainRoot', { topic: reason.topic });
      case 'mockErrors':
        return evidenceText(t, { kind: 'recent', mocks: reason.mocks, errors: reason.errors });
      case 'questions':
        return t('exam.steps.reason.questions', {
          questions: t('common.questionsCount', { count: reason.count }),
          range: reason.range,
        });
      case 'moved':
        return t('exam.steps.reason.moved');
    }
  })();

  return (
    <Text tone="muted" className="text-xs">
      {text}
    </Text>
  );
}
