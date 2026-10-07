import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OptionKey, Question } from '@mytutor/types';
import { Card, Icon, Text } from '@/components/ui';

type AnswerReviewItemProps = {
  number: number;
  question: Question;
  answer: OptionKey | undefined;
};

export function AnswerReviewItem({ number, question, answer }: AnswerReviewItemProps) {
  const { t } = useTranslation();
  const correct = answer === question.correctKey;

  return (
    <Card className="flex-row gap-3">
      <Icon
        name={correct ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={correct ? 'success' : 'destructive'}
        accessibilityLabel={correct ? t('session.correctTitle') : t('session.incorrectTitle')}
      />
      <View className="flex-1 gap-1">
        <Text variant="label">{`${number}. ${question.stem}`}</Text>
        <Text variant="caption" tone={correct ? 'success' : 'destructive'}>
          {answer ? t('result.yourAnswer', { key: answer }) : t('result.noAnswer')}
        </Text>
        {!correct ? (
          <Text variant="caption" tone="muted">
            {t('session.correctAnswer', { key: question.correctKey })}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
