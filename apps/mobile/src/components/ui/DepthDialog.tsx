import { type ReactNode, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useDepthStore } from '@/features/transitions/depthStore';
import { useDepthProgress } from '@/features/transitions/useDepthProgress';
import { useReducedMotionPref } from '@/motion';
import { ThemeScope } from '@/theme';

type DepthDialogProps = {
  visible: boolean;
  /** Tapping the scrim or the system back closes it the safe way (stay). */
  onClose: () => void;
  /** Read by screen readers as the dialog name. */
  title: string;
  children: ReactNode;
};

/** transitions.dialog C: the card rises 24pt as it fades in. */
const RISE = 24;

/**
 * "Are you sure?" card in the middle of the screen, over a scrim. Pair it with `DepthScreen`
 * around the screen behind, which steps back while the card rises (transitions.dialog C).
 * With less motion both only fade (150ms) and nothing moves.
 */
export function DepthDialog({ visible, onClose, title, children }: DepthDialogProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const { mounted, progress } = useDepthProgress(visible);
  const setReceded = useDepthStore((s) => s.setReceded);
  useEffect(() => {
    setReceded(visible);
    return () => setReceded(false);
  }, [visible, setReceded]);
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: reduced ? 0 : RISE * (1 - progress.get()) }],
  }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      {/* The modal renders outside the root ThemeScope on the web, so it carries its own. */}
      <ThemeScope className="flex-1 justify-center px-3">
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            className="flex-1 bg-scrim"
          />
        </Animated.View>
        <Animated.View style={cardStyle}>
          <View
            accessibilityViewIsModal
            role="dialog"
            accessibilityLabel={title}
            className="gap-3 rounded-[20px] bg-surf px-4 pb-4 pt-5"
          >
            {children}
          </View>
        </Animated.View>
      </ThemeScope>
    </Modal>
  );
}
