import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { duration, easing, useReducedMotionPref } from '@/motion';

/** micro.camera C: the sheet leaves a little faster than it came (140ms). */
const SHEET_OUT = 140;

// The animated layer is the outermost element, so its exit can play; it is placed with style
// because NativeWind does not style Reanimated's Animated.View.
const styles = StyleSheet.create({ dock: { position: 'absolute', left: 0, right: 0, bottom: 0 } });

type CaptureSheetProps = {
  /** The shot; null draws a blank sheet of paper (design-system gallery). */
  uri: string | null;
  onRetake: () => void;
  onContinue: () => void;
};

/**
 * Right after the shot: the photo under the frame, "Şəkil hazırdır", retake or go on to
 * cropping. Slides up in 220ms and leaves in 140ms (micro.camera C · Kəsilmiş kadr).
 */
export function CaptureSheet({ uri, onRetake, onContinue }: CaptureSheetProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={styles.dock}
      entering={
        reduced
          ? FadeIn.duration(duration.reduced)
          : SlideInDown.duration(duration.base).easing(easing.enter)
      }
      exiting={
        reduced
          ? FadeOut.duration(duration.reduced)
          : SlideOutDown.duration(SHEET_OUT).easing(easing.away)
      }
    >
      <View
        // It covers the shutter down to the screen edge, so it keeps clear of the home bar.
        style={{ paddingBottom: insets.bottom + 16 }}
        className="gap-3 rounded-t-[22px] bg-surf px-4 pt-4"
      >
        <View className="flex-row items-center gap-3">
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            className="h-14 w-12 -rotate-2 overflow-hidden rounded-[10px] bg-cap"
          >
            {uri ? <Image source={{ uri }} resizeMode="cover" className="h-full w-full" /> : null}
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-black">{t('ask.camera.readyTitle')}</Text>
            <Text variant="caption" tone="muted" className="font-sans">
              {t('ask.camera.readyBody')}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            label={t('ask.camera.retake')}
            variant="secondary"
            size="md"
            icon="refresh"
            onPress={onRetake}
            className="flex-1"
          />
          <Button
            label={t('ask.camera.continue')}
            size="md"
            onPress={onContinue}
            className="flex-1"
          />
        </View>
      </View>
    </Animated.View>
  );
}
