import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ChoiceRowProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

/** One option of a single-choice list (a radio): title, a line of help and a round check. */
export function ChoiceRow({ title, subtitle, selected, onPress }: ChoiceRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${title}, ${subtitle}`}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={cn('rounded-lg pb-[3px]', selected ? 'bg-honey-deep' : 'bg-border')}
    >
      <View
        className={cn(
          'min-h-14 flex-row items-center gap-3 rounded-lg border-2 px-3.5 py-1.5',
          selected ? 'border-honey bg-raised' : 'border-border bg-surf',
        )}
      >
        <View className="min-w-0 flex-1">
          <Text className="font-sans-black text-base">{title}</Text>
          <Text tone="muted" className="text-xs">
            {subtitle}
          </Text>
        </View>
        <View
          className={cn(
            'h-[26px] w-[26px] items-center justify-center rounded-full',
            selected ? 'bg-honey' : 'border-2 border-border',
          )}
        >
          {selected ? <Icon name="check" size={16} color="on-honey" /> : null}
        </View>
      </View>
    </Pressable>
  );
}
