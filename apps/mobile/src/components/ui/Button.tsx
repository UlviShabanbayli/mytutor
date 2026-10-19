import { Pressable, type PressableProps, View } from 'react-native';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'spot' | 'secondary' | 'text' | 'danger';

type VariantStyle = {
  face: string;
  /** The darker edge under a raised button; absent on flat ones. */
  edge?: string;
  label: string;
  dot: string;
  content: ColorName;
  caps: boolean;
};

const variants: Record<ButtonVariant, VariantStyle> = {
  primary: {
    face: 'bg-honey',
    edge: 'bg-honey-deep',
    label: 'text-on-honey',
    dot: 'bg-on-honey',
    content: 'on-honey',
    caps: true,
  },
  // Inverted card colors: "Davam et"-type actions on a light page.
  spot: {
    face: 'bg-spot',
    edge: 'bg-honey-deep',
    label: 'text-on-spot',
    dot: 'bg-on-spot',
    content: 'on-spot',
    caps: true,
  },
  secondary: {
    face: 'border-2 border-border bg-transparent',
    label: 'text-ink',
    dot: 'bg-ink',
    content: 'ink',
    caps: false,
  },
  text: {
    face: 'bg-transparent',
    label: 'text-honey-text',
    dot: 'bg-honey-text',
    content: 'honey-text',
    caps: false,
  },
  // Page color on the error red: near-white in light mode, near-black on dark mode's lighter
  // red, so the label keeps 4.5:1 in both (design: "Təhlükəli: hesabı sil").
  danger: { face: 'bg-err', label: 'text-page', dot: 'bg-page', content: 'page', caps: false },
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

/** Three dots instead of a spinner while the action runs (design "busy" state). */
function BusyDots({ dot }: { dot: string }) {
  return (
    <View className="flex-row gap-1.5" accessibilityElementsHidden>
      <View className={cn('h-2 w-2 rounded-full', dot)} />
      <View className={cn('h-2 w-2 rounded-full opacity-60', dot)} />
      <View className={cn('h-2 w-2 rounded-full opacity-30', dot)} />
    </View>
  );
}

/**
 * Raised buttons sit on a 4pt edge of a darker tone and sink onto it while pressed;
 * disabled buttons are flat wax with locked-ink text.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || loading;
  const off = disabled === true;
  const v = variants[variant];
  const raised = v.edge !== undefined && !off;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={className}
      {...props}
    >
      {({ pressed }) => (
        <View className={cn('rounded-lg', raised && cn('pb-1', v.edge))}>
          <View
            className={cn(
              'flex-row items-center justify-center gap-2 rounded-lg px-5',
              size === 'lg' ? 'h-14' : 'min-h-touch',
              off ? 'bg-wax' : v.face,
              raised && pressed && !loading && 'translate-y-1',
              !raised && pressed && 'opacity-80',
            )}
          >
            {loading ? (
              <BusyDots dot={v.dot} />
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
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
