import { useId } from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Polygon, Rect } from 'react-native-svg';
import { useThemeColors } from '@/theme';

const ARect = Animated.createAnimatedComponent(Rect);

type ThinkCellProps = {
  /** Width in points; the pointy-top hexagon is 1.15 times as tall. */
  width: number;
  /** 0 empty … 1 full of honey. */
  fill: SharedValue<number>;
};

/** One small wax cell that fills with honey from the bottom (vizi.think C). */
export function ThinkCell({ width, fill }: ThinkCellProps) {
  const c = useThemeColors();
  const id = `tc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const h = width * 1.15;
  const points = `${width / 2},0 ${width},${h * 0.25} ${width},${h * 0.75} ${width / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;
  const honey = useAnimatedProps(() => ({ y: h * (1 - fill.value), height: h * fill.value }));

  return (
    <Svg width={width} height={h}>
      <Defs>
        <ClipPath id={id}>
          <Polygon points={points} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        <Rect x={0} y={0} width={width} height={h} fill={c.wax} />
        <ARect animatedProps={honey} x={0} width={width} fill={c.honey} />
      </G>
    </Svg>
  );
}
