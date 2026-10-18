import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Question } from '@mytutor/types';
import { Text } from '@/components/ui';
import { rightAnswer } from '@/features/tests/answers';
import { cn } from '@/lib/cn';
import { fontSize } from '@/theme';
import { MathText } from './MathText';

type AnswerReviewItemProps = {
  number: number;
  question: Question;
  /** The option chosen or the number typed. */
  answer: string | undefined;
  divider?: boolean;
};

/** A missed question: its number, the stem, the student's answer and the right one. */
export function AnswerReviewItem({
  number,
  question,
  answer,
  divider = false,
}: AnswerReviewItemProps) {
  const { t } = useTranslation();

  return (
    <View className={cn('flex-row gap-3 px-4 py-3', divider && 'border-b border-border')}>
      <View className="h-7 w-7 items-center justify-center rounded-full bg-err-bg">
        <Text className="font-sans-black text-xs text-err">{number}</Text>
      </View>
      <View className="flex-1 gap-1">
        <MathText text={question.stem} fontSize={fontSize.base[0]} className="font-sans-medium" />
        <Text variant="caption" tone="muted">
          {`${answer ? t('result.yourAnswer', { key: answer }) : t('result.noAnswer')} · ${t('session.correctAnswer', { key: rightAnswer(question) })}`}
        </Text>
      </View>
    </View>
  );
}
