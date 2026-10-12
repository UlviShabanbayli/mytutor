import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OptionKey, Question } from '@mytutor/types';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type AnswerReviewItemProps = {
  number: number;
  question: Question;
  answer: OptionKey | undefined;
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
      <View className="h-7 w-7 items-center justify-center rounded-full bg-destructive-muted">
        <Text className="font-sans-black text-xs text-destructive">{number}</Text>
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-sans-medium">{question.stem}</Text>
        <Text variant="caption" tone="muted">
          {`${answer ? t('result.yourAnswer', { key: answer }) : t('result.noAnswer')} · ${t('session.correctAnswer', { key: question.correctKey })}`}
        </Text>
      </View>
    </View>
  );
}
