import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Text } from '@/components/ui';
import { rightAnswer } from '@/features/tests/answers';
import { answerText } from '@/features/study/mistakes';
import { displayNumber } from '@/features/study/numericInput';
import { useResetMistakesRun } from '@/features/study/queries';
import { stepVerdict } from '@/features/study/steps';
import type { SessionStep } from '@/features/study/types';
import { AnswerReviewItem } from './AnswerReviewItem';

type ResultMistakesProps = {
  steps: SessionStep[];
  answers: Record<string, string>;
};

/** "Səhvlər · 2": each missed question (opens "Səhvlərim") and a way to practise them again. */
export function ResultMistakes({ steps, answers }: ResultMistakesProps) {
  const { t } = useTranslation();
  const resetMistakesRun = useResetMistakesRun();
  const missed = steps
    .map((step, i) => ({ step, number: i + 1 }))
    .filter(({ step }) => stepVerdict(step, answers[step.id]) === 'wrong');

  const caption = (step: SessionStep) => {
    if (step.kind !== 'question') return t('study.feedback.rightPairs');
    const show = (v: string) => (step.question.type === 'open' ? displayNumber(v) : v);
    const right = show(rightAnswer(step.question));
    const yours = answers[step.id] ? show(answers[step.id] ?? '') : '';
    return yours
      ? t('study.result.yourShort', { yours, right })
      : t('study.result.noAnswerShort', { right });
  };

  if (missed.length === 0) {
    return (
      <View className="flex-row items-center gap-3 rounded-lg border border-ok bg-ok-bg p-3.5">
        <Icon name="check" size={24} color="ok" />
        <Text className="flex-1 font-sans-bold text-ok">{t('study.result.noMistakes')}</Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Text variant="heading" className="text-md">
        {t('study.result.mistakesTitle', { count: missed.length })}
      </Text>
      {missed.map(({ step, number }) => {
        const stem = step.kind === 'question' ? step.question.stem : step.prompt;
        const spoken =
          step.kind === 'question' ? answerText(step.question, answers[step.id]) : caption(step);
        return (
          <AnswerReviewItem
            key={step.id}
            number={number}
            stem={stem}
            caption={caption(step)}
            accessibilityLabel={`${number}. ${stem}. ${spoken}`}
            onPress={() => router.push('/mistakes')}
          />
        );
      })}
      <Button
        label={t('study.result.repeatMistakes')}
        variant="secondary"
        icon="refresh"
        onPress={() => {
          resetMistakesRun();
          router.push({ pathname: '/test/[id]', params: { id: 'mistakes' } });
        }}
      />
    </View>
  );
}
