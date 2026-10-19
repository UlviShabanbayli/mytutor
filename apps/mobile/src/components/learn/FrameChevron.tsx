import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/ui';
import { frameToggle } from '@/features/learn/hiveMotion';
import { easing } from '@/motion';

type FrameChevronProps = {
  open: boolean;
};

/** The frame's chevron: turns 180° in 220ms as the frame opens or closes. */
export function FrameChevron({ open }: FrameChevronProps) {
  const turn = useSharedValue(open ? 180 : 0);
  useEffect(() => {
    turn.value = withTiming(open ? 180 : 0, {
      duration: frameToggle.chevron,
      easing: easing.enter,
    });
  }, [open, turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));

  return (
    <Animated.View style={style}>
      <Icon name="down" size={20} color="muted" />
    </Animated.View>
  );
}
