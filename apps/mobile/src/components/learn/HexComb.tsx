import type { ReactNode } from 'react';
import { View } from 'react-native';
import { combGeometry, combRows } from '@/features/learn/comb';

type HexCombProps = {
  cells: { key: string; node: ReactNode }[];
  /** Width and height of one topic cell, and the gap between cells. */
  cellWidth: number;
  cellHeight: number;
  gap: number;
};

/**
 * Cells as a honeycomb: flex rows of three, every second row shifted by half a cell and
 * tucked up into the row above. Cells stay in normal flow (no absolute positions).
 */
export function HexComb({ cells, cellWidth, cellHeight, gap }: HexCombProps) {
  const { width, rowShift, rowOverlap } = combGeometry(cellWidth, cellHeight, gap);

  return (
    // The comb's geometry follows the cell size the caller passes.
    <View className="self-center" style={{ width }}>
      {combRows(cells).map((row, i) => (
        <View
          key={row.items.map((c) => c.key).join('|')}
          className="flex-row items-start"
          style={{
            gap,
            marginTop: i === 0 ? 0 : -rowOverlap,
            paddingLeft: row.offset ? rowShift : 0,
          }}
        >
          {row.items.map((cell) => (
            <View key={cell.key}>{cell.node}</View>
          ))}
        </View>
      ))}
    </View>
  );
}
