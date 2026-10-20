import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { HexCell, type CellState } from '@/components/ui/HexCell';
import { useLive, useScoped } from './live/useLive';
import { startLife } from './rig/moves/life';
import { markBusy } from './rig/rigValues';
import { ViziRig } from './rig/ViziRig';
import { ScoutRing } from './scenes/ScoutRing';
import { scoutTimeline } from './scenes/scoutTimeline';

export type ScoutCell = { label: string; state: CellState };

type ViziScoutProps = {
  /** The row Vızı searches, left to right. */
  cells: ScoutCell[];
  /** Index of the weak cell it finds. */
  found: number;
  /** What it found (e.g. a speech bubble); slides in when the cell is found. */
  children: ReactNode;
  size?: number;
  cell?: number;
};

/**
 * vizi.scout A «Lupa gəzdirir»: Vızı holds a magnifier and flies along a row of cells, finds the
 * weak one, a ring pulses around it and `children` slide in. Plays once. Reduced motion: Vızı
 * over the weak cell, the ring and the result shown at once. Decorative: the result carries the
 * information for screen readers.
 */
export function ViziScout({ cells, found, children, size = 88, cell = 44 }: ViziScoutProps) {
  const { rig, reduced, active } = useLive('lupa', 'lupa', (r) => {
    r.v.hostOpacity.value = 0;
  });
  const [width, setWidth] = useState(0);
  const ring = useSharedValue(reduced ? 1 : 0);
  const ringScale = useSharedValue(reduced ? 1.1 : 1);
  const card = useSharedValue(reduced ? 1 : 0);
  const k = size / 200;
  const gap = cell * 0.18;
  const cellH = cell * 1.125;
  // The lens hangs 0.45·size below the rig's centre: the row sits low enough for the antennae
  // to stay inside, and leaves 0.6·size on the left for the body over the first cell.
  const rowTop = size * 1.05 - cellH / 2;
  const total = cells.length * cell + (cells.length - 1) * gap;
  const left0 = size * 0.6 + Math.max(0, (width - size * 0.6 - total) / 2);
  // Host offsets (units) that put the lens (112, 90 from the rig's centre) over each cell.
  const spots = cells.map((_, i) => ({
    x: (left0 + i * (cell + gap) + cell / 2 - size / 2) / k - 112,
    y: (rowTop + cellH / 2 - size / 2) / k - 90,
  }));

  useScoped(width > 0, (S) => {
    const v = rig.v;
    const first = spots[reduced ? found : 0] ?? { x: 0, y: 0 };
    v.hostX.set(first.x - (reduced ? 0 : 40 / k));
    v.hostY.set(first.y);
    v.hostOpacity.set(1);
    if (reduced) return;
    const tl = S.play((t) => scoutTimeline(t, rig, S, spots, found, { ring, ringScale, card }));
    markBusy(rig, tl.duration);
  });
  useScoped(active, (S) => startLife(S, rig, { hover: 3 }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: card.value,
    transform: [{ translateY: (1 - card.value) * 8 }],
  }));
  const target = spots[found];

  return (
    <View className="gap-3">
      <View
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: rowTop + cellH }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute flex-row"
          style={{ top: rowTop, left: left0, gap }}
        >
          {cells.map((c) => (
            <HexCell key={c.label} state={c.state} label={c.label} size={cell} />
          ))}
        </View>
        {target && width > 0 ? (
          <ScoutRing
            x={left0 + found * (cell + gap) + cell / 2}
            y={rowTop + cellH / 2}
            width={cell * 1.42}
            height={cellH * 1.4}
            opacity={ring}
            scale={ringScale}
          />
        ) : null}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute left-0 top-0"
        >
          <ViziRig rig={rig} size={size} />
        </View>
      </View>
      <Animated.View style={cardStyle}>{children}</Animated.View>
    </View>
  );
}
