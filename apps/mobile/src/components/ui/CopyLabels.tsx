import { useState } from 'react';
import { View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { CHECK_LENGTH, CHECK_PATH } from '@/lib/strokes';
import { useThemeColors } from '@/theme';
import { Text } from './Text';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type CopyLabelsProps = {
  label: string;
  copiedLabel: string;
  /** 0 → "Kopyala", 1 → "Kopyalandı"; driven by CopyButton. */
  done: SharedValue<number>;
  /** The button's own ink: on-honey on the honey button, ink on the outlined one. */
  onHoney: boolean;
  /** How far the labels travel (8pt; 0 with less motion). */
  shift: number;
  /** Tight rows: no copy icon, and "copied" is only the drawn check (screen readers hear it). */
  compact: boolean;
};

/** The two stacked faces of CopyButton: copy icon + label, and a drawn check + "Kopyalandı". */
export function CopyLabels({ label, copiedLabel, done, onHoney, shift, compact }: CopyLabelsProps) {
  const colors = useThemeColors();
  const [width, setWidth] = useState({ idle: 0, done: 0 });
  const ink = onHoney ? colors['on-honey'] : colors.ink;

  const idleFace = useAnimatedStyle(() => ({
    opacity: 1 - done.value,
    transform: [{ translateY: -shift * done.value }],
  }));
  const doneFace = useAnimatedStyle(() => ({
    opacity: done.value,
    transform: [{ translateY: shift * (1 - done.value) }],
  }));
  const draw = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - done.value) }));

  return (
    // Wide enough for either label (measured), so the button never changes size.
    <View style={{ minWidth: Math.max(width.idle, width.done) }} className="items-center">
      <Animated.View
        style={idleFace}
        onLayout={(e) => {
          const idle = e.nativeEvent.layout.width;
          setWidth((w) => ({ ...w, idle }));
        }}
      >
        <View className="flex-row items-center gap-1.5">
          {compact ? null : (
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke={ink}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Rect x={8.5} y={8.5} width={11.5} height={11.5} rx={2.5} />
              <Path d="M15.5 8.5V6.5A2.5 2.5 0 0 0 13 4H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2" />
            </Svg>
          )}
          <Text
            numberOfLines={1}
            className={cn('font-sans-black text-sm', onHoney ? 'text-on-honey' : 'text-ink')}
          >
            {label}
          </Text>
        </View>
      </Animated.View>
      {/* The plain View places the face; the animated layer inside only moves and fades. */}
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setWidth((s) => ({ ...s, done: w }));
        }}
        className="absolute"
      >
        <Animated.View style={doneFace}>
          <View className="flex-row items-center gap-1.5">
            <Svg width={compact ? 22 : 18} height={compact ? 22 : 18} viewBox="0 0 24 24">
              <AnimatedPath
                d={CHECK_PATH}
                fill="none"
                stroke={colors.ok}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={CHECK_LENGTH}
                animatedProps={draw}
              />
            </Svg>
            {compact ? null : (
              <Text numberOfLines={1} className="font-sans-black text-sm text-ok">
                {copiedLabel}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
