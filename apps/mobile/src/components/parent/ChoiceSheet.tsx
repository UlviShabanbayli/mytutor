import { Pressable, View } from 'react-native';
import { Icon, Sheet, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type Choice<T extends string> = { value: T; label: string };

type ChoiceSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  /** One line under the title, when the choice needs explaining. */
  body?: string;
  choices: readonly Choice<T>[];
  value: T;
  onChoose: (value: T) => void;
  onClose: () => void;
};

/** A bottom sheet with one-of-many choices (language, appearance, role); the current is ticked. */
export function ChoiceSheet<T extends string>({
  visible,
  title,
  body,
  choices,
  value,
  onChoose,
  onClose,
}: ChoiceSheetProps<T>) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {body ? <Text tone="muted">{body}</Text> : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={title} className="gap-1.5">
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <Pressable
              key={choice.value}
              accessibilityRole="radio"
              accessibilityLabel={choice.label}
              accessibilityState={{ checked: selected }}
              onPress={() => onChoose(choice.value)}
              className={cn(
                'min-h-14 flex-row items-center gap-3 rounded-lg border-2 px-3.5',
                selected ? 'border-honey bg-raised' : 'border-border bg-surf active:bg-wax',
              )}
            >
              <Text className="min-w-0 flex-1 font-sans-bold">{choice.label}</Text>
              {selected ? <Icon name="check" size={20} color="honey-text" /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
