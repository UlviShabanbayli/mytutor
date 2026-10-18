import { Pressable, View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type MenuRowProps = {
  icon: IconName;
  label: string;
  /** Muted value on the right ("Riyaziyyat 7", "Pulsuz"). */
  value?: string;
  /** Honey count pill ("3 yeni"). */
  badge?: string;
  /** Needs an account: wax icon, locked ink and the lock note instead of a chevron. */
  lockedNote?: string;
  accessibilityHint?: string;
  divider?: boolean;
  onPress: () => void;
};

/** One row of the "Mən" menu: icon tile, label, value or badge, chevron. */
export function MenuRow({
  icon,
  label,
  value,
  badge,
  lockedNote,
  accessibilityHint,
  divider = false,
  onPress,
}: MenuRowProps) {
  const locked = lockedNote !== undefined;
  const a11y = [label, badge ?? value, lockedNote].filter(Boolean).join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className={cn(
        'min-h-touch flex-row items-center gap-3 px-3 py-1.5 active:bg-wax',
        divider && 'border-t border-border',
      )}
    >
      <View
        className={cn(
          'h-8 w-8 items-center justify-center rounded-sm',
          locked ? 'bg-wax' : 'bg-raised',
        )}
      >
        <Icon name={icon} size={18} color={locked ? 'lock-ink' : 'honey-text'} />
      </View>
      <Text className={cn('flex-1 font-sans-bold', locked && 'text-lock-ink')} numberOfLines={1}>
        {label}
      </Text>
      {badge ? (
        <View className="rounded-full bg-honey px-2 py-[3px]">
          <Text className="font-sans-black text-xs text-on-honey">{badge}</Text>
        </View>
      ) : null}
      {value ? (
        <Text className="shrink font-sans-semibold text-sm text-muted" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {locked ? (
        <View className="flex-row items-center gap-1">
          <Icon name="lock" size={14} color="lock-ink" />
          <Text className="font-sans-bold text-xs text-lock-ink">{lockedNote}</Text>
        </View>
      ) : (
        <Icon name="chevron" size={18} color="muted" />
      )}
    </Pressable>
  );
}
