import { View } from 'react-native';
import { unitSummary } from '@/features/learn/mastery';
import type { Hive, HiveTopic, HiveUnit } from '@/features/learn/types';
import { cn } from '@/lib/cn';
import { FrameComb } from './FrameComb';
import { FrameFooter } from './FrameFooter';
import { FrameHeader } from './FrameHeader';

type FrameCardProps = {
  hive: Hive;
  unit: HiveUnit;
  open: boolean;
  online: boolean;
  selectedId?: string;
  onToggle: () => void;
  onTopic: (topic: HiveTopic) => void;
  onUnitTest: () => void;
};

/**
 * One unit as a hive frame ("çərçivə"): a top bar wider than the frame, a slat body with a
 * 2pt edge, the title row, and when open the comb of its cells.
 */
export function FrameCard({ hive, unit, open, online, ...actions }: FrameCardProps) {
  const summary = unitSummary(unit, hive);
  const dim = !online && !summary.onPhone;

  return (
    <View className={cn('pt-[3px]', dim && 'opacity-50')}>
      <View className="absolute -left-[5px] -right-[5px] top-0 h-2 rounded bg-slat-edge" />
      <View className="rounded-b-md rounded-t-[6px] bg-slat-edge pb-0.5">
        <View
          className={cn(
            'rounded-b-md rounded-t-[6px] bg-slat',
            open ? 'border-2 border-honey' : 'border-[1.5px] border-slat-edge',
          )}
        >
          <FrameHeader
            unit={unit}
            summary={summary}
            open={open}
            online={online}
            onToggle={actions.onToggle}
          />
          {open ? (
            <>
              <FrameComb
                hive={hive}
                unit={unit}
                online={online}
                selectedId={actions.selectedId}
                onTopic={actions.onTopic}
                onUnitTest={actions.onUnitTest}
              />
              <FrameFooter hive={hive} unit={unit} online={online} />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}
