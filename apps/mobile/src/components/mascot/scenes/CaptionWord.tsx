import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, type SharedValue } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';

type CaptionWordProps = {
  text: string;
  index: number;
  /** The word being spoken (−1 between sentences, a large number when all are done). */
  current: SharedValue<number>;
};

/** One caption word: dim before it is spoken, lit while spoken (150ms), full after. */
export function CaptionWord({ text, index, current }: CaptionWordProps) {
  const word = useAnimatedStyle(() => ({
    opacity: withTiming(current.value >= index ? 1 : 0.5, { duration: 150 }),
  }));
  const light = useAnimatedStyle(() => ({
    opacity: withTiming(current.value === index ? 1 : 0, { duration: 150 }),
  }));

  return (
    <Animated.View style={word}>
      <Animated.View style={[StyleSheet.absoluteFill, light]}>
        <View className="flex-1 rounded-md bg-raised" />
      </Animated.View>
      <Text className="px-1 font-sans-bold text-base">{text}</Text>
    </Animated.View>
  );
}
