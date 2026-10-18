import { View } from 'react-native';
import { HexCell } from '@/components/ui';
import { allTopics } from '@/features/learn/mastery';
import type { Hive } from '@/features/learn/types';
import { cn } from '@/lib/cn';

type MiniCombProps = {
  hive: Hive;
};

/**
 * The hive card's emblem: seven tiny cells around the topic the student is on, so the card
 * shows where they are in the box. Decorative.
 */
export function MiniComb({ hive }: MiniCombProps) {
  const topics = allTopics(hive);
  const at = Math.max(
    0,
    topics.findIndex((x) => x.id === hive.currentTopicId),
  );
  const from = Math.min(Math.max(0, at - 4), Math.max(0, topics.length - 7));
  const levels = topics.slice(from, from + 7).map((x) => x.level);
  // Rows of 2, 3 and 2 cells; the short rows are shifted by half a cell.
  const rows = [levels.slice(0, 2), levels.slice(2, 5), levels.slice(5, 7)];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[70px] w-[70px] items-center justify-center rounded-[18px] bg-box"
    >
      {rows.map((cells, row) => (
        <View
          key={row}
          className={cn('flex-row gap-0.5', row !== 1 && 'pl-3', row > 0 && '-mt-[5px]')}
        >
          {cells.map((level, i) => (
            <HexCell key={i} state={level} size={22} />
          ))}
        </View>
      ))}
    </View>
  );
}
