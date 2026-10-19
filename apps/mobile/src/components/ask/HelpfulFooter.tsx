import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName, Text } from '@/components/ui';
import type { Feedback } from '@/features/ask/store';
import { cn } from '@/lib/cn';

type HelpfulFooterProps = {
  value: Feedback | undefined;
  onChange: (value: Feedback) => void;
};

function Choice(props: {
  icon: IconName;
  label: string;
  tone: 'ok' | 'err';
  pressed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={{ selected: props.pressed }}
      onPress={props.onPress}
      className={cn(
        'min-h-touch flex-row items-center gap-1.5 rounded-md border-2 px-3',
        props.pressed ? 'border-honey bg-raised' : 'border-border',
      )}
    >
      <Icon name={props.icon} size={16} color={props.tone} />
      <Text className="font-sans-bold text-sm">{props.label}</Text>
    </Pressable>
  );
}

/** "Kömək etdi?" under an answer: the teacher sees the student's feedback. */
export function HelpfulFooter({ value, onChange }: HelpfulFooterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row flex-wrap items-center gap-2 border-t border-border bg-surf px-4 pt-2.5"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <Text
        accessibilityLiveRegion="polite"
        className={cn('flex-1 font-sans-bold', value && 'text-sm text-muted')}
      >
        {value ? t('ask.answer.thanks') : t('ask.answer.helped')}
      </Text>
      <Choice
        icon="check"
        tone="ok"
        label={t('ask.answer.helpedYes')}
        pressed={value === 'yes'}
        onPress={() => onChange('yes')}
      />
      <Choice
        icon="x"
        tone="err"
        label={t('ask.answer.helpedNo')}
        pressed={value === 'no'}
        onPress={() => onChange('no')}
      />
    </View>
  );
}
