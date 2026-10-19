import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Hex } from '@/components/me/Hex';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { playCue } from '@/lib/cues';
import { useLive, useScoped } from './live/useLive';
import { ease } from './rig/ease';
import { flapBurst } from './rig/moves/flap';
import { react, startLife } from './rig/moves/life';
import { faceTo, poseTo, setPose } from './rig/moves/pose';
import { hop, look, wobble } from './rig/moves/small';
import { Scope } from './rig/scope';
import { ViziRig } from './rig/ViziRig';
import { GiftBox } from './scenes/GiftBox';

type ViziRewardProps = { size?: number; gift?: number };

/**
 * vizi.reward B «Hədiyyə (toxun)»: a gift box wiggles every 1.6s and Vızı glances at it. A tap
 * opens it: the lid flies off, the box sinks, the prize cell rises (back.out(2)) and Vızı is
 * surprised, then cheers with a hop and fast wings. Haptic `focus` on opening, `reward` on the
 * prize. Reduced motion: the tap swaps gift for prize at once and Vızı cheers still.
 */
export function ViziReward({ size = 150, gift = 76 }: ViziRewardProps) {
  const { t } = useTranslation();
  const { rig, reduced, active } = useLive('rest');
  const [S] = useState(() => new Scope());
  const [opened, setOpened] = useState(false);
  const open = useSharedValue(0);
  const wiggle = useSharedValue(0);
  const prize = useSharedValue(0);
  useEffect(() => () => S.kill(), [S]);

  useScoped(
    active,
    (L) => {
      startLife(L, rig, { hover: 4 });
      if (opened) return;
      L.play((tl) => look(tl, rig, 7, 2, 0.5, 0.3));
      L.play((tl) => {
        [-6, 6, -4, 4, 0].forEach((r, i) => tl.to(wiggle, r, 0.6 + i * 0.1, 0.1, ease.none));
      }, 1.6);
    },
    opened,
  );

  const onOpen = () => {
    if (opened) return;
    setOpened(true);
    playCue('focus');
    if (reduced) {
      open.set(1);
      prize.set(1);
      setPose(rig, 'bayram');
      playCue('reward');
      return;
    }
    react(S, rig, (tl) => {
      tl.to(wiggle, 0, 0, 0.1).to(open, 1, 0, 0.6, ease.p2out).to(prize, 1, 0.25, 0.5, ease.back2);
      poseTo(tl, rig, 'teeccub', 0.05, 0.14);
      wobble(tl, rig, -18, 0.05);
      poseTo(tl, rig, 'bayram', 0.6, 0.3);
      hop(tl, rig, 22, 0.65);
      tl.call(0.6, () => {
        playCue('reward');
        flapBurst(S, rig, 1.1);
      });
      look(tl, rig, 0, 0, 1.3, 0.3);
      poseTo(tl, rig, 'rest', 2.2, 0.5);
      faceTo(tl, rig, 'happy', 2.3, 0.3);
    });
  };

  const prizeStyle = useAnimatedStyle(() => ({
    opacity: prize.value > 0.01 ? 1 : 0,
    transform: [{ translateY: 40 * (1 - prize.value) }, { scale: 0.3 + 0.7 * prize.value }],
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, open.value * 4) }));

  return (
    <View className="flex-row items-end">
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ViziRig rig={rig} size={size} />
      </View>
      <View className="items-center gap-1" style={{ marginLeft: -size * 0.06 }}>
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('mascot.gift')}
            accessibilityState={{ disabled: opened }}
            disabled={opened}
            onPress={onOpen}
          >
            <GiftBox width={gift} open={open} wiggle={wiggle} />
          </Pressable>
          <Animated.View
            pointerEvents="none"
            accessible={opened}
            accessibilityLabel={t('mascot.prize')}
            style={[styles.prize, prizeStyle]}
          >
            <Hex width={gift} fill="on-honey">
              <Icon name="shield" size={gift * 0.42} color="honey" />
            </Hex>
          </Animated.View>
        </View>
        <Animated.View style={hintStyle}>
          <Text className="font-sans-bold text-xs">{t('mascot.giftHint')}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ prize: { position: 'absolute', left: 0, bottom: 0 } });
