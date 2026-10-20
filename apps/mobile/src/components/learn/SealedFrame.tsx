import { View } from 'react-native';
import { unitSealed } from '@/features/learn/hiveMotion';
import type { HiveUnit } from '@/features/learn/types';
import { Appear } from './Appear';
import { HexComb } from './HexComb';
import { TopicCell } from './TopicCell';
import { WakingQueen } from './WakingQueen';

type SealedFrameProps = {
  unit: HiveUnit;
};

const CELL = 54;

/**
 * The sealed frame of the unit-done moment: every cell honey, the queen cell capped. The cells
 * bounce one by one, then the queen's cap closes and it wakes (hive.unit-sealed B).
 */
export function SealedFrame({ unit }: SealedFrameProps) {
  const cells = unit.topics.map((topic, i) => ({
    key: topic.id,
    node: (
      <Appear
        from={{}}
        via={{ scale: 1.1, at: 0.4 }}
        delay={unitSealed.cells + i * unitSealed.cellStep}
        duration={unitSealed.bounce}
        ease="pop"
      >
        <TopicCell level="mastered" number={topic.number} size={CELL} numberSize="sm" />
      </Appear>
    ),
  }));
  cells.push({ key: `${unit.id}-test`, node: <WakingQueen size={CELL} /> });

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
