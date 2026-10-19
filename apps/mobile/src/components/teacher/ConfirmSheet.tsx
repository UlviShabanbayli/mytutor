import { View } from 'react-native';
import { Button, Sheet, Text } from '@/components/ui';

type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
};

/** Asks once before an action that cannot be undone from here. */
export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  danger = false,
}: ConfirmSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-3">
        <Text tone="muted">{body}</Text>
        <Button
          label={confirmLabel}
          variant={danger ? 'danger' : 'primary'}
          onPress={() => {
            onClose();
            onConfirm();
          }}
        />
        <Button label={cancelLabel} variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}
