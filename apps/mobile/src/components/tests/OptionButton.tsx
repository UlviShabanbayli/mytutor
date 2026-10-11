import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AnswerOption } from '@mytutor/types';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'dimmed';

// A 2pt border in every state, so choosing an option never shifts the layout.
const styles: Record<OptionState, { face: string; badge: string; badgeText: string }> = {
  idle: {
    face: 'border-border bg-card active:bg-muted',
    badge: 'bg-muted',
    badgeText: 'text-muted-foreground',
  },
  selected: {
    face: 'border-primary bg-secondary',
    badge: 'bg-primary',
    badgeText: 'text-primary-foreground',
  },
  correct: {
    face: 'border-success bg-success-muted',
    badge: 'bg-success',
    badgeText: 'text-success-foreground',
  },
  incorrect: {
    face: 'border-destructive bg-destructive-muted',
    badge: 'bg-destructive',
    badgeText: 'text-destructive-foreground',
  },
  dimmed: {
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
      className={cn(
        'min-h-14 flex-row items-center gap-3.5 rounded-md border-2 px-3.5 py-3',
        s.face,
      )}
    >
      <View className={cn('h-8 w-8 items-center justify-center rounded-full', s.badge)}>
        <Text className={cn('font-sans-black text-sm', s.badgeText)}>{option.key}</Text>
      </View>
      <Text variant="body" className="flex-1 font-sans-medium text-lg">
        {option.text}
      </Text>
      {/* Icons make correctness clear without relying on color alone. */}
      {state === 'correct' ? <Icon name="checkmark" size={22} color="success" /> : null}
      {state === 'incorrect' ? <Icon name="close" size={22} color="destructive" /> : null}
    </Pressable>
  );
}
