import { View } from 'react-native';
import { Text } from '@/components/ui';
import type { HiveTopic, TopicStep } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';

type StepBarsProps = {
  topic: HiveTopic;
};

const fraction = (step: TopicStep) => {
  if (step.state === 'done') return 1;
  if (step.state === 'todo' || !step.total) return 0;
  return (step.done ?? 0) / step.total;
};

/** The four steps as short progress bars with their names ("Nümunələr 2/3" while going). */
export function StepBars({ topic }: StepBarsProps) {
  const { t } = useLearnText();
  const done = topic.steps.filter((s) => s.state === 'done').length;
  const stateWord = {
    done: t('learn.step.stateDone'),
    current: t('learn.step.stateCurrent'),
    todo: t('learn.step.stateTodo'),
  };

  const labelOf = (step: TopicStep) => {
    const name = t(step.kind === 'test' ? 'learn.step.shortTest' : `learn.step.${step.kind}`);
    return step.state === 'current' && step.total
      ? t('learn.step.progress', { name, done: step.done ?? 0, total: step.total })
      : name;
  };
  const aria = [
    t('learn.sheet.steps', { done, total: topic.steps.length }),
    ...topic.steps.map((s) => `${labelOf(s)}: ${stateWord[s.state]}`),
  ].join(', ');

  return (
    <View accessible accessibilityLabel={aria} className="flex-row gap-1.5">
      {topic.steps.map((step) => {
        const label = labelOf(step);
        return (
          <View
            key={step.kind}
            // The step in progress gets more room for its "2/3".
            className={cn('min-w-0 gap-1.5', step.state === 'current' ? 'flex-[1.6]' : 'flex-1')}
          >
            <View className="h-2 overflow-hidden rounded-full bg-wax">
              <View
                className="h-full rounded-full bg-honey"
                // Progress is data.
                style={{ width: `${Math.round(fraction(step) * 100)}%` }}
              />
            </View>
            <Text
              numberOfLines={1}
              className={cn(
                'text-xs',
                step.state === 'current' ? 'font-sans-black' : 'font-sans-bold',
                step.state === 'todo' ? 'text-muted' : 'text-ink',
              )}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
