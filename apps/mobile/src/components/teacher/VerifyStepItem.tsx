import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { SmallButton } from './SmallButton';

export type StepState = 'done' | 'now' | 'todo';

type VerifyStepItemProps = {
  index: number;
  state: StepState;
  title: string;
  file: string;
  status: string;
  last: boolean;
  extra?: { label: string; onPress: () => void };
};

/** One verification step on a rail: done steps are green, the current one honey. */
export function VerifyStepItem({
  index,
  state,
  title,
  file,
  status,
  last,
  extra,
}: VerifyStepItemProps) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={cn(
            'h-[28px] w-[28px] items-center justify-center rounded-full',
            state === 'done'
              ? 'bg-ok'
              : state === 'now'
                ? 'border-4 border-raised bg-honey'
                : 'bg-wax',
          )}
        >
          {state === 'done' ? (
            <Icon name="check" size={16} color="surf" />
          ) : (
            <Text
              className={cn(
                'font-sans-black text-sm',
                state === 'now' ? 'text-on-honey' : 'text-lock-ink',
              )}
            >
              {index}
            </Text>
          )}
        </View>
        {last ? null : (
          <View className={cn('mt-1 w-0.5 flex-1', state === 'done' ? 'bg-ok' : 'bg-border')} />
        )}
      </View>
      <View className="min-w-0 flex-1 gap-1.5 pb-3">
        <Text className="font-sans-black leading-[28px]">{title}</Text>
        <View
          accessible
          className="flex-row items-center gap-2.5 rounded-md border border-border bg-surf px-2.5 py-2"
        >
          <Icon name="file" size={20} color="muted" />
          <Text className="min-w-0 flex-1 font-sans-semibold text-sm">{file}</Text>
          <View
            className={cn(
              'h-[24px] items-center justify-center rounded-full px-2',
              state === 'done' ? 'bg-ok-bg' : 'bg-raised',
            )}
          >
            <Text
              className={cn(
                'font-sans-black text-2xs',
                state === 'done' ? 'text-ok' : 'text-honey-text',
              )}
            >
              {status}
            </Text>
          </View>
        </View>
        {extra ? (
          <SmallButton
            variant="dashed"
            icon="plus"
            label={extra.label}
            onPress={extra.onPress}
            className="self-stretch"
          />
        ) : null}
      </View>
    </View>
  );
}
