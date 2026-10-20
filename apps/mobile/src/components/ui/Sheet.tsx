import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { OVERSCAN, scrimOpacity } from '@/features/transitions/sheetDrag';
import { useSheetMotion } from '@/features/transitions/useSheetMotion';
import { useReducedMotionPref } from '@/motion';
import { ThemeScope } from '@/theme';
import { SheetHandle } from './SheetHandle';
import { Text } from './Text';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Read by screen readers as the dialog name; shown as the sheet's heading when `showTitle`. */
  title: string;
  showTitle?: boolean;
  /**
   * Where a downward drag closes the sheet: anywhere on it (default), or only on the handle and
   * title, for sheets whose content scrolls.
   */
  dragArea?: 'sheet' | 'handle';
  children: ReactNode;
};

/**
 * Bottom sheet: scrim, 28pt top corners, a 40×5 grab handle; tapping the scrim or dragging the
 * sheet down closes it. It springs open and closed (transitions.sheet B).
 */
export function Sheet({
  visible,
  onClose,
  title,
  showTitle = true,
  dragArea = 'sheet',
  children,
}: SheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const { mounted, y, height, fade, held, pan, onSheetLayout } = useSheetMotion({
    visible,
    onClose,
    reduced,
  });
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateY: y.get() }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: fade.get() * scrimOpacity(y.get(), height.get()),
  }));

  const grab = (
    <View className="gap-4 pt-2.5">
      <SheetHandle held={held} />
      {showTitle ? <Text variant="heading">{title}</Text> : null}
    </View>
  );
  const sheet = (
    <Animated.View style={sheetStyle}>
      <View
        accessibilityViewIsModal
        accessibilityLabel={title}
        onLayout={(e) => onSheetLayout(e.nativeEvent.layout.height - OVERSCAN)}
        // It reaches OVERSCAN below the screen edge, so the opening overshoot shows no gap.
        className="-mb-[40px] gap-4 rounded-t-3xl bg-surf px-4"
        // The home indicator inset is device-specific, so it cannot be a static className.
        style={{ paddingBottom: insets.bottom + 16 + OVERSCAN }}
      >
        {dragArea === 'handle' ? <GestureDetector gesture={pan}>{grab}</GestureDetector> : grab}
        {children}
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      {/* Android needs its own gesture root inside a modal (it fills the modal by default). */}
      <GestureHandlerRootView>
        {/* The modal renders outside the root ThemeScope on the web, so it carries its own. */}
        <ThemeScope className="flex-1 justify-end">
          <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={onClose}
              className="flex-1 bg-scrim"
            />
          </Animated.View>
          {dragArea === 'sheet' ? <GestureDetector gesture={pan}>{sheet}</GestureDetector> : sheet}
        </ThemeScope>
      </GestureHandlerRootView>
    </Modal>
  );
}
