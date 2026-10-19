import Svg, { Path } from 'react-native-svg';
import { useThemeColors } from '@/theme';

/** The icon set's drop (24pt grid). */
export const DROP_PATH = 'M12 3c3 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.8 6-11z';

type HoneyDropProps = {
  size: number;
  /** A honey-deep rim, as the flying drops have; the counter's inner fill has none. */
  rim?: boolean;
};

/** A drop of honey: the flying points (feedback.points C) and the goal ring's drop (goal C). */
export function HoneyDrop({ size, rim = true }: HoneyDropProps) {
  const c = useThemeColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={DROP_PATH}
        fill={c.honey}
        stroke={rim ? c['honey-deep'] : 'none'}
        strokeWidth={rim ? 1.6 : 0}
      />
    </Svg>
  );
}
