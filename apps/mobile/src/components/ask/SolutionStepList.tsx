import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { SolutionStep } from '@/features/ask/types';
import { cn } from '@/lib/cn';
import { HexBadge } from './HexBadge';

type SolutionStepListProps = {
  steps: SolutionStep[];
  /** Mark the last step as the answer (green box). Only for teacher-approved solutions. */
  highlightAnswer?: boolean;
};

/** Numbered honey cells with what each step does and its maths in a box. */
export function SolutionStepList({ steps, highlightAnswer = false }: SolutionStepListProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2.5">
      {steps.map((step, i) => {
        const answer = highlightAnswer && i === steps.length - 1;
        return (
          <View
            key={i}
            accessible
            accessibilityLabel={t('ask.answer.stepA11y', {
              n: i + 1,
              text: step.text,
              formula: step.formula,
            })}
            className="flex-row gap-2.5"
          >
            <HexBadge size={26}>
              <Text className="font-sans-black text-xs text-on-honey">{i + 1}</Text>
            </HexBadge>
            <View className="min-w-0 flex-1 gap-1.5">
              <Text className="font-sans-semibold text-sm leading-5">{step.text}</Text>
              <View className={cn('rounded-sm px-2.5 py-[7px]', answer ? 'bg-ok-bg' : 'bg-raised')}>
                <Text
                  className={cn(
                    'font-sans-bold leading-[21px]',
                    answer ? 'text-md text-ok' : 'text-base text-ink',
                  )}
                >
                  {step.formula}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
