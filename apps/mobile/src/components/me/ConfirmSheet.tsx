import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, Text } from '@/components/ui';

type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  /** Red confirm for actions that cannot be undone (delete account). */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** "Are you sure?" as a bottom sheet: the plain consequence, then confirm or cancel. */
export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <Text tone="muted">{body}</Text>
      <View className="gap-2">
        <Button
          label={confirmLabel}
          variant={danger ? 'danger' : 'secondary'}
          size="md"
          onPress={() => {
            onClose();
            onConfirm();
          }}
        />
        <Button label={t('me.shared.cancel')} variant="text" size="md" onPress={onClose} />
      </View>
    </Sheet>
  );
}
