import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useIsFocused } from 'expo-router';
import { useReducedMotionPref } from '@/motion';
import { ease } from '../rig/ease';
import { Timeline } from '../rig/timeline';
import { ThinkCell } from './ThinkCell';

type ThinkCellsProps = {
  /** Width of one cell in points. */
  cell: number;
};

/**
 * Three cells beside a thinking Vızı (vizi.think C): they fill one after another (500ms each,
 * 600ms apart), fade out together at 2.3s and start again every 2.8s — the same clock as the
 * eyes of `behavior="think"`, so mount both together. Reduced motion: two of three full.
 */
export function ThinkCells({ cell }: ThinkCellsProps) {
  const reduced = useReducedMotionPref();
  const active = useIsFocused() && !reduced;
  const a = useSharedValue(reduced ? 1 : 0);
  const b = useSharedValue(reduced ? 1 : 0);
  const c = useSharedValue(0);
  const shown = useSharedValue(1);

  useEffect(() => {
    if (!active) return;
    const tl = new Timeline();
    [a, b, c].forEach((fill, i) => {
      tl.set(fill, 0, 0)
        .to(fill, 1, i * 0.6 + 0.05, 0.5, ease.p1io)
        .set(fill, 0, 2.6);
    });
    tl.to(shown, 0, 2.3, 0.25, ease.none).set(shown, 1, 2.6);
    tl.play(2.8);
    return () => tl.kill();
  }, [active, a, b, c, shown]);

  const style = useAnimatedStyle(() => ({ opacity: shown.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
    >
      <View className="flex-row" style={{ gap: cell * 0.15 }}>
        <ThinkCell width={cell} fill={a} />
        <ThinkCell width={cell} fill={b} />
        <ThinkCell width={cell} fill={c} />
      </View>
    </Animated.View>
  );
}
