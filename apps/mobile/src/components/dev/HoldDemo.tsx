import { useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Card, HoldButton, Text } from '@/components/ui';
import { spring } from '@/motion';

/**
 * buttons.hold B as approved: hold to fill the button with honey, then a hint unfolds from it
 * with `spring.unfold`. No screen uses a hold yet (every irreversible action already asks in a
 * sheet), so it lives here until one does.
 */
export function HoldDemo() {
  const [open, setOpen] = useState(false);
  const unfold = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, unfold.get()),
    transformOrigin: 'top',
    transform: [{ scaleY: 0.6 + 0.4 * unfold.get() }],
  }));

  return (
    <View className="gap-2">
      <View className="flex-row">
        <HoldButton
          label={open ? 'İpucunu bağla' : 'İpucu üçün basıb saxla'}
          icon="info"
          onHold={() => {
            const next = !open;
            setOpen(next);
            unfold.set(next ? withSpring(1, spring.unfold) : 0);
          }}
        />
      </View>
      {open ? (
        <Animated.View style={style}>
          <Card className="gap-1">
            <Text variant="overline" tone="honey">
              İpucu
            </Text>
            <Text>(a + b)² açılışında ortadakı hədd 2ab-dir.</Text>
          </Card>
        </Animated.View>
      ) : null}
    </View>
  );
}
