import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { AudioBar } from './AudioBar';

type AudioBarsProps = { tick: SharedValue<number>; height?: number };

/** Five bars that move while Vızı speaks (vizi.explain C). Decorative. */
export function AudioBars({ tick, height = 26 }: AudioBarsProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="flex-row items-center gap-1"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <AudioBar key={i} tick={tick} height={height} />
      ))}
    </View>
  );
}
