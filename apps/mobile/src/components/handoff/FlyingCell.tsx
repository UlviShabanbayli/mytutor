import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { type CellState, HexCell } from '@/components/ui';
import type { Rect } from '@/features/transitions/handoffStore';
import { playCue } from '@/lib/cues';
import { duration, easing } from '@/motion';

type FlyingCellProps = {
  code: string;
  to: CellState;
  from: Rect;
  target: Rect;
  /** Window position of the layer it is drawn in. */
  origin: { x: number; y: number };
  onLanded: () => void;
};

/**
 * The topic cell in flight: drawn at the result card's size, it starts small over the test
 * header and grows into the card (420ms); on landing it fills with honey from the bottom
 * (400ms) when the test made it Bal, with the Success cue, then hands over to the card's cell.
 */
export function FlyingCell({ code, to, from, target, origin, onLanded }: FlyingCellProps) {
  const fly = useSharedValue(0);
  const fill = useSharedValue(0);
  const honey = to === 'mastered';
  const size = target.width;

  useEffect(() => {
    const landed = () => {
      if (honey) playCue('complete');
      onLanded();
    };
    fly.set(withTiming(1, { duration: duration.fly, easing: easing.enter }));
    const fillTo = honey ? 1 : 0;
    fill.set(
      withDelay(
        duration.fly,
        withTiming(fillTo, { duration: honey ? duration.fill : 0, easing: easing.fill }, (done) => {
          if (done) scheduleOnRN(landed);
        }),
      ),
    );
  }, [fill, fly, honey, onLanded]);

  const dx = from.x + from.width / 2 - (target.x + target.width / 2);
  const dy = from.y + from.height / 2 - (target.y + target.height / 2);
  const startScale = from.width / target.width;
  const flight = useAnimatedStyle(() => {
    const t = fly.get();
    return {
      position: 'absolute',
      left: target.x - origin.x,
      top: target.y - origin.y,
      width: target.width,
      height: target.height,
      transform: [
        { translateX: dx * (1 - t) },
        { translateY: dy * (1 - t) },
        { scale: startScale + (1 - startScale) * t },
      ],
    };
  });
  // The honey rises from the bottom: a clipping box anchored there grows with the fill.
  const level = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    height: target.height * fill.get(),
  }));

  return (
    <Animated.View style={flight}>
      <HexCell state="lesson_completed" size={size} label={code} />
      <Animated.View style={level}>
        <View className="absolute inset-x-0 bottom-0">
          <HexCell state="mastered" size={size} label={code} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
