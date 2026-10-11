import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PracticeTest, TestAnswers } from '@mytutor/types';
import { cn } from '@/lib/cn';

type SegmentedProgressProps = {
  test: PracticeTest;
  answers: TestAnswers;
  index: number;
  checked: boolean;
};

/** One segment per question: green/red once checked, violet for the current one. */
export function SegmentedProgress({ test, answers, index, checked }: SegmentedProgressProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('session.progress', {
        current: index + 1,
        total: test.questions.length,
      })}
      className="flex-1 flex-row gap-1.5"
    >
      {test.questions.map((q, i) => {
        const revealed = i < index || (i === index && checked);
        const correct = answers[q.id] === q.correctKey;
        return (
          <View
            key={q.id}
            className={cn(
              'h-2.5 flex-1 rounded-full',
              revealed
                ? correct
                  ? 'bg-success'
                  : 'bg-destructive'
                : i === index
                  ? 'bg-primary'
                  : 'bg-muted',
            )}
          />
        );
      })}
    </View>
  );
}
