import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type LockedNoteProps = {
  title?: string;
  body: string;
  /** `boxed`: the lock sits in a wax square (subject screen); `inline`: a plain lock. */
  variant?: 'boxed' | 'inline';
  className?: string;
};

/**
 * Something the child keeps private, shown calmly in a dashed outline: "Bu, onun seçimidir."
 * Never a wall or a warning.
 */
export function LockedNote({ title, body, variant = 'inline', className }: LockedNoteProps) {
  return (
    <View
      accessible
      className={cn(
        'flex-row items-start gap-2.5 rounded-lg border border-dashed border-border px-3 py-2.5',
        className,
      )}
    >
      {variant === 'boxed' ? (
        <View className="h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-wax">
          <Icon name="lock" size={18} color="lock-ink" />
        </View>
      ) : (
        <View className="pt-px">
          <Icon name="lock" size={18} color="lock-ink" />
        </View>
      )}
      <View className="min-w-0 flex-1 gap-0.5">
        {title ? <Text className="font-sans-black text-sm text-lock-ink">{title}</Text> : null}
        <Text className="text-sm text-lock-ink">{body}</Text>
      </View>
    </View>
  );
}
