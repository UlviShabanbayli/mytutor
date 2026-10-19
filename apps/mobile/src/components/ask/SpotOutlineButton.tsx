import { Pressable, View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type SpotOutlineButtonProps = {
  label: string;
  icon?: IconName;
  /** Small muted text on the right, e.g. "1 qalıb". */
  trailing?: string;
  onPress: () => void;
  /** Row style: left-aligned label, as in lists of options. */
  align?: 'center' | 'start';
  /** `link`: no border, honey label (a quiet extra action). */
  variant?: 'outline' | 'link';
  className?: string;
};

/**
 * Outlined button for the dark `spot` grounds (camera, crop, premium card), where the
 * secondary Button's ink label would vanish.
 */
export function SpotOutlineButton({
  label,
  icon,
  trailing,
  onPress,
  align = 'center',
  variant = 'outline',
  className,
}: SpotOutlineButtonProps) {
  const link = variant === 'link';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={trailing ? `${label}, ${trailing}` : label}
      onPress={onPress}
      className={cn(
        'min-h-touch flex-row items-center gap-2.5 rounded-md px-3 active:opacity-80',
        !link && 'border-2 border-spot-line',
        align === 'center' ? 'justify-center' : 'justify-start',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={link ? 16 : 20} color="honey" /> : null}
      <Text className={cn('font-sans-black text-on-spot', align === 'start' && 'flex-1')}>
        {label}
      </Text>
      {trailing ? (
        <View>
          <Text className="font-sans-semibold text-xs text-on-spot/75">{trailing}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
