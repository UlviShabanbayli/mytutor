import { Pressable, View } from 'react-native';
import { HexCell, Icon, Text } from '@/components/ui';
import { unitLevel, type UnitSummary } from '@/features/learn/mastery';
import type { HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';
import { QueenCell } from './QueenCell';
import { TopicCell } from './TopicCell';

type FrameHeaderProps = {
  unit: HiveUnit;
  summary: UnitSummary;
  open: boolean;
  online: boolean;
  onToggle: () => void;
};

/** A frame's title row: unit badge, name, a strip of its cells (closed) and how far it is. */
export function FrameHeader({ unit, summary, open, online, onToggle }: FrameHeaderProps) {
  const { t } = useLearnText();
  const dim = !online && !summary.onPhone;
  const sub = [t('learn.hive.sub.count', summary)];
  if (dim) sub.push(t('learn.hive.sub.needsInternet'));
  else if (!online) sub.push(t('learn.hive.sub.onPhone'));
  else if (summary.crystals > 0)
    sub.push(t('learn.hive.sub.crystals', { count: summary.crystals }));
  else if (summary.sealed) sub.push(t('learn.hive.sub.sealed'));
  else if (summary.hasCurrent) sub.push(t('learn.hive.sub.ahead'));
  const aria = [
    t('learn.hive.frameAria', { number: unit.number, title: unit.title, ...summary }),
    summary.crystals > 0 ? t('learn.hive.frameCrystals', { count: summary.crystals }) : null,
    dim ? t('learn.hive.needsInternet') : null,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={aria.filter(Boolean).join(', ')}
      accessibilityState={{ expanded: open }}
      onPress={onToggle}
      className="min-h-[50px] flex-row items-center gap-2.5 px-2.5 pb-1.5 pt-2"
    >
      <TopicCell level={unitLevel(unit)} number={unit.number} size={32} numberSize="sm" />
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={1} className="font-sans-black text-base">
          {unit.title}
        </Text>
        <View className="min-w-0 flex-row items-center gap-2">
          {open ? null : (
            <View className="flex-row items-start gap-0.5">
              {unit.topics.map((topic) => (
                <HexCell key={topic.id} state={topic.level} size={11} />
              ))}
              <QueenCell level={unit.unitTest.level} size={11} />
            </View>
          )}
          <Text
            numberOfLines={1}
            className={cn(
              'min-w-0 flex-1 font-sans-bold text-xs',
              online && summary.crystals > 0 ? 'text-crystal-ink' : 'text-muted',
            )}
          >
            {sub.join(' · ')}
          </Text>
        </View>
      </View>
      <View className={cn(open && 'rotate-180')}>
        <Icon name="down" size={20} color="muted" />
      </View>
    </Pressable>
  );
}
