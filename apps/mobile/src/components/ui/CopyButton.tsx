import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { copyOrShare } from '@/lib/clipboard';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';
import { AnimatedView } from './animated';
import { CopyLabels } from './CopyLabels';

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

  const press = async () => {
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
  const face = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(done.value, [0, 1], [from, okBg]),
    borderColor: interpolateColor(done.value, [0, 1], [fromEdge, ok]),
  }));
  const edge = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(done.value, [0, 1], [fromEdge, ok]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? copiedLabel : (accessibilityLabel ?? label)}
      onPress={() => void press()}
      className={className}
    >
      {({ pressed }) => (
        <AnimatedView
          style={honey ? edge : undefined}
          className={cn('rounded-md', honey && 'pb-[3px]')}
        >
          <AnimatedView
            style={face}
            className={cn(
              'h-[44px] items-center justify-center rounded-md px-3.5',
              !honey && 'border-2',
              honey && pressed && 'translate-y-[3px]',
              !honey && pressed && 'opacity-70',
            )}
          >
            <CopyLabels
              label={label}
              copiedLabel={copiedLabel}
              done={done}
              onHoney={honey}
              shift={reduced ? 0 : 8}
              compact={compact}
            />
          </AnimatedView>
        </AnimatedView>
      )}
    </Pressable>
  );
}
