import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, Text } from '@/components/ui';
import type { MockQuestion } from '@/features/exam/types';
import { cn } from '@/lib/cn';

type MockQuestionCardProps = {
  question: MockQuestion;
  number: number;
  /** Short unit name for the header ("Müxtəsər vurma"). */
  group: string;
  flagged: boolean;
  onToggleFlag: () => void;
};

/** The question: number and unit, the flag, the task, the expression and its source. */
export function MockQuestionCard({
  question,
  number,
  group,
  flagged,
  onToggleFlag,
}: MockQuestionCardProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('exam.run.questionA11y', { n: number })}
      className="gap-2.5 rounded-xl border border-border bg-surf p-3.5"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="overline" tone="muted" className="min-w-0 flex-shrink text-xs">
          {t('exam.run.questionLabel', { n: number, group })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('exam.run.flag')}
          accessibilityState={{ selected: flagged }}
          onPress={onToggleFlag}
          className={cn(
            'min-h-touch flex-row items-center gap-1.5 rounded-md border-2 px-3',
            flagged ? 'border-honey bg-raised' : 'border-border bg-surf active:bg-wax',
          )}
        >
          <Icon name="exam" size={18} color={flagged ? 'honey-text' : 'muted'} />
          <Text
            className={cn('font-sans-black text-sm', flagged ? 'text-honey-text' : 'text-muted')}
          >
            {flagged ? t('exam.run.flagged') : t('exam.run.flag')}
          </Text>
        </Pressable>
      </View>
      <Text className="font-sans-semibold text-md">{t(`exam.run.prompt.${question.prompt}`)}</Text>
      <Text className="py-1 text-center font-sans-black text-3xl">{question.expression}</Text>
      <SourceLine source={question.source} />
    </View>
  );
}
