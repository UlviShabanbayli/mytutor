import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { BusyCells } from './BusyCells';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { useRaisedPress } from './useRaisedPress';
import { useWaxPress } from './useWaxPress';

type ButtonVariant = 'primary' | 'spot' | 'secondary' | 'text' | 'danger';

type VariantStyle = {
  face: string;
  /** The darker edge under a raised button; absent on flat ones. */
  edge?: string;
  label: string;
  content: ColorName;
  caps: boolean;
};

const variants: Record<ButtonVariant, VariantStyle> = {
  primary: {
    face: 'bg-honey',
    edge: 'bg-honey-deep',
    label: 'text-on-honey',
    content: 'on-honey',
    caps: true,
  },
  // Inverted card colors: "Davam et"-type actions on a light page.
  spot: {
    face: 'bg-spot',
    edge: 'bg-honey-deep',
    label: 'text-on-spot',
    content: 'on-spot',
    caps: true,
  },
  secondary: {
    face: 'border-2 border-border bg-transparent',
    label: 'text-ink',
    content: 'ink',
    caps: false,
  },
  text: { face: 'bg-transparent', label: 'text-honey-text', content: 'honey-text', caps: false },
  // Page color on the error red: near-white in light mode, near-black on dark mode's lighter
  // red, so the label keeps 4.5:1 in both (design: "Təhlükəli: hesabı sil").
  danger: { face: 'bg-err', label: 'text-page', content: 'page', caps: false },
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  /** `lg` (56pt) for a screen's main action, `md` (48pt) for the rest. */
  size?: 'lg' | 'md';
  icon?: IconName;
  loading?: boolean;
  className?: string;
};

/**
 * Raised buttons stand on a 4pt edge of a darker tone and sink onto it while pressed
 * (buttons.primary, buttons.spot); disabled they lie flat in wax with locked-ink text and stand
 * up when enabled (buttons.enable). Flat ones show a wax press (buttons.flat). While busy,
 * three hex cells fill in turn (buttons.loading).
 */
export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled,
  className,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || loading;
  const off = disabled === true;
  const v = variants[variant];
  const raised = useRaisedPress({ calm: variant === 'spot', off });
  const flat = useWaxPress();
  const press = v.edge ? raised : flat;
  const faceClass = cn(
    'flex-row items-center justify-center gap-2 rounded-lg px-5',
    size === 'lg' ? 'h-14' : 'min-h-touch',
  );

  const content = loading ? (
    <BusyCells color={v.content} />
  ) : (
    <>
      {icon ? <Icon name={icon} size={20} color={off ? 'lock-ink' : v.content} /> : null}
      <Text
        numberOfLines={2}
        className={cn(
          'text-center text-base',
          v.caps ? 'font-sans-black uppercase tracking-[0.6px]' : 'font-sans-bold',
          off ? 'text-lock-ink' : v.label,
        )}
      >
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={className}
      onPressIn={(e) => {
        press.pressIn();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        press.pressOut();
        onPressOut?.(e);
      }}
      {...props}
    >
      {v.edge ? (
        <View className="rounded-lg pb-1">
          {/* The edge stays put; the face hides it while lying on it (pressed or disabled). */}
          <View className={cn('absolute inset-x-0 bottom-0 top-1 rounded-lg', v.edge)} />
          <Animated.View style={raised.faceStyle}>
            <View className={cn(faceClass, 'bg-wax')}>
              <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, raised.litStyle]}
              >
                <View className={cn('flex-1 rounded-lg', v.face)} />
              </Animated.View>
              {content}
            </View>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={variant === 'danger' ? flat.dimStyle : undefined}>
          <View className={cn(faceClass, off ? 'bg-wax' : v.face)}>
            {variant !== 'danger' && !off ? (
              <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, flat.waxStyle]}>
                {/* Inside the secondary's 2pt border the corner is 2pt tighter. */}
                <View
                  className={cn(
                    'flex-1 bg-wax',
                    variant === 'secondary' ? 'rounded-[18px]' : 'rounded-lg',
                  )}
                />
              </Animated.View>
            ) : null}
            {content}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}
