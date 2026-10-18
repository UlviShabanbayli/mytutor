import { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Sheet } from '@/components/ui';

type NameSheetProps = {
  visible: boolean;
  title: string;
  label: string;
  placeholder?: string;
  errorText: string;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (value: string, done: () => void) => void;
  onClose: () => void;
};

/** A sheet with one required text field (new group). */
export function NameSheet({
  visible,
  title,
  label,
  placeholder,
  errorText,
  submitLabel,
  loading,
  onSubmit,
  onClose,
}: NameSheetProps) {
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);
  const submit = () => {
    if (value.trim().length === 0) {
      setShowError(true);
      return;
    }
    onSubmit(value.trim(), () => {
      setValue('');
      onClose();
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-3">
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={(v) => {
            setValue(v);
            setShowError(false);
          }}
          error={showError ? errorText : undefined}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Button label={submitLabel} loading={loading} onPress={submit} />
      </View>
    </Sheet>
  );
}
