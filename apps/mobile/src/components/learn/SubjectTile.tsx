import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { FlatHex } from './FlatHex';

type SubjectTileProps = {
  name: string;
  /** Two letters in the hexagon ("Az", "Fi"). */
  monogram: string;
  /** Under the name: "Hazırlanır" for subjects without content, else e.g. "145 sual". */
  meta: string;
  ready: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  className?: string;
};

/** A subject as a monogram cell with its name and state (design: "Digər fənlər"). */
export function SubjectTile({
  name,
  monogram,
  meta,
  ready,
  accessibilityLabel,
  onPress,
  className,
}: SubjectTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'min-h-[76px] min-w-0 flex-row items-center gap-2.5 rounded-lg border border-border bg-surf py-2.5 pl-3 pr-2.5 active:opacity-80',
        className,
      )}
    >
      <FlatHex size={40} color={ready ? 'honey' : 'wax'}>
        <Text className={cn('font-sans-black text-sm', ready ? 'text-on-honey' : 'text-lock-ink')}>
          {monogram}
        </Text>
      </FlatHex>
      <View className="min-w-0 flex-1 items-start gap-1">
        <Text className="font-sans-black text-base leading-[18px]">{name}</Text>
        <View className="h-[22px] flex-row items-center gap-1 rounded-full bg-raised px-2">
          <Icon name={ready ? 'check' : 'clock'} size={12} color={ready ? 'honey-text' : 'muted'} />
          <Text
            className={cn('font-sans-black text-2xs', ready ? 'text-honey-text' : 'text-muted')}
          >
            {meta}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
