import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useBannerDrop } from '@/features/transitions/useBannerDrop';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import { Text } from './Text';

type BannerKind = 'offline' | 'error' | 'info';

const styles = {
  offline: { box: 'bg-info-bg', icon: 'offline', color: 'info' },
  info: { box: 'bg-info-bg', icon: 'info', color: 'info' },
  error: { box: 'bg-err-bg', icon: 'warning', color: 'err' },
} as const;

type BannerProps = {
  kind: BannerKind;
  /** Says the real reason in plain words, never a code. */
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/**
 * Inline status line: offline and info are polite announcements, errors are alerts. It drops in
 * while its slot opens and lifts away when it goes (transitions.toast B).
 */
export function Banner({ kind, message, actionLabel, onAction, className }: BannerProps) {
  const s = styles[kind];
  const { slotStyle, dropStyle, onBannerLayout, exiting } = useBannerDrop();

  return (
    <Animated.View style={slotStyle} exiting={exiting}>
      <Animated.View style={dropStyle}>
        {/* Measured with the caller's margins, so the slot opens to the full height. */}
        <View onLayout={onBannerLayout}>
          <View
            accessibilityRole={kind === 'error' ? 'alert' : 'summary'}
            accessibilityLiveRegion={kind === 'error' ? 'assertive' : 'polite'}
            className={cn('flex-row items-center gap-2.5 rounded-md px-3 py-2.5', s.box, className)}
          >
            <Icon name={s.icon} size={20} color={s.color} />
            <Text variant="caption" className="flex-1 font-sans-medium text-ink">
              {message}
            </Text>
            {actionLabel && onAction ? (
              <Pressable
                accessibilityRole="button"
                onPress={onAction}
                className="min-h-touch justify-center px-1"
              >
                <Text className="font-sans-black text-sm text-honey-text">{actionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
