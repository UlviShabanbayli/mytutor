import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OptionKey } from '@mytutor/types';
import { AnswerOption, SourceLine, Text } from '@/components/ui';
import type { MockQuestion } from '@/features/exam/types';

type MockReviewItemProps = {
  question: MockQuestion;
  number: number;
  answer: OptionKey | undefined;
};

/** A missed question after the mock: the student's answer, the right one, and the source. */
export function MockReviewItem({ question, number, answer }: MockReviewItemProps) {
  const { t } = useTranslation();
  const chosen = question.options.find((o) => o.key === answer);
  const right = question.options.find((o) => o.key === question.correctKey);

  return (
    <View className="gap-2 rounded-xl border border-border bg-surf p-3.5">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('exam.run.questionA11y', { n: number })}
      </Text>
      <Text className="font-sans-semibold text-base">
        {`${t(`exam.run.prompt.${question.prompt}`)} ${question.expression}`}
      </Text>
      <Text tone="muted" className="font-sans-bold text-xs">
        {t('exam.result.yourAnswer')}
      </Text>
      {chosen ? (
        <AnswerOption
          letter={chosen.key}
          state="wrong"
          accessibilityLabel={t('session.optionLabel', { key: chosen.key, text: chosen.text })}
        >
          <Text className="font-sans-semibold text-base">{chosen.text}</Text>
        </AnswerOption>
      ) : (
        <Text tone="muted" className="text-sm">
          {t('exam.result.noAnswer')}
        </Text>
      )}
      <Text tone="muted" className="font-sans-bold text-xs">
        {t('exam.result.rightAnswer')}
      </Text>
      {right ? (
        <AnswerOption
          letter={right.key}
          state="correct"
          accessibilityLabel={t('session.optionLabel', { key: right.key, text: right.text })}
        >
          <Text className="font-sans-semibold text-base">{right.text}</Text>
        </AnswerOption>
      ) : null}
      <SourceLine source={question.source} />
    </View>
  );
}
