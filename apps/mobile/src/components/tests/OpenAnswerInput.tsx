import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { NumericKeypad } from '@/components/study/NumericKeypad';
import {
  applyNumericKey,
  deleteLastDigit,
  displayNumber,
  sanitizeNumeric,
} from '@/features/study/numericInput';
import { cn } from '@/lib/cn';

type OpenAnswerInputProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

/**
 * Where the student enters the number an open question asks for: a large field and the app's
 * own keypad (the system keyboard stays closed; a hardware keyboard still types).
 */
export function OpenAnswerInput({ value, disabled, onChange, onSubmit }: OpenAnswerInputProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2 pt-1">
      <Text variant="label">{t('study.test.numberLabel')}</Text>
      <View className={cn('rounded-lg', !disabled && 'bg-honey-deep pb-[3px]')}>
        <View
          className={cn(
            'min-h-16 flex-row items-center gap-2 rounded-lg border-2 bg-surf pl-4 pr-1.5',
            disabled ? 'border-border' : 'border-honey',
          )}
        >
          <TextInput
            accessibilityLabel={t('study.test.numberLabel')}
            accessibilityHint={t('study.test.numberHint')}
            value={displayNumber(value)}
            editable={!disabled}
            onChangeText={(text) => onChange(sanitizeNumeric(text))}
            onSubmitEditing={onSubmit}
            inputMode="none"
            showSoftInputOnFocus={false}
            autoCorrect={false}
            className="min-h-14 flex-1 font-display-black text-2xl text-ink"
          />
          {value && !disabled ? (
            <IconButton
              icon="x"
              accessibilityLabel={t('study.test.deleteDigit')}
              onPress={() => onChange(deleteLastDigit(value))}
            />
          ) : null}
        </View>
      </View>
      <Text variant="caption" tone="muted">
        {t('study.test.numberHint')}
      </Text>
      {disabled ? null : <NumericKeypad onKey={(key) => onChange(applyNumericKey(value, key))} />}
    </View>
  );
}
