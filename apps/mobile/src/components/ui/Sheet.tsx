import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Read by screen readers as the dialog name; shown as the sheet's heading when `showTitle`. */
  title: string;
  showTitle?: boolean;
  children: ReactNode;
};

/** Bottom sheet: scrim, 28pt top corners, a 40×5 grab handle; tapping the scrim closes it. */
export function Sheet({ visible, onClose, title, showTitle = true, children }: SheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          className="absolute inset-0 bg-scrim"
        />
        <View
          accessibilityViewIsModal
          accessibilityLabel={title}
          className="gap-4 rounded-t-3xl bg-surf px-4 pt-2.5"
          // The home indicator inset is device-specific, so it cannot be a static className.
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="h-[5px] w-10 self-center rounded-full bg-border" />
          {showTitle ? <Text variant="heading">{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
