import { View } from 'react-native';
import type { HiveUnit } from '@/features/learn/types';
import { HexComb } from './HexComb';
import { QueenCell } from './QueenCell';
import { TopicCell } from './TopicCell';

type SealedFrameProps = {
  unit: HiveUnit;
};

const CELL = 54;

/** The sealed frame of the unit-done moment: every cell honey, the queen cell capped. */
export function SealedFrame({ unit }: SealedFrameProps) {
  const cells = unit.topics.map((topic) => ({
    key: topic.id,
    node: <TopicCell level="mastered" number={topic.number} size={CELL} numberSize="sm" />,
  }));
  cells.push({ key: `${unit.id}-test`, node: <QueenCell level="reinforced" size={CELL} /> });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="pt-[3px]"
    >
      <View className="absolute -left-2 -right-2 top-0 h-[9px] rounded-full bg-slat-edge" />
      <View className="rounded-b-2xl rounded-t-[6px] bg-honey-deep pb-1">
        <View className="rounded-b-2xl rounded-t-[6px] border-2 border-slat-edge bg-slat px-5 pb-2 pt-4">
          <HexComb cells={cells} cellWidth={CELL} cellHeight={Math.round(CELL * 1.125)} gap={5} />
        </View>
      </View>
    </View>
  );
}
