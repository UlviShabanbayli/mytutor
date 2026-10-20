import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { copyOrShare } from '@/lib/clipboard';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { radius, useThemeColors } from '@/theme';
import { CopyLabels } from './CopyLabels';
import { useRaisedPress } from './useRaisedPress';

type CopyButtonProps = {
  /** What goes to the clipboard (or, on phones, to the share sheet). */
  text: string;
  label: string;
  copiedLabel: string;
  /** Said by screen readers once copied; "Kod kopyalandı" by default. */
  announcement?: string;
  accessibilityLabel?: string;
  /** `honey` on a raised edge, or `outline` for light cards. */
  variant?: 'honey' | 'outline';
  /** Runs after a real copy, e.g. to flash the code with CodeFlash. */
  onCopied?: () => void;
  /** For tight rows: no copy icon, and "copied" shows as the drawn check alone. */
  compact?: boolean;
  className?: string;
};

/**
 * "Kopyala" that answers: the label slides away, the button turns green and a check draws,
 * then it goes back after 1.8s (micro.copy A · Etiket dəyişir). The web copies directly; on
 * phones it opens the share sheet as before, since expo-clipboard is not installed.
 */
export function CopyButton({
  text,
  label,
  copiedLabel,
  announcement,
  accessibilityLabel,
  variant = 'honey',
  onCopied,
  compact = false,
  className,
}: CopyButtonProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const [copied, setCopied] = useState(false);
  const done = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    done.value = withTiming(copied ? 1 : 0, {
      duration: reduced ? duration.reduced : copied ? duration.base : duration.quick,
      easing: copied ? easing.enter : easing.away,
    });
  }, [copied, reduced, done]);

  // The honey one sinks onto its edge (buttons.primary A); `copy` already plays the tap.
  const sink = useRaisedPress({ depth: 3, cue: false });
  const copy = async () => {
    playCue('press');
    if ((await copyOrShare(text)) !== 'copied') return;
    setCopied(true);
    onCopied?.();
    AccessibilityInfo.announceForAccessibility(announcement ?? t('ui.codeCopied'));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), duration.revert);
  };

  const honey = variant === 'honey';
  const from = honey ? colors.honey : colors.surf;
  const fromEdge = honey ? colors['honey-deep'] : colors.border;
  const okBg = colors['ok-bg'];
  const ok = colors.ok;
  const border = honey ? 0 : 2;
  const corner = radius.md;
  const face = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(done.value, [0, 1], [from, okBg]),
    borderColor: interpolateColor(done.value, [0, 1], [fromEdge, ok]),
    borderWidth: border,
    borderRadius: corner,
  }));
  const edge = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(done.value, [0, 1], [fromEdge, ok]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? copiedLabel : (accessibilityLabel ?? label)}
      onPress={() => void copy()}
      onPressIn={honey ? sink.pressIn : undefined}
      onPressOut={honey ? sink.pressOut : undefined}
      className={className}
    >
      {({ pressed }) => (
        // Plain Views carry the classes; the animated layers only paint the colours, since
        // NativeWind does not style Reanimated's Animated.View.
        <View className={cn('overflow-hidden rounded-md', honey && 'pb-[3px]')}>
          {honey ? <Animated.View style={[StyleSheet.absoluteFill, edge]} /> : null}
          <Animated.View style={sink.faceStyle}>
            <View
              className={cn(
                'h-[44px] items-center justify-center overflow-hidden rounded-md px-3.5',
                !honey && pressed && 'opacity-70',
              )}
            >
              <Animated.View style={[StyleSheet.absoluteFill, face]} />
              <CopyLabels
                label={label}
                copiedLabel={copiedLabel}
                done={done}
                onHoney={honey}
                shift={reduced ? 0 : 8}
                compact={compact}
              />
            </View>
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}
