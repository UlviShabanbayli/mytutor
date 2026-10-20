import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, Text, useRaisedPress } from '@/components/ui';
import type { TopicStep } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';
import { FlatHex } from './FlatHex';

type StepRowProps = {
  step: TopicStep;
  n: number;
  /** The step's line under its name (minutes, counts, the test's size). */
  body: string;
  disabled?: boolean;
  onPress: () => void;
};

/** One of the topic's four steps: hex badge (done, current, to do, test), name, state. */
export function StepRow({ step, n, body, disabled = false, onPress }: StepRowProps) {
  const press = useRaisedPress({ depth: 2 });
  const { t } = useLearnText();
  const current = step.state === 'current';
  const done = step.state === 'done';
  const name = t(`learn.step.${step.kind}`);
  const right = done ? t('learn.step.done') : current ? t('learn.step.current') : null;

  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={[t('learn.step.aria', { n, name, body }), right]
        .filter(Boolean)
        .join(', ')}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'rounded-lg pb-0.5',
        current ? 'bg-honey-deep' : 'bg-border',
        disabled && 'opacity-60',
      )}
    >
      <Animated.View style={press.faceStyle}>
        <View
          className={cn(
            'min-h-14 flex-row items-center gap-3 rounded-lg px-2.5 py-1.5',
            current ? 'border-2 border-honey bg-raised' : 'border border-border bg-surf',
          )}
        >
          <FlatHex size={36} color={done ? 'ok-bg' : current ? 'honey' : 'wax'}>
            {done ? (
              <Icon name="check" size={18} color="ok" />
            ) : step.kind === 'test' ? (
              <Icon name="star" size={16} color="lock-ink" />
            ) : (
              <Text
                className={cn(
                  'font-sans-black text-sm',
                  current ? 'text-on-honey' : 'text-lock-ink',
                )}
              >
                {n}
              </Text>
            )}
          </FlatHex>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-black text-base">{name}</Text>
            <Text className="text-xs" tone="muted">
              {body}
            </Text>
          </View>
          {right ? (
            <Text className={cn('font-sans-black text-xs', done ? 'text-ok' : 'text-honey-text')}>
              {right}
            </Text>
          ) : null}
          <Icon name="chevron" size={18} color="muted" />
        </View>
      </Animated.View>
    </Pressable>
  );
}
