import { type ReactNode, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatNational, nationalDigits } from '@/features/auth/phone';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

export type FieldMessage = { tone: 'info' | 'err'; text: string };

type PhoneFieldProps = {
  label: string;
  /** National digits only ("501234567"); the field shows them grouped. */
  digits: string;
  onChangeDigits: (digits: string) => void;
  message?: FieldMessage | null;
  editable?: boolean;
  /** Shown inside the field on the right (the "sent" check). */
  trailing?: ReactNode;
  autoFocus?: boolean;
  onSubmit?: () => void;
};

/** A mobile number after a fixed +994: digits only, grouped "50 123 45 67", a live hint. */
export function PhoneField({
  label,
  digits,
  onChangeDigits,
  message,
  editable = true,
  trailing,
  autoFocus,
  onSubmit,
}: PhoneFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View className="flex-row gap-2">
        <View className="h-14 items-center justify-center rounded-md border-2 border-border bg-raised px-3">
          <Text className="font-sans-black text-md">{t('onboarding.phone.countryCode')}</Text>
        </View>
        <View
          className={cn(
            'h-14 min-w-0 flex-1 flex-row items-center rounded-md border-2 bg-surf px-3.5',
            message?.tone === 'err' ? 'border-err' : focused ? 'border-honey' : 'border-border',
          )}
        >
          <TextInput
            accessibilityLabel={label}
            accessibilityHint={message?.text}
            value={formatNational(digits)}
            onChangeText={(text) => onChangeDigits(nationalDigits(text))}
            editable={editable}
            autoFocus={autoFocus}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('onboarding.phone.placeholder')}
            placeholderTextColor={colors['lock-ink']}
            className="h-full min-w-0 flex-1 font-sans-bold text-lg tracking-[0.8px] text-ink"
          />
          {trailing}
        </View>
      </View>
      {message ? (
        <View className="flex-row items-center gap-1.5" accessibilityLiveRegion="polite">
          <Icon
            name={message.tone === 'err' ? 'warning' : 'info'}
            size={16}
            color={message.tone === 'err' ? 'err' : 'info'}
          />
          <Text variant="caption" tone={message.tone} className="flex-1">
            {message.text}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
