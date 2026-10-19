import { Pressable, View } from 'react-native';
import { Icon, Sheet, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ChoiceSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  hint?: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  onClose: () => void;
};

/** Pick one of a few values in a sheet (language, quiet hours); closes on choice. */
export function ChoiceSheet<T extends string>({
  visible,
  title,
  hint,
  options,
  value,
  onChange,
  onClose,
}: ChoiceSheetProps<T>) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {hint ? <Text tone="muted">{hint}</Text> : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={title}>
        {options.map((o, i) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => {
                onChange(o.value);
                onClose();
              }}
              className={cn(
                'min-h-touch flex-row items-center gap-3 py-2',
                i > 0 && 'border-t border-border',
              )}
            >
              <Text className={cn('flex-1', selected ? 'font-sans-black' : 'font-sans-semibold')}>
                {o.label}
              </Text>
              {selected ? <Icon name="check" size={20} color="honey-text" /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
