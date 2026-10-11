import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AnswerOption } from '@mytutor/types';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'dimmed';

const styles: Record<
  OptionState,
  { edge: string; face: string; badge: string; badgeText: string }
> = {
  idle: {
    edge: 'bg-border',
    face: 'border-border bg-card',
    badge: 'bg-muted',
    badgeText: 'text-muted-foreground',
  },
  selected: {
    edge: 'bg-primary-shadow',
    face: 'border-primary bg-secondary',
    badge: 'bg-primary',
    badgeText: 'text-primary-foreground',
  },
  correct: {
    edge: 'bg-success-shadow',
    face: 'border-success bg-success-muted',
    badge: 'bg-success',
    badgeText: 'text-success-foreground',
  },
  incorrect: {
    edge: 'bg-destructive-shadow',
    face: 'border-destructive bg-destructive-muted',
    badge: 'bg-destructive',
    badgeText: 'text-destructive-foreground',
  },
  dimmed: {
    edge: 'bg-border',
    face: 'border-border bg-card opacity-60',
    badge: 'bg-muted',
    badgeText: 'text-muted-foreground',
  },
};

type OptionButtonProps = {
  option: AnswerOption;
  state: OptionState;
  disabled: boolean;
  onPress: () => void;
};

export function OptionButton({ option, state, disabled, onPress }: OptionButtonProps) {
  const { t } = useTranslation();
  const s = styles[state];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={t('session.optionLabel', { key: option.key, text: option.text })}
      accessibilityState={{
        selected: state === 'selected' || state === 'correct' || state === 'incorrect',
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      className={cn('rounded-lg pb-1', s.edge)}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'min-h-14 flex-row items-center gap-3 rounded-lg border-2 px-3 py-3',
            s.face,
            pressed && !disabled && 'translate-y-1',
          )}
        >
          <View className={cn('h-9 w-9 items-center justify-center rounded-md', s.badge)}>
            {/* Icons make correctness clear without relying on color alone. */}
            {state === 'correct' ? (
              <Icon name="checkmark" size={20} color="success-foreground" />
            ) : state === 'incorrect' ? (
              <Icon name="close" size={20} color="destructive-foreground" />
            ) : (
              <Text className={cn('font-sans-black text-base', s.badgeText)}>{option.key}</Text>
            )}
          </View>
          <Text variant="body" className="flex-1 font-sans-medium">
            {option.text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
