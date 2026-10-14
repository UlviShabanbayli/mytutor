import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui';

type OpenAnswerInputProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

/** Where the student types the number an open question asks for. */
export function OpenAnswerInput({ value, disabled, onChange, onSubmit }: OpenAnswerInputProps) {
  const { t } = useTranslation();
  return (
    <Input
      label={t('session.answerLabel')}
      hint={t('session.answerHint')}
      value={value}
      editable={!disabled}
      onChangeText={onChange}
      onSubmitEditing={onSubmit}
      keyboardType="numbers-and-punctuation"
      returnKeyType="done"
      autoCorrect={false}
      autoCapitalize="none"
    />
  );
}
