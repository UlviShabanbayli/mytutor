import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { rightAnswer } from '@/features/tests/answers';
import { answerText } from '@/features/study/mistakes';
import { displayNumber } from '@/features/study/numericInput';
import type { SessionStep } from '@/features/study/types';
import { fontSize } from '@/theme';
import { MathText } from './MathText';

type AnswerCompareProps = {
  step: SessionStep;
  answer: string | undefined;
};

function Row({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={ok ? 'check' : 'x'} size={18} color={ok ? 'ok' : 'err'} />
      <View className="min-w-0 flex-1">
        <Text variant="caption" tone="muted" className="text-xs">
          {label}
        </Text>
        <MathText text={value} fontSize={fontSize.base[0]} className="font-sans-bold" />
      </View>
    </View>
  );
}

/** "Sənin cavabın" next to "Düzgün cavab"; for matching, the right pairs. */
export function AnswerCompare({ step, answer }: AnswerCompareProps) {
  const { t } = useTranslation();

  if (step.kind === 'match') {
    return (
      <View className="gap-1.5 rounded-lg bg-surf px-3 py-2">
        <Text variant="overline" tone="muted">
          {t('study.feedback.rightPairs')}
        </Text>
        {step.left.map((left, i) => (
          <Row key={left} ok label={left} value={step.right[step.pairs[i] ?? 0] ?? ''} />
        ))}
      </View>
    );
  }
  if (step.kind !== 'question') return null;

  const { question } = step;
  const show = (value: string) => (question.type === 'open' ? displayNumber(value) : value);
  return (
    <View className="gap-1.5 rounded-lg bg-surf px-3 py-2">
      <Row
        ok={false}
        label={t('study.feedback.yours')}
        value={answer ? show(answerText(question, answer)) : t('study.feedback.noAnswer')}
      />
      <Row
        ok
        label={t('study.feedback.right')}
        value={show(answerText(question, rightAnswer(question)))}
      />
    </View>
  );
}
