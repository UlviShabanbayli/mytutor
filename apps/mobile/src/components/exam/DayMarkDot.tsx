import { View } from 'react-native';
import type { DayMark } from '@/features/exam/types';
import { cn } from '@/lib/cn';

type DayMarkDotProps = {
  mark: DayMark;
  /** On today's honey cell the marks take the on-honey ink. */
  onHoney?: boolean;
};

/** A plan step on the week strip: done = filled dot, planned = ring, moved = diamond. */
export function DayMarkDot({ mark, onHoney = false }: DayMarkDotProps) {
  if (mark === 'moved')
    return (
      <View
        className={cn('h-[7px] w-[7px] rotate-45', onHoney ? 'bg-on-honey' : 'bg-honey-text')}
      />
    );
  if (mark === 'plan')
    return (
      <View
        className={cn(
          'h-[7px] w-[7px] rounded-full border-[1.5px]',
          onHoney ? 'border-on-honey' : 'border-muted',
        )}
      />
    );
  return (
    <View className={cn('h-[7px] w-[7px] rounded-full', onHoney ? 'bg-on-honey' : 'bg-honey')} />
  );
}
